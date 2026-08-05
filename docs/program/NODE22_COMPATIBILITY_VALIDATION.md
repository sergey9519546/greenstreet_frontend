# Node 22 Compatibility Validation

Status: bounded local validation, 2026-07-28. This document records a local runtime check for the declared Node 22 CI target. It is not a release approval, a replacement for CI, or proof that a clean dependency installation, hosted preview, deployment, policy, or domain gate has passed.

## Scope and isolation

The check ran only in the isolated worktree at `C:\Users\serge\OneDrive\Documents\DSCR_LOAN OFFICE\greenstreet_frontend_ultraplan`. The initial runtime check did not alter application source, package scripts, CI configuration, the original checkout, or GitHub. A later deliberately controlled dev-only lock resolution updated `package-lock.json` only; its exact result and validation are recorded below. The normal production build regenerated ignored `dist/` artifacts only.

`package.json` declares Node `22.x`, and `.github/workflows/ci.yml` configures `actions/setup-node` with Node 22. The host default was Node `v25.2.1` with npm `11.7.0`; scoped searches of the installed Node path and common local version-manager locations found no installed Node 22 binary.

## Runtime method

An ephemeral npm package supplied Node `v22.23.1` without a global installation:

```powershell
npx --yes node@22 --version
```

The Windows `node_modules/.bin/*.cmd` shims use `node` from `PATH` when no colocated `node.exe` exists. Launching only npm with Node 22 would therefore have allowed the shims to fall back to the host's Node 25. To prevent that false positive, the validation resolved the ephemeral executable, prepended its directory to `PATH`, set `NODE` to that executable, and launched npm's CLI through that same executable:

```powershell
$node22 = (& npx --yes node@22 -p "process.execPath").Trim()
$node22Directory = Split-Path -Parent $node22
$env:Path = "$node22Directory$([IO.Path]::PathSeparator)$env:Path"
$env:NODE = $node22
$npmCli = Join-Path ${env:ProgramFiles} 'nodejs\node_modules\npm\bin\npm-cli.js'

node --version
& $node22 $npmCli --version
& $node22 $npmCli run lint
& $node22 $npmCli test
& $node22 $npmCli run test:home-fidelity
& $node22 $npmCli run build
```

Observed runtime values were Node `v22.23.1` and npm `11.6.2`. The `PATH` verification occurred in the same PowerShell process that launched the commands, so npm lifecycle scripts and their Windows command shims resolved Node 22.

## Verified results

| Command | Result |
| --- | --- |
| `npm run lint` | Passed (`tsc --noEmit`). |
| `npm test` | Passed: 25 test files, 225 tests. The output included expected negative-input validation and synthetic invalid-token logs for `/solve`; the command exited 0. |
| `npm run test:home-fidelity` | Passed with homepage contract hash `61bd761d41afdaa7db27ed1076284440d17cd6b7aafd388f0500b27995cbc5a9`. |
| `npm run build` | Passed. The Vite/esbuild bundle and all server artifacts completed successfully. |

The build emitted two non-fatal existing warnings: an external script in `index.html` lacks `type="module"`, and the Firebase chunk is `523.88 kB` minified (`122.06 kB` gzip), over Vite's default chunk-size advisory threshold. No warning was suppressed or changed in this validation.

## Current source-only follow-up

After the later dynamic-navigation and homepage skip-target slice, the same explicit Node `v22.23.1` / npm `11.6.2` method passed the full executable floor again:

| Command | Result |
| --- | --- |
| `npm run lint` | Passed (`tsc --noEmit`). |
| `npm test` | Passed: 26 test files / 226 tests. The expected synthetic negative-input validation and invalid Firebase-token test logs were emitted; the command exited 0. |
| `npm run test:home-fidelity` | Passed with the unchanged raw-homepage hash `61bd761d41afdaa7db27ed1076284440d17cd6b7aafd388f0500b27995cbc5a9`. |
| `npm run build` | Passed with the same two non-fatal existing warnings above. |
| `npm run report:build-artifacts` and `git diff --check` | Passed. |

This follow-up changed no dependency or raw-homepage source. It is still a local installed-tree validation; run the clean-install sequence below on the final frozen candidate.

## CI-required follow-up

This was a bounded runtime validation against the already-present dependency tree. After the controlled dev-only PostCSS/NanoID lock resolution, the current candidate itself passed clean `npm ci` under Node `v22.23.1`, then lint, the current 25-file / 225-test suite, homepage fidelity, build, and the opt-in artifact report. The resolved lock SHA-256 was `F823AFD0A419CC054452FA12AE00D71C70448E717E9894DDE2F84F1449C7017C` before and after the clean install. The authoritative clean-environment gate remains the repository CI sequence under Node 22:

```text
npm ci
npm run lint
npm test
npm run test:home-fidelity
npm run build
git diff --check
```

Run that sequence on the frozen candidate after all parallel work stops. A passing Node 22 floor is still only an implementation check; it does not clear any reliability hold or authorize release.
