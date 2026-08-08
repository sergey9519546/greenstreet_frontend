/**
 * Offline stand-in for the Firebase web SDK.
 *
 * The `dom` vitest project aliases `firebase/app`, `firebase/auth` and
 * `firebase/firestore` here (see vitest.config.ts), so nothing a component test
 * renders can open a socket, initialise a real app, or read/write Firestore —
 * regardless of which module in the tree imports the SDK.
 *
 * Every export records its calls on `firebaseStubCalls` so a test can assert on
 * writes (e.g. a lead document) without wiring its own mock.
 */

export type StubCall = { fn: string; args: unknown[] };

export const firebaseStubCalls: StubCall[] = [];

function record<T>(fn: string, args: unknown[], result: T): T {
  firebaseStubCalls.push({ fn, args });
  return result;
}

/** Drop every recorded call — use in beforeEach when asserting on writes. */
export function resetFirebaseStub(): void {
  firebaseStubCalls.length = 0;
}

// ── firebase/app ─────────────────────────────────────────────────────────────
export const initializeApp = (...args: unknown[]) =>
  record('initializeApp', args, { name: '[TEST]', options: {} });
export const getApp = (...args: unknown[]) => record('getApp', args, { name: '[TEST]', options: {} });
export const getApps = () => [] as unknown[];

// ── firebase/auth ────────────────────────────────────────────────────────────
export const getAuth = (...args: unknown[]) => record('getAuth', args, { currentUser: null });
export class GoogleAuthProvider {}
export const signInWithPopup = (...args: unknown[]) =>
  record('signInWithPopup', args, Promise.resolve({ user: null }));
export const signInWithEmailAndPassword = (...args: unknown[]) =>
  record('signInWithEmailAndPassword', args, Promise.resolve({ user: null }));
export const createUserWithEmailAndPassword = (...args: unknown[]) =>
  record('createUserWithEmailAndPassword', args, Promise.resolve({ user: null }));
export const signInAnonymously = (...args: unknown[]) =>
  record('signInAnonymously', args, Promise.resolve({ user: null }));
export const signOut = (...args: unknown[]) => record('signOut', args, Promise.resolve());
export const onAuthStateChanged = (_auth: unknown, next: unknown) => {
  firebaseStubCalls.push({ fn: 'onAuthStateChanged', args: [] });
  if (typeof next === 'function') (next as (u: unknown) => void)(null);
  return () => {};
};
export type User = { uid: string; email: string | null } | null;

// ── firebase/firestore ───────────────────────────────────────────────────────
export const getFirestore = (...args: unknown[]) => record('getFirestore', args, { type: 'firestore' });
export const collection = (...args: unknown[]) =>
  record('collection', args, { type: 'collection', path: args[1] });
export const doc = (...args: unknown[]) => record('doc', args, { type: 'doc', path: args[1] });
export const addDoc = (...args: unknown[]) => record('addDoc', args, Promise.resolve({ id: 'stub-doc' }));
export const setDoc = (...args: unknown[]) => record('setDoc', args, Promise.resolve());
export const deleteDoc = (...args: unknown[]) => record('deleteDoc', args, Promise.resolve());
export const getDoc = (...args: unknown[]) =>
  record('getDoc', args, Promise.resolve({ exists: () => false, data: () => undefined }));
export const query = (...args: unknown[]) => record('query', args, { type: 'query' });
export const orderBy = (...args: unknown[]) => record('orderBy', args, { type: 'orderBy' });
export const where = (...args: unknown[]) => record('where', args, { type: 'where' });
export const serverTimestamp = () => new Date(0);
export const onSnapshot = (_ref: unknown, next: unknown) => {
  firebaseStubCalls.push({ fn: 'onSnapshot', args: [] });
  if (typeof next === 'function') (next as (s: unknown) => void)({ docs: [] });
  return () => {};
};
