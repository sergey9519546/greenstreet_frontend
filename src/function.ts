import { onRequest } from "firebase-functions/v2/https";
import type { Request, Response } from "express";
import { app, sendStructuredError } from "./serverApp";

export function handleApiRequest(request: Request, response: Response): void {
  try {
    app(request, response);
  } catch (error) {
    if (response.headersSent) {
      response.end();
      return;
    }
    sendStructuredError(response, error);
  }
}

// Wrap the Express app as a Firebase Cloud Function (v2)
export const api = onRequest(
  {
    region: "us-central1",
    memory: "1GiB",
    timeoutSeconds: 60,
    maxInstances: 10,
  },
  handleApiRequest,
);
