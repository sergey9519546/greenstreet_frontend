// @ts-expect-error - firebase-functions v2 optional server dependency
import { onRequest } from "firebase-functions/v2/https";
import { app } from "./serverApp";

// Wrap the Express app as a Firebase Cloud Function (v2)
export const api = onRequest(
  {
    region: "us-central1",
    memory: "1GiB",
    timeoutSeconds: 60,
    maxInstances: 10,
  },
  app
);
