import { Router } from "express";
import { z } from "zod";
import { logger } from "../logger";
import { getAdminFirestore } from "../services/firebaseAdmin";
import { FieldValue } from "firebase-admin/firestore";

const SdrDispatchSchema = z.object({
  dealId: z.string().min(1),
  address: z.string().min(1),
  city: z.string(),
  state: z.string(),
  estimatedValue: z.number().positive(),
  distressReason: z.string().optional(),
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

    logger.info({ dealId, address }, "AI SDR email dispatched to orchestration queue");

    res.status(202).json({ success: true, message: "SDR Outreach Sequence Triggered" });
  } catch (error) {
    logger.error({ error, dealId }, "Failed to dispatch SDR email");
    res.status(500).json({ error: "Failed to dispatch outreach" });
  }
});
