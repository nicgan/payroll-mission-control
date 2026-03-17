# Payroll Statutory Mission Control

Real-time compliance dashboard for monitoring statutory payroll rules across **Singapore**, **Hong Kong**, and **Malaysia**.

## Features

- **Overview Dashboard** — KPI cards, jurisdiction status summaries, RED/AMBER alert lists
- **Statutory Items** — 37 items with filter by jurisdiction/category/status, live search, sortable columns, expandable detail cards with source tiers and test cases
- **Timeline Roadmap** — Upcoming deadlines and regulatory events with countdown indicators
- **Dark Mode** — Full light/dark theme support

## Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express.js + TypeScript
- **Build**: Vite (frontend) + esbuild (backend)
- **Routing**: Wouter with hash-based routing

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Install & Run

```bash
npm install
npm run dev
```

The dev server starts at `http://localhost:5000`.

### Production Build

```bash
npm run build
NODE_ENV=production node dist/index.cjs
```

## Data Model

Each statutory item includes:

| Field | Description |
|-------|-------------|
| `jurisdiction` | SG, HK, or MY |
| `category` | CPF, MPF, EPF, Tax Filing, etc. |
| `status` | RED (action required), AMBER (monitoring), GREEN (compliant) |
| `sourceTier` | Tier 1 (official gov), Tier 2 (circulars), Tier 3 (secondary) |
| `effectiveDate` | When the rule takes effect |
| `verifiedDate` | Last verification date |
| `sourceUrl` | Link to official source |

## Source of Truth Policy

- **Tier 1**: Official government sources (cpf.gov.sg, iras.gov.sg, mpfa.org.hk, ird.gov.hk, kwsp.gov.my, perkeso.gov.my, hasil.gov.my)
- **Tier 2**: Press releases, official circulars, gazette notices
- **Tier 3**: Secondary sources (news, advisories)

> Never treat Tier 3 as final truth if Tier 1 or Tier 2 disagrees.

## Baseline — March 2026

### Singapore
- CPF rates: 37% (≤55), 34% (55–60), 25% (60–65)
- OW ceiling: $8,000/month
- SHG/SDL contributions active
- IR8A e-filing by 1 Mar

### Hong Kong
- MPF: 5% employer + 5% employee
- Min/Max RI: $7,100–$30,000/month
- Offsetting abolished May 2025
- eMPF: 15/17 trustees onboarded

### Malaysia
- EPF: 12/13% employer + 11% employee
- Foreign workers: mandatory 2%+2% from Oct 2025
- SOCSO ceiling: RM6,000
- EIS: 0.2%+0.2%
- LINDUNG 24/7: not yet gazetted

## License

Private — internal use only.
