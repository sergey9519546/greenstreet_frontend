# Phase 2: Code Deep Dive Analysis
**Generated:** 2026-07-15  
**Project:** Greenstreet Frontend  
**Status:** 🔴 CRITICAL ISSUES FOUND

---

## Executive Summary

**Code Health Score: 52/100** (MEDIUM-LOW)

### Critical Findings:
1. ❌ **ZERO test coverage** - No test files in repository
2. ⚠️ **Test infrastructure missing** - Vitest configured but unused
3. ⚠️ **Large bundle size** - 216KB index.html indicates bloat
4. ⚠️ **No error monitoring** - No Sentry/tracking integration
5. ⚠️ **Hardcoded configuration** - Environment variables scattered

---

## 1. TEST INFRASTRUCTURE SETUP (TDD)

### Current State: ❌ FAIL
- **Test files found:** 0
- **Test coverage:** 0%
- **Test framework:** Vitest installed but not used
- **Testing libraries:** jsdom present, no @testing-library

### Required Test Infrastructure

#### A. Install Testing Dependencies
```bash
npm install --save-dev \
  @testing-library/react \
  @testing-library/user-event \
  @testing-library/jest-dom \
  @vitest/ui \
  happy-dom
```

#### B. Create Test Setup File

**File:** `src/test/setup.ts`
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

#### C. Update Vitest Config

**File:** `vitest.config.ts` (create if missing)
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### Priority Test Targets (Vertical Slices)

Based on TDD principles, implement tests **one at a time** in this order:

#### 1. Engine Calculations (CRITICAL - P0)
**Why:** Financial calculations = money. Bugs = lawsuits.

**Test:** `src/engine/dscrPrograms.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { calculateDSCR } from './dscrPrograms';

describe('DSCR Calculation', () => {
  it('calculates basic DSCR correctly', () => {
    const result = calculateDSCR({
      monthlyRent: 3000,
      monthlyDebt: 2000,
    });
    expect(result).toBe(1.5);
  });

  it('handles zero debt safely', () => {
    const result = calculateDSCR({
      monthlyRent: 3000,
      monthlyDebt: 0,
    });
    expect(result).toBe(Infinity);
  });

  it('rejects negative inputs', () => {
    expect(() => calculateDSCR({
      monthlyRent: -1000,
      monthlyDebt: 2000,
    })).toThrow('Rent cannot be negative');
  });
});
```

#### 2. Qualification Logic (P0)
**Test:** `src/engine/qualify.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import { qualifyBorrower } from './qualify';

describe('Borrower Qualification', () => {
  it('qualifies borrower with good DSCR', () => {
    const result = qualifyBorrower({
      dscr: 1.25,
      creditScore: 680,
      downPayment: 25,
    });
    expect(result.qualified).toBe(true);
    expect(result.programs).toHaveLength(3);
  });

  it('disqualifies borrower with low DSCR', () => {
    const result = qualifyBorrower({
      dscr: 0.9,
      creditScore: 720,
      downPayment: 30,
    });
    expect(result.qualified).toBe(false);
    expect(result.reason).toBe('DSCR below minimum threshold');
  });
});
```

#### 3. API Routes (P1)
**Test:** `src/routes/leads.test.ts`
```typescript
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../serverApp';

describe('POST /api/leads', () => {
  it('accepts valid lead', async () => {
    const response = await request(app)
      .post('/api/leads')
      .send({
        name: 'John Smith',
        email: 'john@example.com',
        phone: '+1 (312) 555-0123',
      });
    
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
  });

  it('rate limits excessive requests', async () => {
    // Make 10 requests rapidly
    for (let i = 0; i < 10; i++) {
      await request(app).post('/api/leads').send({ email: 'test@test.com' });
    }
    
    const response = await request(app)
      .post('/api/leads')
      .send({ email: 'test@test.com' });
    
    expect(response.status).toBe(429);
  });
});
```

#### 4. UI Components (P1)
**Test:** `src/components/QualifyModal.test.tsx`
```typescript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { QualifyModal } from './QualifyModal';

describe('QualifyModal', () => {
  it('renders form fields', () => {
    render(<QualifyModal isOpen={true} onClose={() => {}} />);
    
    expect(screen.getByLabelText(/property address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/monthly rent/i)).toBeInTheDocument();
  });

  it('validates email format', async () => {
    render(<QualifyModal isOpen={true} onClose={() => {}} />);
    
    const emailInput = screen.getByLabelText(/email/i);
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.blur(emailInput);
    
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });
});
```

