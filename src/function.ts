import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import { app } from "./serverApp";

const leadNotificationWebhookUrl = defineSecret("LEAD_NOTIFICATION_WEBHOOK_URL");
const leadNotificationWebhookToken = defineSecret("LEAD_NOTIFICATION_WEBHOOK_TOKEN");

// Wrap the Express app as a Firebase Cloud Function (v2)
export const api = onRequest(
  {
    region: "us-central1",
    memory: "1GiB",
    timeoutSeconds: 60,
    maxInstances: 10,
    secrets: [leadNotificationWebhookUrl, leadNotificationWebhookToken],
  },
  app
);
