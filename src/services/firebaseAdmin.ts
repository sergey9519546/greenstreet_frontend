import { App, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { Firestore, getFirestore } from "firebase-admin/firestore";

let initializationError: Error | undefined;

function serviceAccountFromEnvironment(): Record<string, string> | undefined {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) return undefined;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed !== "object" ||
      !("project_id" in parsed) ||
      !("client_email" in parsed) ||
      !("private_key" in parsed)
    ) {
      throw new Error("service-account JSON is missing required fields");
    }
    return parsed as Record<string, string>;
  } catch {
    // Deliberately never include the raw environment value in an error or log.
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is invalid");
  }
}

/**
 * Uses Firebase's Application Default Credentials by default. That is the
 * supported Cloud Functions convention and also honors GOOGLE_APPLICATION_CREDENTIALS
 * locally. Non-Google hosts can supply the service-account JSON as a deployment
 * secret through FIREBASE_SERVICE_ACCOUNT_JSON; it is never sent to the client.
 */
export function getAdminApp(): App {
  if (initializationError) throw initializationError;
  if (getApps().length > 0) return getApp();

  try {
    const serviceAccount = serviceAccountFromEnvironment();
    return serviceAccount
      ? initializeApp({ credential: cert(serviceAccount) })
      : initializeApp();
  } catch (error) {
    initializationError = error instanceof Error ? error : new Error("firebase-admin initialization failed");
    throw initializationError;
  }
}

export function getAdminFirestore(): Firestore {
  return getFirestore(getAdminApp());
}

export function getAdminAuth() {
  return getAuth(getAdminApp());
}
