# Greenstreet Finance — DSCR & Non-QM Lending Intelligence

A full-stack site built from the source `index (1).html` (Greenstreet Finance / Greenboard). All on-page text content comes from the **DSCR_LOAN OFFICE** knowledge base.

## Structure

```
dscr-website/
├── package.json
├── server/
│   ├── server.js          # Express API + static frontend host
│   └── data/
│       └── dscr.js        # All DSCR domain data
└── public/
    ├── index.html         # UI based on source HTML structure
    ├── favicon.svg
    ├── css/
    │   └── main.css
    └── js/
        └── main.js
```

## Run

```bash
npm install
npm start
# → http://localhost:3000
```

## API

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/api/logos` | Trusted non-QM / DSCR lender logos |
| GET | `/api/testimonials` | Customer stories |
| GET | `/api/steps` | "How it works" tab content |
| GET | `/api/value` | Value / feature bullets |
| GET | `/api/usecases` | Player-specific use cases |
| GET | `/api/faq` | FAQ entries |
| GET | `/api/live` | Live DSCR / lender match snapshot |
| POST | `/api/dscr` | Dual-Track DSCR calculator |
| POST | `/api/leads` | Demo-request capture |
| GET | `/health` | Healthcheck |

### DSCR calculator

```bash
curl -X POST http://localhost:3000/api/dscr \
  -H "Content-Type: application/json" \
  -d '{"rent":3250,"pitia":2288,"vacancyPct":8,"mgmtFeePct":8}'
```

Returns Track 1 (Lender Qualification) and Track 2 (Investor Survival) DSCR.