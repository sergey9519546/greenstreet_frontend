import { describe, it, expect, vi } from 'vitest';
import { isChunkLoadError, importWithRetry } from './App';

// ---------------------------------------------------------------------------
// A deploy rotating hashed chunk filenames while a tab is open is the ordinary
// case here, not an exotic one. Before this, three things compounded:
//   - React.lazy caches a rejection permanently, so one failed import killed
//     that route for the life of the page;
//   - warmAllRoutes swallowed every failure with `.catch(() => {})`, so all 25
//     chunks could fail with no console line and no Sentry event;
//   - the error screen's only action was history.back(), SPA navigation that
//     re-fetches nothing and therefore could not clear the failure.
// ---------------------------------------------------------------------------

describe('isChunkLoadError', () => {
  it('recognises the shapes browsers and bundlers actually produce', () => {
    const real = [
      new Error('Failed to fetch dynamically imported module: https://x/assets/Page-a1b2.js'),
      new Error('error loading dynamically imported module'),
      new Error('Importing a module script failed.'),
      new Error('Loading chunk 42 failed.'),
      Object.assign(new Error('boom'), { name: 'ChunkLoadError' }),
    ];
    for (const e of real) expect(isChunkLoadError(e)).toBe(true);
  });

  it('does not claim ordinary application errors', () => {
    // Misclassifying these would trigger a page reload on a plain render bug —
    // and, worse, discard whatever the user had typed.
    const notChunks = [
      new TypeError("Cannot read properties of undefined (reading 'dscr')"),
      new Error('Network request failed'),
      new RangeError('Maximum call stack size exceeded'),
      new Error(''),
    ];
    for (const e of notChunks) expect(isChunkLoadError(e)).toBe(false);
  });

  it('is safe on null, undefined and non-error throws', () => {
    expect(isChunkLoadError(null)).toBe(false);
    expect(isChunkLoadError(undefined)).toBe(false);
    expect(isChunkLoadError('Failed to fetch dynamically imported module')).toBe(false);
    expect(isChunkLoadError({})).toBe(false);
  });
});

describe('importWithRetry', () => {
  const chunkErr = () => new Error('Failed to fetch dynamically imported module: /assets/P-1.js');

  it('does not retry a call that succeeds', async () => {
    const load = vi.fn().mockResolvedValue({ default: 'page' });
    await expect(importWithRetry(load)).resolves.toEqual({ default: 'page' });
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('retries once on a chunk-load failure and resolves', async () => {
    const load = vi.fn()
      .mockRejectedValueOnce(chunkErr())
      .mockResolvedValueOnce({ default: 'page' });

    await expect(importWithRetry(load, 2, 1)).resolves.toEqual({ default: 'page' });
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('gives up after its attempts and rethrows the original error', async () => {
    const err = chunkErr();
    const load = vi.fn().mockRejectedValue(err);

    await expect(importWithRetry(load, 2, 1)).rejects.toBe(err);
    expect(load).toHaveBeenCalledTimes(2);
  });

  it('does NOT retry an error thrown while the module evaluates', async () => {
    // The chunk arrived; its top-level code threw. Retrying would run that
    // module's side effects a second time and still fail.
    const err = new TypeError('theme is not defined');
    const load = vi.fn().mockRejectedValue(err);

    await expect(importWithRetry(load, 3, 1)).rejects.toBe(err);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it('honours a higher attempt count', async () => {
    const load = vi.fn()
      .mockRejectedValueOnce(chunkErr())
      .mockRejectedValueOnce(chunkErr())
      .mockResolvedValueOnce({ default: 'page' });

    await expect(importWithRetry(load, 3, 1)).resolves.toEqual({ default: 'page' });
    expect(load).toHaveBeenCalledTimes(3);
  });

  it('waits between attempts rather than hammering immediately', async () => {
    const load = vi.fn().mockRejectedValueOnce(chunkErr()).mockResolvedValueOnce({ default: 'p' });
    const started = Date.now();
    await importWithRetry(load, 2, 25);
    expect(Date.now() - started).toBeGreaterThanOrEqual(20);
  });
});
