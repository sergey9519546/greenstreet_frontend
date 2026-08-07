# TimesFM 2.5 LoRA Upgrade Blueprint
## DSCR Sovereign OS — Phase 3 Upgrade Path

**Current Mode:** ICF (In-Context Fine-Tuning) — zero training data, CPU-only  
**Upgrade Trigger:** 500+ property-months accumulated in `property_rent_history.json`  
**Last Checked:** See `timesfm_icf_pipeline.py status` output

---

## Why LoRA, Not Full Fine-Tuning

The two documents confirm the same answer:

| Approach | Cost | Accuracy | Risk |
|---|---|---|---|
| **ICF (current)** | Zero | Good (few-shot) | None — no training |
| **LoRA (Phase 3)** | Low (~66% cheaper than QLoRA) | +40.1 pts over base (FinLoRA benchmark) | Low — attention-only adapters |
| **Full fine-tuning** | High | Marginal gain over LoRA | High — overfitting, portability loss |

**The verdict:** LoRA is the sweet spot. Freeze the 200M-param TimesFM 2.5 base. Attach thin adapters to attention projections only. Train on your accumulated DSCR rent histories. Deploy by saving only the adapter (~10–50MB).

---

## Upgrade Checklist

### Step 0: Verify Data Threshold
```bash
python3 /home/ubuntu/dscr_improvement_loop/timesfm_icf_pipeline.py status
```
Must show `total_property_months >= 500` before proceeding.

### Step 1: Provision GPU Instance
- Minimum: **A10G (24GB VRAM)** — runs TimesFM 2.5 LoRA comfortably in fp16
- Recommended: **A100 (40GB VRAM)** — faster training, larger batch sizes
- Cloud options: AWS `g5.xlarge` (A10G), GCP `a2-highgpu-1g` (A100)
- Estimated training time: **15–45 minutes** for 500–2,000 property-months on A10G

### Step 2: Install Dependencies
```bash
pip install timesfm[torch] timesfm[xreg]
pip install peft transformers
```
Or from source:
```bash
git clone https://github.com/google-research/timesfm.git
cd timesfm
uv pip install -e ".[torch,xreg]"
uv pip install peft transformers
```

### Step 3: Prepare Training Data
```python
# Load from property_rent_history.json
import json
with open('/home/ubuntu/dscr_improvement_loop/property_rent_history.json') as f:
    db = json.load(f)

# Build training dataset
# Target: monthly rent (or log returns for stability)
# Option A (simpler): y_t = monthly_rent_t
# Option B (recommended): y_t = log(rent_t / rent_{t-1})

import torch
from torch.utils.data import Dataset

class DSCRRentDataset(Dataset):
    def __init__(self, properties: dict, context_len: int = 24, horizon: int = 12):
        self.samples = []
        for pid, prop in properties.items():
            history = prop["rent_history"]
            sofr    = prop.get("sofr_history", [])
            vacancy = prop.get("vacancy_history", [])
            
            # Slide a window across the history
            for start in range(0, len(history) - context_len - horizon + 1, 1):
                ctx = history[start:start + context_len]
                tgt = history[start + context_len:start + context_len + horizon]
                
                # Covariates (anti-leakage: only past vacancy, future SOFR from NSS)
                cov_sofr    = sofr[start:start + context_len + horizon] if sofr else [0.036] * (context_len + horizon)
                cov_vacancy = vacancy[start:start + context_len] if vacancy else [0.05] * context_len
                
                self.samples.append((ctx, cov_sofr, cov_vacancy, tgt))
    
    def __len__(self): return len(self.samples)
    def __getitem__(self, idx):
        ctx, cov_sofr, cov_vacancy, tgt = self.samples[idx]
        return (
            torch.tensor(ctx, dtype=torch.float32),
            torch.tensor(cov_sofr, dtype=torch.float32),
            torch.tensor(cov_vacancy, dtype=torch.float32),
            torch.tensor(tgt, dtype=torch.float32),
        )
```

### Step 4: Attach LoRA Adapters
```python
import timesfm
from peft import LoraConfig, get_peft_model, TaskType

# Load base model
tfm = timesfm.TimesFm(
    hparams=timesfm.TimesFmHparams(
        backend="gpu",
        per_core_batch_size=32,
        horizon_len=12,
        num_layers=50,
        model_dims=1280,
    ),
    checkpoint=timesfm.TimesFmCheckpoint(
        huggingface_repo_id="google/timesfm-2.0-500m-pytorch"
    ),
)

# LoRA config — DSCR production settings
# Attach to attention projections ONLY (do NOT touch time embeddings or quantile head)
lora_config = LoraConfig(
    r=16,                          # rank — 16 for DSCR production
    lora_alpha=32,                 # scaling = 2.0 (standard, stable)
    target_modules=["q_proj", "v_proj"],  # attention-only
    lora_dropout=0.05,             # regularization without killing signal
    bias="none",
    task_type=TaskType.FEATURE_EXTRACTION,
)

model = get_peft_model(tfm.model, lora_config)
model.print_trainable_parameters()
# Expected: ~0.1–0.5% of total params — this is correct
```

