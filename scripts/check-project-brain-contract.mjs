import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(resolve(repoRoot, relativePath), 'utf8');

const builder = read('scripts/build_project_brain.py');
const query = read('scripts/query_project_brain.py');
const docsIndex = JSON.parse(read('docs/project_brain/MASTER_RESEARCH_INDEX.json'));

for (const [name, source] of Object.entries({ builder, query })) {
  assert.equal(
    source.includes('C:\\Users\\serge\\OneDrive\\Documents\\DSCR_LOAN OFFICE'),
    false,
    `${name} must resolve the repository location instead of hard-coding one workstation path`,
  );
}

assert.equal(
  query.includes('across 1,011 research files'),
  false,
  'query output must report the indexed-document count instead of a stale hard-coded total',
);
assert.equal(
  query.includes('1,011 research papers'),
  false,
  'query documentation must not claim a stale fixed record count',
);

assert.ok(Array.isArray(docsIndex.documents), 'project-brain index must expose a documents array');
assert.equal(docsIndex.count, docsIndex.documents.length, 'project-brain count must match its documents array');
assert.equal(
  docsIndex.documents.some((document) => /greenstreet_frontend/i.test(document.path)),
  false,
  'documentation index must not retain the retired nested repository root',
);

console.log(`Project Brain contract passed (${docsIndex.count} documentation records).`);
