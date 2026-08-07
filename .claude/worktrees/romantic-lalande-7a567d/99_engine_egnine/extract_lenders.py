import re
with open(r'C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\99_engine_egnine\src\lib\dscr\lenders.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# Find by id, then extract nearby fields
ids = re.findall(r"id:\s*'([a-z_]+)'", content)
print(f'Total lender IDs: {len(ids)}')
for lender_id in ids[:30]:
    # Find a chunk starting at this id
    idx = content.find(f"id: '{lender_id}'")
    chunk = content[idx:idx+3000]
    name_m = re.search(r"name:\s*'([^']+)'", chunk)
    fico_m = re.search(r"minFICO:\s*(\d+)", chunk)
    ltv_m = re.search(r"maxLTV:\s*(\d+)", chunk)
    dscr_m = re.search(r"minDSCR:\s*([\d.]+)", chunk)
    max_m = re.search(r"loanAmountMax:\s*(\d[\d_]*)", chunk)
    conf_m = re.search(r"confidenceScore:\s*(\d+)", chunk)
    print(f'{lender_id:25} {(name_m.group(1) if name_m else "?"):25} FICO {(fico_m.group(1) if fico_m else "?"):>4}  LTV {(ltv_m.group(1) if ltv_m else "?"):>3}  DSCR {(dscr_m.group(1) if dscr_m else "?"):>5}  Max ${(int(max_m.group(1).replace("_","")) if max_m else 0):>10,}  Conf {(conf_m.group(1) if conf_m else "?"):>3}')
