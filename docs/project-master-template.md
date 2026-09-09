# TradePulse — Project Master Template & Blueprint

This document serves as the canonical **Project Master Template** for **TradePulse**. It defines the architectural standards, directory hierarchy, core files, release procedures, and operational checklists required to maintain, scale, and distribute this repository.

---

## 1. Project Overview & Philosophy

TradePulse is an enterprise-grade, client-side simulated financial trading platform and market tracker for Indian equity (BSE, NSE) and commodity (MCX) markets.

### Key Tenets
1. **Zero-Backend Dependency**: Full 60 FPS price tick simulation, technical indicators, order execution, and portfolio revaluation operate entirely within the browser via Web APIs and `localStorage`.
2. **Strict Type Safety**: Comprehensive TypeScript domain typing across market symbols, trades, indices, alerts, and timeframes. Zero tolerance for untyped or `any` models.
3. **Observability & Performance**: Smooth requestAnimationFrame-driven tick loop decoupled from React render cycles through a subscriber/observer pipeline.
4. **Production Open-Source Standards**: Strict adherence to Conventional Commits, Semantic Versioning (SemVer 2.0.0), automated CI checks, security reporting protocols, and synchronized documentation.

---

## 2. Directory Hierarchy & File Map

```text
tradepulse/
├── .editorconfig                       # Cross-editor formatting rules (indent, charset, newlines)
├── .env.example                        # Required & optional environment variable definitions
├── .gitignore                          # Git artifact exclusions (node_modules, dist, temp files)
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml              # Standardized YAML bug reporting form
│   │   └── feature_request.yml         # Standardized YAML feature proposal form
│   ├── CODEOWNERS                      # Automated PR reviewer routing
│   ├── dependabot.yml                  # Automated dependency security scanning config
│   ├── PULL_REQUEST_TEMPLATE.md        # Pull request verification checklist
│   └── workflows/
│       └── ci.yml                      # GitHub Actions: Lint, test suite, and production build matrix
├── docs/
│   ├── index.md                        # Master documentation directory & navigation hub
│   ├── architecture.md                 # 60 FPS engine, Brownian motion, order book, observer
│   ├── coding-standards.md             # TypeScript conventions, Tailwind design tokens, accessibility
│   ├── setup.md                        # Prerequisites, local development, scripts, Docker/Vercel
│   ├── usage.md                        # User workflows: charts, intraday orders, screener, portfolio
│   ├── security.md                     # Local token handling, security boundaries, disclosure SLA
│   ├── adr/                            # Architecture Decision Records
│   │   └── 0001-record-architecture-decisions.md
│   ├── project-master-template.md      # This file — specific blueprint for TradePulse
│   └── universal-master-template.md    # Multi-language master template for any software project
├── public/
│   └── VERSION                         # Static runtime asset for client-side version fetching
├── src/
│   ├── components/
│   │   ├── AnalyticalChart.tsx         # Recharts candlestick/area chart with SMA/EMA overlays
│   │   ├── Header.tsx                  # App bar, live tick counter, version badge, simulation speed
│   │   ├── IntradayTradingPanel.tsx    # Order execution (Market/Limit), leverage, auto-exit targets
│   │   ├── NotificationsPopover.tsx    # Volatility and limit order execution notifications
│   │   ├── PortfolioPanel.tsx          # Real-time portfolio valuation, capital gain/loss tracker
│   │   ├── PriceAlertsModal.tsx        # Configurable asset price threshold trigger modal
│   │   └── TickerStrip.tsx             # Continuous gliding ticker strip with exchange filters
│   ├── data/
│   │   ├── initialData.ts              # Baseline market assets and indices
│   │   └── listedCompanies.ts          # Multi-market listed directory for BSE, NSE, and MCX
│   ├── hooks/
│   │   ├── useAppVersion.ts            # React hook fetching version from /VERSION with fallback
│   │   └── useMarketData.ts            # Reactive consumer hook for singleton market engine
│   ├── services/
│   │   └── marketEngine.ts             # 60 FPS market simulation, stochastic prices, order matching
│   ├── types.ts                        # Unified domain interfaces, types, and speed modes
│   ├── vite-env.d.ts                   # Vite client types & raw asset import declarations
│   ├── App.tsx                         # Primary application view, tab navigation, screener table
│   ├── index.css                       # Tailwind CSS 4 root import
│   └── main.tsx                        # React 19 root bootstrap & StrictMode mount
├── tests/
│   └── marketEngine.test.ts            # Automated unit test suite (indicators, engine, directory)
├── CHANGELOG.md                        # Keep a Changelog formatted release record
├── CONTRIBUTING.md                     # Branching strategy, Conventional Commits, contribution rules
├── LICENSE                             # MIT Open Source License
├── README.md                           # Primary landing page with badges, quickstart, and features
├── SECURITY.md                         # Vulnerability disclosure policy and security contacts
├── VERSION                             # Single source of truth for repository semantic version
├── metadata.json                       # AI Studio project configuration & capabilities
├── package.json                        # Node dependencies, scripts, project metadata
├── tsconfig.json                       # Strict TypeScript compiler options
├── vercel.json                         # Vercel deployment and SPA routing rewrite rules
└── vite.config.ts                      # Vite build pipeline and Tailwind CSS integration
```

