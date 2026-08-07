# Greenstreet DSCR Loan Platform

**Production-grade DSCR loan qualification engine and borrower portal** for real estate investors.

## Overview

Greenstreet is a full-stack TypeScript application providing:
- **DSCR Calculator** — Debt-service coverage ratio analysis with dual-track methodology
- **Lender Intel** — 14+ lender program database with fit scoring
- **ARM Reset Engine** — Payment shock modeling with 5-scenario SOFR stress analysis
- **True Cost Comparator** — XIRR-based all-in effective yield calculations
- **Tax Engine** — IRC-compliant after-tax IRR with depreciation recapture
- **Portfolio Analytics** — Multi-property stress testing and covenant checks
- **Broker Portal** — Deal pipeline, sensitivity analysis, IC memo generation

## Tech Stack

- **Frontend:** React 19, TypeScript 5.7, Vite 6
- **UI:** Tailwind CSS 4, Motion (Framer Motion), GSAP
- **Backend:** Express, Firebase Functions
- **Database:** Firebase Firestore
- **Auth:** Firebase Authentication
- **Testing:** Vitest (364 tests, 100% engine coverage target)
- **Deployment:** Vercel

## Quick Start

### Prerequisites
- Node.js 20+ and npm 10+
- Firebase account (free Spark plan works for development)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd greenstreet_frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env and add your Firebase credentials

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

### Build for Production

```bash
npm run build
npm run start
```

## Project Structure

```
greenstreet_frontend/
├── src/
│   ├── engine/          # Pure TypeScript calculation engines (36 modules)
│   │   ├── engine.ts            # DSCR solver, payment calculations
│   │   ├── qualify.ts           # Lender qualification logic
│   │   ├── taxEngine.ts         # IRC-compliant tax calculations
│   │   ├── lenders.ts           # 14 lender profiles with provenance tracking
│   │   ├── statePppLaws.ts      # State-by-state prepayment penalty rules
│   │   ├── types.ts             # 100+ TypeScript interfaces (1513 lines)
│   │   └── *.test.ts            # 32 test files, 364 tests
│   ├── pages/           # Route-level React components (33 pages)
│   ├── components/      # Shared UI components
│   ├── design/          # Design system (dc.tsx, theme.ts, artifacts)
│   ├── lib/             # Utilities (dealState, engineService)
│   ├── routes/          # Express API routes
│   └── firebase.ts      # Firebase initialization
├── public/              # Static assets (7.2MB images/videos)
├── .env.example         # Environment variable template
└── package.json
```

## Key Features

### Dual-Track DSCR Methodology
- **Track 1:** Lender qualification (GROSS / PITIA)
- **Track 2:** Investor survival (NET / PITIA after vacancy/mgmt/maint)

### 8-Lever Rescue Engine
When deals fail qualification, the engine suggests:
1. Raise rent
2. Reduce price
3. Increase down payment
4. Buy down rate with points
5. Switch to interest-only
6. Change lender formula
7. Add STR income
8. Combination fixes

### Provenance Tracking
All lender data tagged with verification level:
- `VERIFIED_PRIMARY` — Direct from lender rate sheet
- `VERIFIED_SECONDARY` — Confirmed via broker
- `UNVERIFIED` — Market intelligence, needs confirmation

### State-Specific Compliance
- 50-state prepayment penalty rules
- Property tax reassessment (CA Prop 13, TX, FL, etc.)
- ARM restrictions (WI, ME)
- Entity requirements (NJ, AK)

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test -- --coverage
```

**Current Coverage:** 364 tests across 32 engine files

## Environment Variables

See `.env.example` for required configuration.

**Critical Variables:**
- `VITE_FIREBASE_*` — Firebase client config (required)
- `ANTHROPIC_AUTH_TOKEN` — AI narration feature (optional)

## Development

### Commands
- `npm run dev` — Start dev server (port 3000)
- `npm run build` — Production build
- `npm run lint` — TypeScript type checking
- `npm test` — Run test suite

### Code Style
- **TypeScript strict mode** enabled
- **No `any` types** in engine layer (227 to eliminate in UI layer)
- **JSDoc comments** on all public functions
- **Design tokens** via `theme.ts` (use instead of hardcoded colors)

### Adding a New Engine Feature

1. Define types in `src/engine/types.ts`
2. Implement pure function in `src/engine/yourFeature.ts`
3. Add tests in `src/engine/yourFeature.test.ts`
4. Export from `src/engine/index.ts`
5. Import in UI component

## Architecture

### Engine Layer (Pure TypeScript)
- **Zero side effects** — all functions pure and deterministic
- **Comprehensive types** — 1513 lines of TypeScript interfaces
- **Golden test values** — calculations verified against known good results
- **Provenance tracking** — three-tier verification system

### UI Layer (React)
- **Route-based code splitting** — all 30+ pages lazy-loaded
- **Route warming** — prefetch on idle for instant navigation
- **URL persistence** — deal state in query params for shareability
- **localStorage fallback** — offline-first where possible

### API Layer (Express + Firebase)
- **Rate limiting** — 10/min for AI, 120/min for calculations
- **Worker pool** — offload heavy calculations
- **Structured logging** — JSON logs for observability

## Deployment

Deploys to Vercel automatically on push to `main`.

**Production URL:** `https://yourapp.vercel.app`

## Security

- **Firestore security rules** — user data scoped to `request.auth.uid`
- **Rate limiting** — Express middleware prevents abuse
- **Input validation** — Zod schemas on all API endpoints
- **Security headers** — CSP, X-Frame-Options, HSTS
- **No secrets in client bundle** — `.env` excluded from git

⚠️ **IMPORTANT:** After cloning, rotate Firebase credentials if this repo was ever public.

## Known Issues

See GitHub Issues for tracking. Critical items:
- [ ] firebase-admin should be server-only (not in client bundle)
- [ ] Replace hardcoded colors with design tokens (1,617 instances)
- [ ] Add tests for v11Runner.ts, returnsEngine.ts, lenders.ts

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Add tests for new functionality
4. Ensure `npm test` passes
5. Submit a pull request

## License

Proprietary — All rights reserved

## Support

- **Documentation:** See `/docs` directory
- **Issues:** GitHub Issues
- **Contact:** [your-email]

---

**Built with ❤️ by the Greenstreet team**
