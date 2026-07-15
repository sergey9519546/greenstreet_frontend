import { getApps, initializeApp } from "firebase/app";
import type { FirebaseApp, FirebaseOptions } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInAnonymously,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import type { Auth, User } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import type { Firestore } from "firebase/firestore";

function readPublicConfig(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

// These values identify a Firebase web app, but they still must never be logged.
const firebaseConfig: FirebaseOptions = {
  projectId: readPublicConfig(import.meta.env.VITE_FIREBASE_PROJECT_ID),
  appId: readPublicConfig(import.meta.env.VITE_FIREBASE_APP_ID),
  apiKey: readPublicConfig(import.meta.env.VITE_FIREBASE_API_KEY),
  authDomain: readPublicConfig(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN),
  storageBucket: readPublicConfig(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: readPublicConfig(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID),
};

const requiredConfigKeys = [
  "projectId",
  "appId",
  "apiKey",
  "authDomain",
  "storageBucket",
  "messagingSenderId",
] as const;

export type FirebasePublicConfigKey = (typeof requiredConfigKeys)[number];
export type FirebaseUnavailableReason =
  | "missing-config"
  | "configuration-mismatch"
  | "initialization-failed";

export interface FirebaseServices {
  app: FirebaseApp;
  auth: Auth;
  db: Firestore;
  googleProvider: GoogleAuthProvider;
}

export type FirebaseStatus =
  | Readonly<{
      available: true;
      reason: null;
      missingConfigKeys: readonly FirebasePublicConfigKey[];
    }>
  | Readonly<{
      available: false;
      reason: FirebaseUnavailableReason;
      missingConfigKeys: readonly FirebasePublicConfigKey[];
    }>;

type FirebaseInitialization =
  | { available: true; services: FirebaseServices }
  | {
      available: false;
      reason: FirebaseUnavailableReason;
      missingConfigKeys: readonly FirebasePublicConfigKey[];
    };

function appUsesCurrentConfig(app: FirebaseApp): boolean {
  return requiredConfigKeys.every((key) => app.options[key] === firebaseConfig[key]);
}

function initializeFirebaseServices(): FirebaseInitialization {
  const missingConfigKeys = Object.freeze(
    requiredConfigKeys.filter((key) => !firebaseConfig[key]),
  );

  if (missingConfigKeys.length > 0) {
    return { available: false, reason: "missing-config", missingConfigKeys };
  }

  try {
    // Reuse the default app across Vite HMR updates. If another initializer owns
    // it with different options, fail closed instead of silently using it.
    const existingApp = getApps().find((candidate) => candidate.name === "[DEFAULT]");
    if (existingApp && !appUsesCurrentConfig(existingApp)) {
      return {
        available: false,
        reason: "configuration-mismatch",
        missingConfigKeys: Object.freeze([]),
      };
    }

    const app = existingApp ?? initializeApp(firebaseConfig);
    return {
      available: true,
      services: {
        app,
        auth: getAuth(app),
        db: getFirestore(app),
        googleProvider: new GoogleAuthProvider(),
      },
    };
  } catch {
    // Firebase SDK errors may include configuration/provider details. Do not log
    // or expose them from this shared client boundary.
    return {
      available: false,
      reason: "initialization-failed",
      missingConfigKeys: Object.freeze([]),
    };
  }
}

const initialization = initializeFirebaseServices();

export const firebaseStatus: FirebaseStatus = Object.freeze(
  initialization.available === false
    ? {
        available: false,
        reason: initialization.reason,
        missingConfigKeys: initialization.missingConfigKeys,
      }
    : { available: true, reason: null, missingConfigKeys: Object.freeze([]) },
);

export const firebaseAvailable = firebaseStatus.available;
export const firebaseApp = initialization.available ? initialization.services.app : null;
export const auth = initialization.available ? initialization.services.auth : null;
export const db = initialization.available ? initialization.services.db : null;
export const googleProvider = initialization.available
  ? initialization.services.googleProvider
  : null;

export class FirebaseUnavailableError extends Error {
  readonly code = "firebase/unavailable";
  readonly reason: FirebaseUnavailableReason;

  constructor(reason: FirebaseUnavailableReason) {
    const message =
      reason === "missing-config"
        ? "Firebase is unavailable because its public configuration is incomplete."
        : reason === "configuration-mismatch"
          ? "Firebase is unavailable because the active app has different configuration."
          : "Firebase services are unavailable.";
    super(message);
    this.name = "FirebaseUnavailableError";
    this.reason = reason;
  }
}

export function getFirebaseServices(): FirebaseServices | null {
  return initialization.available ? initialization.services : null;
}

function requireFirebaseServices(): FirebaseServices {
  if (initialization.available === false) {
    throw new FirebaseUnavailableError(initialization.reason);
  }
  return initialization.services;
}

export async function loginWithGoogle(): Promise<User> {
  const services = requireFirebaseServices();
  const result = await signInWithPopup(services.auth, services.googleProvider);
  return result.user;
}

export function loginAnonymously() {
  return signInAnonymously(requireFirebaseServices().auth);
}

export async function logoutUser(): Promise<void> {
  await signOut(requireFirebaseServices().auth);
}