---

## 3. Required Root Artifacts

Every release and checkout must contain these synchronized root artifacts:

| File | Purpose | Synchronization Rule |
| ---- | ------- | --------------------- |
| `VERSION` | Exact SemVer string (e.g. `0.1.0`). | **Single Source of Truth**. Must match `package.json` and `CHANGELOG.md`. |
| `package.json` | Project identity, dependencies, scripts. | `"version"` must match `VERSION`. |
| `public/VERSION` | Static copy of `VERSION`. | Served statically so client browsers can verify live release numbers. |
| `CHANGELOG.md` | Chronological release history. | Follows [Keep a Changelog](https://keepachangelog.com/). New features land in `[Unreleased]`. |
| `README.md` | Primary entry point for developers. | Badges for version, license, TypeScript, React, Tailwind, and CI status. |
| `LICENSE` | Legal distribution rights. | MIT License with author attribution. |
| `SECURITY.md` | Vulnerability disclosure workflow. | Contact information and expected SLA response times. |
| `CONTRIBUTING.md` | Development & contribution guide. | Branching strategy, commit messages, and PR guidelines. |
| `.editorconfig` | Cross-IDE formatting standard. | Ensures consistent indentation (2 spaces) and line endings (LF). |
| `vercel.json` | Production deployment routing. | Ensures static client-side SPA fallback (`/*` -> `/index.html`). |

---

## 4. Gitflow & Branching Standard

TradePulse follows a Gitflow-inspired branching convention:

```text
                  v0.1.0 (Tag)             v0.2.0 (Tag)
                     ▲                        ▲
main / master ───────●────────────────────────●────────► (Production Releases)
                     │ ◄── hotfix/*           │
develop       ───────┴────────●───────────────┴────────► (Active Integration)
                              ▲
                       feature/*, fix/*
```

### Branch Roles
- **`main` / `master`**: Production-ready code only. Direct commits are forbidden. Every merge to this branch is tagged with an annotated SemVer tag (e.g., `git tag -a v0.1.0 -m "Release v0.1.0"`).
- **`develop`**: Integration branch for upcoming releases. All feature and bugfix branches merge here via Pull Request.
- **`feature/<name>`**: New user-facing capabilities branched from and merged into `develop`.
- **`fix/<name>`**: Bug fixes branched from and merged into `develop`.
- **`hotfix/<name>`**: Critical emergency fixes branched directly from `main` (or `master`) and merged into both the primary release branch and `develop`.

---

## 5. Commit Message Specification

TradePulse enforces [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):

```text
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

### Allowed Types
- `feat`: New feature or user-facing enhancement.
- `fix`: Bug fix.
- `docs`: Documentation updates only.
- `style`: Formatting, whitespace, or styling cleanup (no logic change).
- `refactor`: Code refactoring without changing behavior.
- `perf`: Performance improvement (e.g., tick throttle optimizations).
- `test`: Adding or updating test suites.
- `chore`: Tooling, build config, CI, or dependency updates.

### Examples
- `feat(header): display live version badge beside app title`
- `fix(screener): preserve market count badges during exchange filtering`
- `docs(master-template): add comprehensive project blueprint`

---

## 6. Continuous Integration & Quality Gates

The GitHub Actions workflow (`.github/workflows/ci.yml`) executes on every push and pull request targeting `main`, `master`, or `develop`:

1. **Matrix Validation**: Tested against Node.js `20.x` and `22.x`.
2. **Type Check & Lint Gate**:
   ```bash
   npm run lint # Runs tsc --noEmit
   ```
3. **Production Build Gate**:
   ```bash
   npm run build # Compiles Vite bundle into dist/
   ```

A pull request may only be merged when both the linting and build checks pass with 0 errors.

---

## 7. Release & Deployment Checklist

When releasing a new version of TradePulse:

1. **Version Bump**:
   - Update `VERSION` (e.g. `0.2.0`).
   - Update `public/VERSION` with the identical string.
   - Update `package.json` `"version": "0.2.0"`.
2. **Changelog**:
   - Move entries from `[Unreleased]` to `[0.2.0] - YYYY-MM-DD` in `CHANGELOG.md`.
3. **Verification**:
   - Run `npm run lint` and `npm run build`.
4. **Git Tagging**:
   - Merge `develop` into `main` (or `master`).
   - Create an annotated Git tag:
     ```bash
     git tag -a v0.2.0 -m "Release v0.2.0"
     git push origin v0.2.0
     ```
5. **Deployment**:
   - Vercel or Cloud Run automatically deploys the updated branch with zero downtime.