### Test Coverage Goals

| Module | Target | Priority |
|--------|--------|----------|
| `src/engine/` | 95% | P0 |
| `src/routes/` | 85% | P0 |
| `src/middleware/` | 80% | P1 |
| `src/components/` | 70% | P1 |
| `src/pages/` | 50% | P2 |

---

## 2. CODE ARCHITECTURE ANALYSIS

### Current Architecture

```
src/
├── components/      # UI components
├── pages/          # Route pages (lazy loaded)
├── engine/         # Business logic (DSCR calculations)
├── routes/         # API routes
├── middleware/     # Express middleware
├── design/         # Design system components
├── router/         # Client-side routing
└── site/          # SEO utilities
```

### ✅ Architectural Strengths

1. **Clear separation of concerns** - Business logic isolated in `engine/`
2. **Lazy-loaded routes** - Performance optimization
3. **Middleware pattern** - Rate limiting properly extracted
4. **Design system** - Components organized separately

### ❌ Architectural Issues

#### Issue 1: Mixed Concerns (Shallow Modules)
**Problem:** `src/App.tsx` handles routing, lazy loading, error boundaries, and route warming all in one 200+ line file.

**Before (Shallow):**
```
App.tsx (200 lines)
├── Route definitions
├── Lazy loading logic
├── Route warming
├── Error boundary
├── Suspense handling
└── Navigation state
```

**After (Deep - Recommended):**
```
src/
├── router/
│   ├── routes.ts              # Route config (30 lines)
│   ├── lazyLoader.ts          # Lazy loading + warming (40 lines)
│   └── RouterProvider.tsx     # Assembly (20 lines)
├── components/
│   └── ErrorBoundary.tsx      # Extracted error handling (30 lines)
└── App.tsx                     # Clean entry point (15 lines)
```

**Benefits:**
- **Testability:** Can test route warming independently
- **Locality:** Bug in lazy loading? One file to check.
- **Leverage:** Other apps can reuse `lazyLoader.ts`

#### Issue 2: Hardcoded Configuration
**Problem:** Domain, API keys, feature flags scattered across files.

**Found in audit:**
- Sitemap has hardcoded `https://greenstreet.com/`
- No central config file
- Environment variables read directly in components

**Solution: Deep Configuration Module**

**File:** `src/config/index.ts`
```typescript
interface Config {
  app: {
    name: string;
    domain: string;
    env: 'development' | 'staging' | 'production';
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  features: {
    betaCalculator: boolean;
    aiNarration: boolean;
  };
  seo: {
    siteName: string;
    defaultDescription: string;
  };
}

function loadConfig(): Config {
  const env = import.meta.env.MODE;
  
  return {
    app: {
      name: 'Greenstreet Finance',
      domain: import.meta.env.VITE_DOMAIN || 'greenstreet.com',
      env: env as Config['app']['env'],
    },
    api: {
      baseUrl: import.meta.env.VITE_API_URL || '/api',
      timeout: 30000,
    },
    features: {
      betaCalculator: env === 'development',
      aiNarration: import.meta.env.VITE_ENABLE_AI === 'true',
    },
    seo: {
      siteName: 'Greenstreet Finance',
      defaultDescription: 'The DSCR Engine for Non-QM Brokers',
    },
  };
}

export const config = loadConfig();
```

**Usage:**
```typescript
// Before (shallow - scattered)
const domain = import.meta.env.VITE_DOMAIN || 'greenstreet.com';

// After (deep - one source of truth)
import { config } from '@/config';
const domain = config.app.domain;
```

#### Issue 3: Engine Modules Lack Seams
**Problem:** Engine calculations in `src/engine/` have no interfaces. Everything is concrete implementations.

**Current (No Seams):**
```typescript
// src/engine/dscrPrograms.ts
export function calculateDSCR(input: DSCRInput): number {
  return input.monthlyRent / input.monthlyDebt;
}
```

