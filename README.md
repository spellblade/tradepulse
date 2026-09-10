# TradePulse — Indian Stock Market & Intraday Trading Platform

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](VERSION)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Build Status](https://github.com/spellblade/tradepulse/actions/workflows/ci.yml/badge.svg)](https://github.com/spellblade/tradepulse/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](tsconfig.json)
[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react)](package.json)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8?logo=tailwindcss)](src/index.css)

> Real-time Indian equity and commodity market tracker and intraday trading terminal across BSE, NSE, and MCX.

TradePulse provides traders, analysts, and developers with a responsive, high-fidelity market simulator and intraday terminal. It combines real-time streaming price feeds across the Bombay Stock Exchange (BSE), National Stock Exchange of India (NSE), and Multi Commodity Exchange (MCX) with interactive technical charts, an intraday order book with automated profit-target exits, and instant portfolio revaluation.

## Problem Statement
Access to live, realistic exchange-grade market simulation environments for Indian equities and commodities often requires expensive brokerage subscriptions or complex, error-prone local server setups. TradePulse eliminates these barriers by providing a zero-backend, browser-native 60 FPS market simulation terminal that operates completely offline with realistic stochastic price mechanics, technical indicators, and automated profit-target order books.

---

## Key Features

- **Tri-Exchange Real-Time Feeds**: Unified price updates and market indices for BSE (SENSEX), NSE (NIFTY 50), and MCX (iCOMDEX, Gold, Silver, Crude Oil) with real-time India VIX telemetry.
- **High-Performance Simulation Engine**: Dedicated 60 FPS tick generator simulating realistic price volatility, bid-ask spreads, and order book dynamics with adjustable speed controls (Normal, Turbo, Hyper).
- **Interactive Technical Analysis**: Recharts-powered multi-timeframe analytical charts (1m, 5m, 15m, 1h, 1D, 1W) with SMA-20, EMA-50 moving average overlays, and live volume bars.
- **Intraday Trading Terminal**: Seamless Market and Limit order placement with leverage configuration (1x to 5x), live position tracking, and automated target-profit exit triggers.
- **Live Portfolio Management**: Portfolio allocation breakdown, day returns, invested vs. current valuation, and custom holding entries with persistent local storage.
- **3-Market Screener**: Tabular screener with instant exchange filtering (ALL, BSE, NSE, MCX), mini trend sparklines, and custom watchlist customization.
- **Alerts & Notifications**: Notification tray for volatility events, limit order fills, auto-exit triggers, and custom price threshold configurations.

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v18.0.0 or higher; v20/v22 LTS recommended)
- [npm](https://www.npmjs.com/) (v9.0.0 or higher)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/spellblade/tradepulse.git
   cd tradepulse
   ```

2. **Configure environment & install dependencies**:
   ```bash
   cp .env.example .env
   npm install
   ```

### Running the Application

- **Development Mode**:
  ```bash
  npm run dev
  ```
  Open [http://localhost:3000](http://localhost:3000) in your browser to view the live platform.

- **Production Build**:
  ```bash
  npm run build
  npm run preview
  ```

- **Automated Tests**:
  ```bash
  npm test
  ```

- **Type Check & Linting**:
  ```bash
  npm run lint
  ```

---

## Project Directory Structure

```text
tradepulse/
├── .github/
│   ├── workflows/
│   │   └── ci.yml                      # GitHub Actions CI multi-stage workflow
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.yml              # YAML-based structured bug report form
│   │   └── feature_request.yml         # YAML-based structured feature request form
│   ├── CODEOWNERS                      # Automated PR reviewer routing
│   ├── dependabot.yml                  # Automated weekly dependency scan configuration
│   └── PULL_REQUEST_TEMPLATE.md        # Pull request template with verification checklist
├── docs/
│   ├── index.md                        # Documentation navigation index
│   ├── architecture.md                 # System architecture, 60 FPS simulation, data flows
│   ├── setup.md                        # Developer onboarding, local execution, troubleshooting
│   ├── usage.md                        # User workflows, intraday terminal, screener, portfolio
│   ├── coding-standards.md             # TypeScript conventions, style guide, banned idioms
│   ├── security.md                     # Local token handling, security boundaries, disclosure SLA
│   ├── adr/                            # Architecture Decision Records
│   │   └── 0001-record-architecture-decisions.md
│   ├── project-master-template.md      # Blueprint and operational checklists for TradePulse
│   └── universal-master-template.md    # Multi-stack repository master blueprint
├── src/
│   ├── components/                     # Modular UI components (Terminal, Screener, Charts)
│   ├── data/                           # Listed stock directory, indices, and asset definitions
│   ├── hooks/                          # Custom React hooks (useMarketData)
│   ├── services/                       # Real-time simulation engine (marketEngine)
│   ├── types.ts                        # Core TypeScript domain models & interfaces
│   ├── App.tsx                         # Primary application view & layout
│   └── main.tsx                        # Application bootstrap entry point
├── tests/                              # Automated test suite
│   └── marketEngine.test.ts            # Unit tests for indicators, simulation, and data integrity
├── .editorconfig                       # Cross-editor formatting rules (indent, charset, newlines)
├── .env.example                        # Required & optional environment variable declarations
├── .gitignore                          # Git artifact exclusions (node_modules, dist, temp files)
├── CHANGELOG.md                        # Human-readable release history (Keep a Changelog format)
├── CONTRIBUTING.md                     # Developer onboarding, branching, commit conventions
├── LICENSE                             # MIT license terms
├── package.json                        # Manifest, dependencies, and test/build scripts
├── README.md                           # Primary entry point & documentation map
├── SECURITY.md                         # Security policy and vulnerability disclosure SLA
└── VERSION                             # Machine-readable single source of truth for versioning
```

---

## Documentation Map

Comprehensive project documentation is available in the [`docs/`](docs/) directory:

* [Documentation Index](docs/index.md) — Central navigation hub and technology stack overview.
* [Architecture & Engine Design](docs/architecture.md) — Real-time 60 FPS tick generator, event bus, and state design.
* [Developer Setup Guide](docs/setup.md) — Tooling, package managers, and local execution troubleshooting.
* [User Guide & Workflows](docs/usage.md) — Operational manuals for charts, intraday orders, screener, and portfolio.
* [Coding Standards](docs/coding-standards.md) — Style conventions, naming rules, testing patterns, and banned idioms.
* [Security Policy & Operational Boundaries](docs/security.md) — Local storage boundaries, disclosure SLA, and threat model.
* [Architecture Decision Records (ADRs)](docs/adr/0001-record-architecture-decisions.md) — Records of major architectural selections.
* [Project Master Template](docs/project-master-template.md) — Canonical blueprint and operational checklists for TradePulse.
* [Universal Master Template](docs/universal-master-template.md) — Multi-stack repository master blueprint.

---

## Contributing

We welcome contributions from the community! Please read our [Contributing Guide](CONTRIBUTING.md) for branch models, Conventional Commit formats, and development procedures.

---

## Security

For vulnerability reporting instructions and policy, please refer to [SECURITY.md](SECURITY.md).

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
