/**
 * Structured logger for the Greenstreet DSCR server.
 *
 * In development: pretty-prints with pino-pretty.
 * In production:  emits JSON lines (stdout) for log aggregators.
 *
 * Usage:
 *   import { logger } from './src/logger';
 *   logger.info({ endpoint: '/api/narrate' }, 'Request received');
 *   logger.error({ err }, 'Narration failed');
 */

import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

export const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
    // Redact secrets from log output — never log API keys or auth tokens
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers["x-api-key"]',
        'body.apiKey',
        'body.token',
      ],
      censor: '[REDACTED]',
    },
    base: {
      pid: process.pid,
      env: process.env.NODE_ENV || 'development',
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  isDev
    ? pino.transport({
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname,env',
        },
      })
    : undefined, // In production: raw JSON to stdout for log aggregators (Datadog, Logtail, etc.)
);

/** Helper: log a request completion with timing */
export function logRequest(
  method: string,
  path: string,
  statusCode: number,
  durationMs: number,
  extra?: Record<string, unknown>,
) {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
  logger[level]({ method, path, statusCode, durationMs, ...extra }, `${method} ${path} ${statusCode} (${durationMs}ms)`);
}