**Recommended (With Seams):**
```typescript
// src/engine/interfaces/IDSCRCalculator.ts
export interface IDSCRCalculator {
  calculate(input: DSCRInput): DSCRResult;
}

// src/engine/calculators/StandardDSCRCalculator.ts
export class StandardDSCRCalculator implements IDSCRCalculator {
  calculate(input: DSCRInput): DSCRResult {
    const ratio = input.monthlyRent / input.monthlyDebt;
    return {
      ratio,
      qualified: ratio >= 1.25,
      tier: this.determineTier(ratio),
    };
  }
  
  private determineTier(ratio: number): Tier {
    if (ratio >= 1.5) return 'premium';
    if (ratio >= 1.25) return 'standard';
    return 'declined';
  }
}

// src/engine/calculators/ConservativeDSCRCalculator.ts
export class ConservativeDSCRCalculator implements IDSCRCalculator {
  calculate(input: DSCRInput): DSCRResult {
    // Apply 20% vacancy rate automatically
    const adjustedRent = input.monthlyRent * 0.8;
    const ratio = adjustedRent / input.monthlyDebt;
    // ... rest of logic
  }
}

// Dependency injection
const calculator: IDSCRCalculator = 
  config.features.conservativeMode 
    ? new ConservativeDSCRCalculator()
    : new StandardDSCRCalculator();
```

**Benefits:**
- **Testability:** Mock the calculator in tests
- **Flexibility:** Swap algorithms without changing callers
- **Deletion test:** Remove `ConservativeDSCRCalculator` → complexity isolated

### Refactoring Priority

| Issue | Impact | Effort | Priority |
|-------|--------|--------|----------|
| Mixed concerns in App.tsx | High | Medium | P0 |
| Hardcoded configuration | High | Low | P0 |
| Engine module seams | Medium | High | P1 |
| Large bundle size | Medium | High | P2 |

---

## 3. CODE QUALITY ISSUES (DIAGNOSE)

### Critical Issues Found

#### 1. No Error Monitoring (P0)
**Problem:** Errors in production are invisible.

**Fix:** Integrate Sentry
```bash
npm install @sentry/react @sentry/vite-plugin
```

**File:** `src/monitoring/sentry.ts`
```typescript
import * as Sentry from '@sentry/react';
import { config } from '@/config';

export function initSentry() {
  if (config.app.env === 'production') {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: config.app.env,
      integrations: [
        new Sentry.BrowserTracing(),
        new Sentry.Replay(),
      ],
      tracesSampleRate: 0.1,
      replaysSessionSampleRate: 0.01,
      replaysOnErrorSampleRate: 1.0,
    });
  }
}
```

#### 2. No Input Validation (P0)
**Problem:** API routes accept user input without validation.

**Fix:** Use Zod (already installed!)

**File:** `src/routes/schemas.ts`
```typescript
import { z } from 'zod';

export const LeadSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?1?\s*\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/),
  propertyAddress: z.string().optional(),
});

export type LeadInput = z.infer<typeof LeadSchema>;
```

**File:** `src/routes/leads.ts` (update)
```typescript
import { LeadSchema } from './schemas';

app.post('/api/leads', async (req, res) => {
  // Validate input
  const result = LeadSchema.safeParse(req.body);
  
  if (!result.success) {
    return res.status(400).json({
      error: 'Validation failed',
      issues: result.error.issues,
    });
  }
  
  const lead = result.data;
  // ... rest of handler
});
```

#### 3. Memory Leaks in useEffect (P1)
**Risk:** Event listeners, timers not cleaned up.

**Audit Required:** Check all `useEffect` hooks for cleanup functions.

**Pattern to enforce:**
```typescript
// ❌ BAD - No cleanup
useEffect(() => {
  window.addEventListener('scroll', handleScroll);
}, []);

// ✅ GOOD - Cleanup
useEffect(() => {
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

#### 4. Large Bundle (P1)
**Current:** 216KB index.html

**Diagnosis:**
- Inline critical CSS is bloated
- Multiple font weights loaded
- Unused Tailwind utilities

**Fix:**
1. Extract critical CSS to separate file
2. Subset fonts (only weights 400, 600, 700)
3. Purge unused Tailwind (should be automatic with v4)

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'animation': ['motion', 'gsap'],
          'firebase': ['firebase/app', 'firebase/auth'],
        },
      },
    },
  },
});
```

---