### Step 5: Training Loop
```python
from transformers import TrainingArguments, Trainer
import torch

training_args = TrainingArguments(
    output_dir="./timesfm_dscr_lora",
    num_train_epochs=3,            # 1–3 epochs; more overfits fast on financial data
    per_device_train_batch_size=16,
    per_device_eval_batch_size=16,
    learning_rate=1e-4,            # lower than LLM fine-tuning; financial series are smooth
    warmup_steps=50,
    weight_decay=0.01,
    logging_steps=20,
    eval_strategy="epoch",
    save_strategy="epoch",
    load_best_model_at_end=True,
    metric_for_best_model="eval_loss",  # early stop on QUANTILE loss, not just MAE
    fp16=torch.cuda.is_available(),     # mixed precision on GPU
    dataloader_num_workers=4,
    seed=42,
)

# Loss: MAE (point) + Pinball (quantile P10/P50/P90)
# L = MAE(y_hat, y) + sum_{tau in {0.1, 0.5, 0.9}} PinballLoss_tau(q_tau, y)
```

### Step 6: Temporal Cross-Validation (CRITICAL — no shuffling across time)
```python
# Split by TIME, not randomly
# Train: 2015–2024 vintages
# Validate: 2025+ vintages
# Hold-out: coastal markets + Sun Belt (geographic generalization test)

# This ensures the model generalizes from pre-2022 rate regime to post-2022 rates
# NOT memorizing noise from a specific market cycle
```

### Step 7: Save and Deploy
```python
# Save only the adapter (~10–50 MB)
model.save_pretrained("./timesfm_dscr_lora_adapter")

# For production: merge LoRA into base weights (single model, faster inference)
merged = model.merge_and_unload()
merged.save_pretrained("./timesfm_dscr_merged")

# Copy to cloud computer
# scp -r ./timesfm_dscr_merged ubuntu@136.118.64.182:/home/ubuntu/dscr_improvement_loop/timesfm_model/
```

### Step 8: Update Pipeline Config
```python
# In timesfm_icf_pipeline.py, change:
# checkpoint=timesfm.TimesFmCheckpoint(huggingface_repo_id="google/timesfm-2.0-500m-pytorch")
# to:
# checkpoint=timesfm.TimesFmCheckpoint(local_dir="/home/ubuntu/dscr_improvement_loop/timesfm_model")
```

---

## Hyperparameter Cheatsheet (DSCR Production)

| Parameter | Value | Reason |
|---|---|---|
| LoRA rank `r` | **16** | Better quality; 8 if GPU-constrained |
| `lora_alpha` | **32** | Scaling = 2.0 — standard, stable |
| `target_modules` | `["q_proj", "v_proj"]` | Attention-only; fastest convergence |
| Learning rate | **1e-4** | Financial series are smooth; don't need high LR |
| Epochs | **2–3** | More overfits on small financial datasets |
| Context length | **24–48 months** | 2+ years of history is ideal |
| Horizon | **12 months** | 1-year forward rent projection |
| `normalize_inputs` | **True** | MANDATORY — rents vary 3–10× by market |
| `use_continuous_quantile_head` | **True** | Replaces conformal wrapper; gives P10/P90 natively |
| Batch size | **16–32** | Larger = more stable gradients for financial data |
| Minimum training samples | **500 property-months** | Below this, ICF outperforms fine-tuning |
| Optimizer | `adamw_torch` | Do NOT use `paged_adamw_8bit` (LLM-specific) |
| LoRA dropout | **0.05** | Enough regularization without killing signal |

---

## Anti-Leakage Rules (Non-Negotiable)

| Covariate | `is_past` | Reason |
|---|---|---|
| SOFR / Treasury forward rates | `False` | Future values come from NSS curve — deterministic |
| Vacancy rate | `True` | We do NOT know future vacancy |
| Occupancy index | `True` | Past-only |
| Month-of-year (seasonality) | `False` | Deterministic — we know the future calendar |
| STR-ban flags | `False` ONLY if legally enacted | Only if the ban is legally enacted and effective date is known |

**Rule:** Only supply future covariates that come from your NSS/Hull-White forward curve (Module 3), not realized future data.

---

## Integration Architecture (Post-LoRA)

```
TimesFM 2.5 + LoRA Adapter (fine-tuned on DSCR rent histories)
    → point_forecast + quantile_forecast (P10/P50/P90) — 12 months forward
    → feeds rent_margin in Monte Carlo Module 1 (R-vine copula)
    → NO conformal wrapper needed on TimesFM own output (quantile head handles it)
    → STILL apply conformal wrapper on:
        - RentCast AVM point estimates
        - AirDNA STR projections
        - Any thin-market vendor feed

Hierarchy:
  TimesFM fine-tuned output = distributional source of truth for DSCR income paths
  Vendor feeds = corroborating evidence, always conformal-wrapped
```

---

*DSCR Sovereign OS — TimesFM LoRA Upgrade Blueprint*  
*Upgrade trigger: 500 property-months | Current status: run `python3 timesfm_icf_pipeline.py status`*
