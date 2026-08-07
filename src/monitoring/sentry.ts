/**
 * Optional Sentry bootstrap. No hard dependency on @sentry/react —
 * remains a no-op until the package is installed and VITE_SENTRY_DSN is set.
 */

type SentryLike = {
  init: (opts: Record<string, unknown>) => void;
  captureException: (err: unknown) => void;
};

let sentry: SentryLike | null = null;

export async function initSentry() {
  if (import.meta.env.DEV) return;
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined;
  if (!dsn) return;

  try {
    // Avoid static resolution so tsc/build succeed without the package installed.
    const dynamicImport = new Function("m", "return import(m)") as (m: string) => Promise<SentryLike>;
    const mod = await dynamicImport("@sentry/react");
    sentry = mod;
    mod.init({
      dsn,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
    });
  } catch {
    // Package missing or blocked — silent no-op.
  }
}

export function captureException(err: unknown) {
  try {
    sentry?.captureException(err);
  } catch {
    // ignore
  }
}
