import { Router } from "express";
import { z } from "zod";
import { logger } from "../logger";
import { getAdminFirestore } from "../services/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

// Every string is capped. These records are the queue that outbound email is
// meant to be built from (see the dispatch comment below), so an uncapped field
// is an uncapped email body, and an uncapped Firestore write besides. The only
// other ceiling is express.json({limit:"100kb"}), which one field can consume
// entirely.
export const SdrDispatchSchema = z.object({
  dealId: z.string().min(1).max(128),
  address: z.string().min(1).max(200),
  city: z.string().max(100),
  state: z.string().max(64),
  estimatedValue: z.number().positive().finite().max(1_000_000_000),
  distressReason: z.string().max(500).optional(),
});

export const sdrRouter = Router();

sdrRouter.post("/dispatch", async (req, res) => {
  const parsed = SdrDispatchSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid SDR dispatch payload" });
    return;
  }

  const { dealId, address, city, state, estimatedValue, distressReason } = parsed.data;

  try {
    // In a real application, this is where we would trigger Make/n8n/Instantly
    // using the AI SDR strategy (e.g. sending to Instantly API for a personalized sequence).
    // For now, we simulate the orchestration by persisting the outreach record to Firestore.
    const outreachRecord = {
      dealId,
      address,
      city,
      state,
      estimatedValue,
      distressReason,
      status: "dispatched",
      dispatchedAt: FieldValue.serverTimestamp(),
      campaign: "distressed_pre_approval",
    };

    await getAdminFirestore()
      .collection("sdr_outreach")
      .add(outreachRecord);

    // Deliberately not logging `address`: it is a real distressed-property
    // street address, the pino redact list (src/logger.ts) does not cover it,
    // and a serverless aggregator retains whatever reaches stdout. dealId is
    // enough to correlate a dispatch with its record. Same reasoning as
    // error.ts ("Never pass the raw error or request into the logger").
    logger.info({ dealId }, "AI SDR email dispatched to orchestration queue");

    res.status(202).json({ success: true, message: "SDR Outreach Sequence Triggered" });
  } catch (error) {
    logger.error({ error, dealId }, "Failed to dispatch SDR email");
    res.status(500).json({ error: "Failed to dispatch outreach" });
  }
});
