/**
 * Structured logger for the Greenstreet DSCR server.
 *
 * Development logs retain sanitized error stacks. Production logs are JSON and
 * omit stack/provider details. All environments redact secrets and PII.
 */

import pino from "pino";

const isDev = process.env.NODE_ENV !== "production";
const REDACTED = "[REDACTED]";
const MAX_DEPTH = 6;
const MAX_ARRAY_ITEMS = 50;
const MAX_OBJECT_KEYS = 50;
const MAX_STRING_LENGTH = 2_048;
const MAX_STACK_LENGTH = 8_192;
const MAX_PAYLOAD_BYTES = 16_384;

const EMAIL_PATTERN = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi;
const PHONE_CANDIDATE_PATTERN = /\+?\d[\d(). -]{5,}\d/g;
const JWT_PATTERN = /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g;
const AUTH_VALUE_PATTERN = /\b(Bearer|Basic)\s+[A-Za-z0-9._~+/=-]+/gi;
const TOKEN_ASSIGNMENT_PATTERN =
  /\b(authorization|api[-_ ]?key|access[-_ ]?token|refresh[-_ ]?token|id[-_ ]?token|token|secret|password)(\s*[:=]\s*)[^\s,;&}\]]+/gi;
const QUERY_PII_PATTERN =
  /([?&](?:email|e-mail|phone|mobile|telephone|name|first_name|last_name|address|street|city|zip|postal_code|ssn|dob|token|access_token|refresh_token|authorization)=)[^&#\s]*/gi;

const sensitiveKeys = new Set([
  "authorization",
  "proxyauthorization",
  "cookie",
  "setcookie",
  "password",
  "passwd",
  "passcode",
  "secret",
  "clientsecret",
  "apikey",
  "xapikey",
  "token",
  "accesstoken",
  "refreshtoken",
  "idtoken",
  "credential",
  "credentials",
  "session",
  "sessionid",
  "email",
  "mail",
  "phone",
  "mobile",
  "telephone",
  "firstname",
  "lastname",
  "fullname",
  "name",
  "address",
  "street",
  "zipcode",
  "postalcode",
  "ssn",
  "socialsecuritynumber",
  "dob",
  "birthdate",
  "ip",
  "ipaddress",
]);

const productionOmittedKeys = new Set([
  "stack",
  "cause",
  "provider",
  "providerid",
  "providerdata",
  "raw",
  "request",
  "response",
  "config",
]);

function normalizeKey(key: string): string {
  return key.replace(/[^a-z0-9]/gi, "").toLowerCase();
}

function isSensitiveKey(key: string): boolean {
  const normalized = normalizeKey(key);
  return (
    sensitiveKeys.has(normalized) ||
    normalized.endsWith("token") ||
    normalized.endsWith("secret") ||
    normalized.endsWith("password") ||
    normalized.includes("authorization")
  );
}

function redactPhoneLikeValues(value: string): string {
  return value.replace(PHONE_CANDIDATE_PATTERN, (candidate) => {
    const digits = candidate.replace(/\D/g, "");
    const separatorCount = (candidate.match(/[ .-]/g) ?? []).length;
    const hasBalancedAreaCode = /\(\d{2,4}\)/.test(candidate);
    const isCompactPhone = /^\+?\d{10,15}$/.test(candidate.trim());
    const looksLikePhone =
      digits.length >= 7 &&
      digits.length <= 15 &&
      (candidate.trim().startsWith("+") ||
        separatorCount >= 2 ||
        hasBalancedAreaCode ||
        isCompactPhone);
    return looksLikePhone ? REDACTED : candidate;
  });
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  const suffix = "...[TRUNCATED]";
  return `${value.slice(0, Math.max(0, maxLength - suffix.length))}${suffix}`;
}

function sanitizeString(value: string, maxLength = MAX_STRING_LENGTH): string {
  const redacted = redactPhoneLikeValues(value)
    .replace(QUERY_PII_PATTERN, `$1${REDACTED}`)
    .replace(AUTH_VALUE_PATTERN, `$1 ${REDACTED}`)
    .replace(JWT_PATTERN, REDACTED)
    .replace(TOKEN_ASSIGNMENT_PATTERN, `$1$2${REDACTED}`)
    .replace(EMAIL_PATTERN, REDACTED);
  return truncate(redacted, maxLength);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

interface SanitizeContext {
  production: boolean;
  seen: WeakSet<object>;
}

function sanitizeError(error: Error, depth: number, context: SanitizeContext) {
  const safeError: Record<string, unknown> = {
    type: sanitizeString(error.name || "Error"),
    message: sanitizeString(error.message),
  };

  if (!context.production && error.stack) {
    safeError.stack = sanitizeString(error.stack, MAX_STACK_LENGTH);
  }

  const cause = (error as Error & { cause?: unknown }).cause;
  if (!context.production && cause !== undefined) {
    safeError.cause = sanitizeValue(cause, depth + 1, context);
  }

  return safeError;
}

function sanitizeValue(value: unknown, depth: number, context: SanitizeContext): unknown {
  if (typeof value === "string") return sanitizeString(value);
  if (typeof value === "number") return Number.isFinite(value) ? value : "[NON_FINITE_NUMBER]";
  if (typeof value === "bigint") return `${value.toString()}n`;
  if (typeof value === "boolean" || value === null) return value;
  if (typeof value === "undefined") return "[UNDEFINED]";
  if (typeof value === "symbol") return "[SYMBOL]";
  if (typeof value === "function") return "[FUNCTION]";
  if (typeof value !== "object" || value === null) return "[UNSUPPORTED]";

  if (depth >= MAX_DEPTH) return "[MAX_DEPTH]";
  if (context.seen.has(value)) return "[CIRCULAR]";
  context.seen.add(value);

  if (value instanceof Error) return sanitizeError(value, depth, context);
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value.toISOString() : "[INVALID_DATE]";
  }

  if (Array.isArray(value)) {
    const sanitized = value
      .slice(0, MAX_ARRAY_ITEMS)
      .map((item) => sanitizeValue(item, depth + 1, context));
    if (value.length > MAX_ARRAY_ITEMS) sanitized.push("[TRUNCATED_ITEMS]");
    return sanitized;
  }

  if (!isRecord(value)) return "[UNSUPPORTED_OBJECT]";

  const result: Record<string, unknown> = {};
  const keys = Object.keys(value).slice(0, MAX_OBJECT_KEYS);
  for (const key of keys) {
    if (key === "__proto__" || key === "prototype" || key === "constructor") continue;

    const normalized = normalizeKey(key);
    if (context.production && productionOmittedKeys.has(normalized)) continue;
    if (isSensitiveKey(key)) {
      result[key] = REDACTED;
      continue;
    }

    try {
      result[key] = sanitizeValue(value[key], depth + 1, context);
    } catch {
      result[key] = "[UNREADABLE]";
    }
  }

  if (Object.keys(value).length > MAX_OBJECT_KEYS) {
    result.__truncatedKeys = Object.keys(value).length - MAX_OBJECT_KEYS;
  }
  return result;
}

/** Pure sanitizer used by the logger and available for deterministic unit tests. */
export function sanitizeForLog(
  value: unknown,
  options: { production?: boolean } = {},
): unknown {
  return sanitizeValue(value, 0, {
    production: options.production ?? !isDev,
    seen: new WeakSet<object>(),
  });
}

function payloadByteLength(value: unknown): number {
  try {
    const serialized = JSON.stringify(value);
    return serialized ? new TextEncoder().encode(serialized).byteLength : 0;
  } catch {
    return MAX_PAYLOAD_BYTES + 1;
  }
}

function boundLogArguments(args: unknown[]): unknown[] {
  const sanitized = args.map((arg) => sanitizeForLog(arg));
  const originalBytes = payloadByteLength(sanitized);
  if (originalBytes <= MAX_PAYLOAD_BYTES) return sanitized;

  const summary: Record<string, unknown> = {
    logPayload: "[TRUNCATED]",
    originalBytes,
  };
  const safeSummaryKeys = ["method", "path", "statusCode", "durationMs", "event", "code"];
  let message: string | undefined;

  for (const arg of sanitized) {
    if (typeof arg === "string") message = arg;
    if (!isRecord(arg)) continue;

    for (const key of safeSummaryKeys) {
      if (arg[key] !== undefined && summary[key] === undefined) summary[key] = arg[key];
    }

    const error = isRecord(arg.err) ? arg.err : isRecord(arg.error) ? arg.error : null;
    if (error && summary.error === undefined) {
      summary.error = { type: error.type, message: error.message };
    }
  }

  return message ? [summary, message] : [summary];
}

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    redact: {
      paths: [
        "req.headers.authorization",
        "req.headers.cookie",
        "headers.authorization",
        "headers.cookie",
        "authorization",
        "token",
        "*.token",
      ],
      censor: REDACTED,
    },
    hooks: {
      logMethod(args, method) {
        method.apply(this, boundLogArguments(args));
      },
    },
    formatters: {
      bindings(bindings) {
        return sanitizeForLog(bindings) as Record<string, unknown>;
      },
    },
    base: {
      pid: process.pid,
      env: process.env.NODE_ENV || "development",
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  isDev
    ? pino.transport({
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss",
          ignore: "pid,hostname,env",
        },
      })
    : undefined,
);

/** Helper: log a request completion with timing. */
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  extra?: Record<string, unknown>,
) {
  const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";
  logger[level](
    { method, path, statusCode, durationMs, ...extra },
    `${method} ${path} ${statusCode} (${durationMs}ms)`,
  );
}
