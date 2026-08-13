import { describe, expect, it } from 'vitest';
import { ResearchRetriever } from './researchRetriever';

describe('ResearchRetriever', () => {
  it('returns repository-relative paths for legacy nested-worktree records', () => {
    const matches = ResearchRetriever.getInstance().queryResearch('engineWorker', undefined, 20);

    expect(matches).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          title: 'engineWorker.ts',
          path: 'src/engineWorker.ts',
        }),
      ]),
    );
    expect(matches.some((match) => /greenstreet_frontend/i.test(match.path))).toBe(false);
  });

  it('does not return stale snapshots as duplicate repository documents', () => {
    const matches = ResearchRetriever.getInstance().queryResearch('engineWorker', undefined, 20);
    const matchingPaths = matches
      .filter((match) => match.path === 'src/engineWorker.ts')
      .map((match) => match.path);

    expect(matchingPaths).toHaveLength(1);
  });
});