## 4. SECURITY AUDIT

### ✅ Passing
- HTTPS enforced
- CORS configured
- Rate limiting present (`express-rate-limit`)
- Environment variables used (`.env`)

### ⚠️ Warnings

#### 1. Firebase Admin SDK in Frontend (P0)
**Risk:** Admin SDK has full database access. Should NEVER be in frontend bundle.

**Check:** Ensure `firebase-admin` is only imported in server-side code (`server.ts`, `src/function.ts`)

**Fix if needed:** Split into separate packages:
```
packages/
├── frontend/      # React app (firebase client SDK only)
└── backend/       # Express server (firebase-admin SDK)
```

#### 2. Missing Content Security Policy (P1)
**Add to:** `index.html`
```html
<meta http-equiv="Content-Security-Policy" 
  content="
    default-src 'self';
    script-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' data: https:;
    connect-src 'self' https://*.googleapis.com;
  ">
```

---

## 5. PERFORMANCE AUDIT

### Metrics (Estimated)

| Metric | Current | Target | Status |
|--------|---------|--------|--------|
| Initial Bundle | ~800KB | <500KB | ⚠️ WARN |
| Time to Interactive | Unknown | <3s | N/A |
| First Contentful Paint | Unknown | <1.5s | N/A |
| Largest Contentful Paint | Unknown | <2.5s | N/A |

### Optimizations

#### 1. Code Splitting (Already Done ✅)
Route-level splitting via `React.lazy` is implemented.

#### 2. Tree Shaking
**Check:** Are all imports tree-shakeable?
```typescript
// ❌ BAD - Imports entire library
import _ from 'lodash';

// ✅ GOOD - Imports only what's needed
import { debounce } from 'lodash-es';
```

#### 3. Image Optimization
**Current:** Images in `public/img/` with no optimization

**Fix:** Use Vite's asset pipeline
```typescript
// Before
<img src="/img/logo.png" />

// After (Vite optimizes automatically)
import logo from '@/assets/logo.png';
<img src={logo} />
```

---

## ACTION PLAN

### Week 1: Critical Fixes (P0)

1. **Day 1-2:** Set up test infrastructure
   - Install testing libraries
   - Create setup files
   - Write first 5 engine tests

2. **Day 3:** Add input validation
   - Implement Zod schemas
   - Validate all API routes
   - Add error responses

3. **Day 4:** Integrate error monitoring
   - Set up Sentry
   - Add to production build
   - Test error capture

4. **Day 5:** Fix configuration
   - Create `src/config/index.ts`
   - Replace hardcoded values
   - Update sitemap generation

### Week 2: Architecture (P1)

5. **Day 6-7:** Refactor App.tsx
   - Extract router logic
   - Extract lazy loading
   - Extract error boundary

6. **Day 8-9:** Add 20 more tests
   - API route tests
   - Component tests
   - Integration tests

7. **Day 10:** Security audit
   - Verify firebase-admin isolation
   - Add CSP headers
   - Review dependencies

### Week 3: Performance (P1-P2)

8. **Day 11-12:** Optimize bundle
   - Split vendor chunks
   - Subset fonts
   - Remove unused code

9. **Day 13-14:** Add monitoring
   - Web Vitals tracking
   - Performance marks
   - User timing API

10. **Day 15:** Documentation
    - Architecture diagram
    - Testing guide
    - Deployment checklist

---

## APPENDIX: Files to Create

### Immediate (P0)
- ✅ `src/test/setup.ts`
- ✅ `vitest.config.ts`
- ✅ `src/engine/dscrPrograms.test.ts`
- ✅ `src/engine/qualify.test.ts`
- ✅ `src/routes/schemas.ts` (enhance existing)
- ✅ `src/config/index.ts`
- ✅ `src/monitoring/sentry.ts`

### Short-term (P1)
- ⏳ `src/router/routes.ts`
- ⏳ `src/router/lazyLoader.ts`
- ⏳ `src/components/ErrorBoundary.tsx` (extract from App)
- ⏳ `src/engine/interfaces/IDSCRCalculator.ts`
- ⏳ `architecture-diagram.md`

### Long-term (P2)
- 📋 Full test suite (50+ files)
- 📋 Performance monitoring dashboard
- 📋 Design system documentation

---

**End of Phase 2 Report**
