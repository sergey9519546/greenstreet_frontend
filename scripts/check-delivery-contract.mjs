import assert from 'node:assert/strict';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const atRoot = (relativePath) => resolve(repoRoot, relativePath);
const readJson = (relativePath) => JSON.parse(readFileSync(atRoot(relativePath), 'utf8'));

const packageJson = readJson('package.json');
const firebase = readJson('firebase.json');
const vercel = readJson('vercel.json');
const workflowPath = atRoot('.github/workflows/verify.yml');

assert.equal(packageJson.scripts['test:delivery'], 'node scripts/check-delivery-contract.mjs');
assert.ok(existsSync(workflowPath), 'local delivery checks must be invoked by CI');

const workflow = readFileSync(workflowPath, 'utf8');
for (const command of [
  'npm run typecheck',
  'npm test',
  'npm run test:home-fidelity',
  'npm run build',
  'npm run test:project-brain',
  'npm run test:delivery',
]) {
  assert.ok(workflow.includes(command), `CI must run ${command}`);
}

assert.equal(firebase.functions.runtime, 'nodejs22');
assert.ok(firebase.functions.predeploy.includes('npm run build'));
assert.equal(firebase.functions.source, '.');
assert.ok(
  firebase.hosting.rewrites.some((rewrite) => rewrite.source === '/api/**' && rewrite.function === 'api'),
  'Firebase Hosting must route API paths to the api function',
);
assert.ok(
  firebase.hosting.rewrites.some((rewrite) => rewrite.source === '**' && rewrite.destination === '/index.html'),
  'Firebase Hosting must retain the SPA fallback',
);

const includeFiles = vercel.functions['api/index.js'].includeFiles;
for (const artifact of ['api/_app.cjs', 'dist/engineWorker.cjs']) {
  assert.ok(includeFiles.includes(artifact), `Vercel function package must include ${artifact}`);
}
assert.ok(
  vercel.rewrites.some((rewrite) => rewrite.source === '/api/(.*)' && rewrite.destination === '/api/index.js'),
  'Vercel must route API paths to the server bundle',
);

for (const artifact of ['dist/server.cjs', 'dist/engineWorker.cjs', 'dist/function.cjs', 'api/_app.cjs']) {
  const artifactPath = atRoot(artifact);
  assert.ok(existsSync(artifactPath), `build must emit ${artifact}`);
  assert.ok(statSync(artifactPath).size > 0, `build output ${artifact} must not be empty`);
}

console.log('Delivery contract passed: build artifacts and local Firebase/Vercel routing contracts are present.');
