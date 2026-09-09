# TradePulse — Software Audit & Implementation Roadmap

> **Standard Compliance Baseline**: Adapted from `generic-audit-standards.md`, `generic-engineering-standards-v3.md`, and `universal-master-template-v3.md` for client-side single-page applications.

---

## Table of Contents

1. [1. Executive Summary](#1-executive-summary)
2. [2. Project Understanding & Architectural Mapping](#2-project-understanding--architectural-mapping)
3. [3. Findings Summary Table](#3-findings-summary-table)
4. [4. Detailed Audit Findings](#4-detailed-audit-findings)
5. [5. Consequence-Based Severity Ranking](#5-consequence-based-severity-ranking)
6. [6. Dependency Graph & Relationship Matrix](#6-dependency-graph--relationship-matrix)
7. [7. Safe Implementation Order](#7-safe-implementation-order)
8. [8. Phased Execution Roadmap](#8-phased-execution-roadmap)
9. [9. Step-by-Step Execution Plan](#9-step-by-step-execution-plan)
10. [10. Testing Strategy & Safety Net](#10-testing-strategy--safety-net)
11. [11. Quick Wins](#11-quick-wins)
12. [12. Technical Debt & Maintainability Observations](#12-technical-debt--maintainability-observations)
13. [13. Things That Should NOT Be Changed](#13-things-that-should-not-be-changed)
14. [14. Final Summary & Governance](#14-final-summary--governance)

---

## 1. Executive Summary

**TradePulse** is a high-performance, browser-native market simulator and intraday terminal for Indian equity markets (Bombay Stock Exchange [BSE], National Stock Exchange of India [NSE]) and commodities (Multi Commodity Exchange of India [MCX]). Built with **React 19**, **TypeScript 5.8**, **Vite 6**, and **Tailwind CSS v4**, it couples a 60 FPS in-memory stochastic tick generator with Recharts-powered technical indicators and an automated profit-target exit engine.

A comprehensive codebase audit was conducted by adapting the canonical standards from:
- `universal-master-template-v3.md` (Repository hygiene, metadata, docs hierarchy, release flows)
- `generic-engineering-standards-v3.md` (CI quality gates, split-environment testing, safety patterns)
- `generic-audit-standards.md` (Universal audit governance, consequence-driven priority model, dependency-aware sequencing)

### Overall Assessment
The codebase shows sound foundational engineering:
- **Zero-Backend Client Isolation**: No private credentials or API secrets leak into client bundles.
- **Repository Hygiene**: Version single source of truth (`VERSION`), Keep a Changelog (`CHANGELOG.md`), GitHub issue forms, and PR templates are established.
- **Strict Linting & Builds**: Strict TypeScript checks (`tsc --noEmit`), Vite production bundling, and unit tests run cleanly.

However, several defects, configuration discrepancies, and test coverage gaps exist that require remediation before higher-order features are added.

---

## 2. Project Understanding & Architectural Mapping

```text
┌─────────────────────────────────────────────────────────────────────────┐
│                           Presentation Layer                            │
│  ├── Header.tsx (Indices ribbon, telemetry, notification triggers)      │
│  ├── TickerStrip.tsx (Gliding ticker with 3-market exchange filter)     │
│  ├── AnalyticalChart.tsx (Recharts candlestick/area, SMA-20, EMA-50)   │
│  ├── IntradayTradingPanel.tsx (Active trades, auto-exit progress)       │
│  ├── PortfolioPanel.tsx (Holdings valuation, sector allocation, CSV)   │
│  └── Screener (3-Market tabular screener with custom watchlists)        │
└────────────────────────────────────▲────────────────────────────────────┘
                                     │ React Hooks (useMarketData.ts)
┌────────────────────────────────────┴────────────────────────────────────┐
│                    State Persistence & Subscriber Bus                   │
│  ├── Observer subscription callbacks                                    │
│  └── localStorage sync ('tradepulse_holdings', 'tradepulse_screener_...')│
└────────────────────────────────────▲────────────────────────────────────┘
                                     │ Real-Time Ticks (Event Loop)
┌────────────────────────────────────┴────────────────────────────────────┐
│                    Simulation Engine (MarketEngine.ts)                  │
│  ├── 60 FPS Throttled Tick Loop (requestAnimationFrame batching)        │
│  ├── Geometric Brownian Jump Model with mean reversion                  │
│  ├── Auto-Exit Target Profit & Stop Loss Evaluator                      │
│  └── Custom Price Alert Trigger Engine                                  │
└─────────────────────────────────────────────────────────────────────────┘
```

- **Runtime Target**: Client browser (SPA).
- **Core State Engine**: `src/services/marketEngine.ts` singleton instance.
- **Build Toolchain**: Vite 6, `@tailwindcss/vite`, ES2022 target.
- **Testing Runner**: Node.js native test runner via `tsx --test tests/**/*.test.ts`.

---

## 3. Findings Summary Table

| ID | Priority | Category | Finding Title | Impact | Confidence | Dependencies |
| :--- | :---: | :--- | :--- | :--- | :---: | :--- |
| **F-001** | **P2** | Maintainability | Unused Backend & AI Dependencies in Manifest | Bloated dependency tree, supply-chain scan noise | Confirmed | None |
| **F-002** | **P2** | Correctness | Foreign US Equity (`'AAPL'`) Fallback in Portfolio | Broken state if stock array reinitializes | Confirmed | None |
| **F-003** | **P2** | Maintainability | Orphaned Component Artifact (`AlertsModal.tsx`) | Clutters source tree, developer confusion | Confirmed | None |
| **F-004** | **P3** | Operational | Missing Automated Release Pipeline (`release.yml`) | Manual tagging required; blueprint deviation | Confirmed | None |
| **F-005** | **P3** | Documentation/DX | Documentation Drift on Limit Orders and Leverage | Misleads users and contributors on trade mechanics | Confirmed | None |
| **F-006** | **P3** | Testing | Untested Auto-Exit & Custom Alert Lifecycles | Risk of regressions during engine refactoring | Confirmed | None |

---

## 4. Detailed Audit Findings

### F-001 — Unused Backend & AI Dependencies in Manifest
- **Priority**: P2 (Medium)
- **Category**: Maintainability / Operational
- **Confidence**: Confirmed
- **Location**: `package.json:L15-L20`
- **Blast Radius**: Small

**Problem** — `package.json` specifies `express`, `@types/express`, `@google/genai`, and `dotenv` in dependencies/devDependencies. Zero files in `src/` import or consume these packages.

**Evidence** —
`package.json`:
```json
"dependencies": {
  "@google/genai": "^2.4.0",
  "@tailwindcss/vite": "^4.1.14",
  "@vitejs/plugin-react": "^5.0.4",
  "canvas-confetti": "^1.9.4",
  "dotenv": "^17.2.3",
  "express": "^4.21.2",
...
```
A ripgrep search for `genai`, `express`, and `dotenv` across `src/` yields 0 occurrences.

**Why It Matters** — Including Node.js backend frameworks and generative AI SDKs in a client-only Vite browser SPA adds unnecessary bundle bloat, inflates `node_modules` install duration, and triggers false dependency vulnerability alerts.

**Recommended Fix** — Remove the unused packages:
```bash
npm uninstall express @types/express @google/genai dotenv
```

**Risks of Fixing** — None. No application code depends on these packages.

**Dependencies** — None.

**Validation** — Run `npm test && npm run lint && npm run build` to confirm build succeeds without errors.

---

### F-002 — Foreign US Equity Symbol (`'AAPL'`) Fallback in Indian Portfolio Panel
- **Priority**: P2 (Medium)
- **Category**: Correctness / Architecture
- **Confidence**: Confirmed
- **Location**: `src/components/PortfolioPanel.tsx:L39`
- **Blast Radius**: Small

**Problem** — The `PortfolioPanel` state initializes `selectedStockSymbol` with `'AAPL'` as the fallback if `stocks[0]` is undefined.

**Evidence** —
`src/components/PortfolioPanel.tsx`:
```typescript
const [selectedStockSymbol, setSelectedStockSymbol] = useState(stocks[0]?.symbol || 'AAPL');
```

**Why It Matters** — TradePulse is strictly modeled for Indian markets (BSE, NSE, MCX). `'AAPL'` does not exist in `LISTED_COMPANIES_DIRECTORY`. If `stocks` is empty during a cold boot or rehydration, a holding for `'AAPL'` can be instantiated with broken ticker telemetry, zero price updates, and NaN valuations.

**Recommended Fix** — Replace `'AAPL'` with `'RELIANCE'` or `'TCS'`:
```typescript
const [selectedStockSymbol, setSelectedStockSymbol] = useState(stocks[0]?.symbol || 'RELIANCE');
```

**Risks of Fixing** — None.

**Dependencies** — None.

**Validation** — Open the Add Holding modal when no initial selection is passed and verify the default is an active Indian stock (`RELIANCE`).

---

### F-003 — Orphaned Component Artifact (`AlertsModal.tsx`)
- **Priority**: P2 (Medium)
- **Category**: Maintainability
- **Confidence**: Confirmed
- **Location**: `src/components/AlertsModal.tsx`
- **Blast Radius**: Small

**Problem** — The file `src/components/AlertsModal.tsx` contains a standalone modal component that was replaced by `NotificationsPopover.tsx` and `PriceAlertsModal.tsx`. It is neither imported nor rendered anywhere in the application.

**Evidence** —
Codebase search for `AlertsModal` confirms imports exist only in self-declaration:
```typescript
export const AlertsModal: React.FC<AlertsModalProps> = ({ ...
```
No other component in `src/` imports `AlertsModal`.

**Why It Matters** — Dead component files create maintenance overhead, confuse contributors, and cause duplicated or diverging component patterns.

**Recommended Fix** — Remove `src/components/AlertsModal.tsx`.

**Risks of Fixing** — Zero runtime impact.

**Dependencies** — None.

**Validation** — Run `npx tsc --noEmit` to confirm no broken import paths.

---

### F-004 — Missing Automated Release Pipeline (`release.yml`)
- **Priority**: P3 (Low)
- **Category**: Operational / CI/CD
- **Confidence**: Confirmed
- **Location**: `.github/workflows/`
- **Blast Radius**: Small

**Problem** — Section 1.2 of the Universal Master Template v3 requires both `.github/workflows/ci.yml` and `.github/workflows/release.yml`. Only `ci.yml` is present in the repository.

**Evidence** — Directory listing of `.github/workflows/` contains only `ci.yml`.

**Why It Matters** — Releases must currently be created manually via GitHub CLI or web UI. Automated release workflows guarantee standardized release notes, tag verification, and asset publishing.

**Recommended Fix** — Create `.github/workflows/release.yml` triggered on push of tags matching `v*`:
```yaml
name: Release
on:
  push:
    tags:
      - 'v*'
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Create GitHub Release
        uses: softprops/action-gh-release@v2
        with:
          generate_release_notes: true
```

**Risks of Fixing** — Minimal. Workflow only triggers when a release tag is pushed.

**Dependencies** — None.

**Validation** — Lint workflow with GitHub Actions schema validators.

---

### F-005 — Documentation Drift Regarding Limit Orders & Margin Leverage
- **Priority**: P3 (Low)
- **Category**: Documentation/DX
- **Confidence**: Confirmed
- **Location**: `README.md:L24`, `docs/usage.md:L50-L58`, `docs/architecture.md:L43-L45`
- **Blast Radius**: Small

**Problem** — The README and user guide state that the terminal provides:
> *"Seamless Market and Limit order placement with leverage configuration (1x to 5x)..."*
In the actual implementation (`IntradayTradingPanel.tsx` and `NewOrderModal.tsx`), orders are executed at market with customizable `Target Profit (₹)` and `Stop Loss (₹)` auto-exit triggers. There are no limit order queues or leverage dropdowns in the UI.

**Why It Matters** — Documentation drift misleads users and contributors regarding the operational capabilities of the platform.

**Recommended Fix** — Update `docs/usage.md`, `docs/architecture.md`, and `README.md` to accurately describe the actual intraday order model: instantaneous market execution with automated profit target exits and stop loss bounds.

**Risks of Fixing** — None.

**Dependencies** — None.

**Validation** — Review markdown files for consistency with code.

---

### F-006 — Test Suite Scope Confined to Static Initialization Logic
- **Priority**: P3 (Low)
- **Category**: Testing / Reliability
- **Confidence**: Confirmed
- **Location**: `tests/marketEngine.test.ts`
- **Blast Radius**: Medium

**Problem** — While the test suite verifies OHLC candle generation, directory template instantiation, and speed changes, it lacks automated test coverage for core business logic:
- Auto-exit execution on target profit hit (`triggerSpikeToTargetProfit`).
- Stop-loss execution when price drops below stop loss threshold.
- Manual exit lifecycle transitions (`exitTradeManually`).
- Custom price alert triggering (`addCustomPriceAlert`).

**Why It Matters** — Auto-exit on profit target is the primary functional highlight of the intraday terminal. Uncovered execution paths risk silent regressions when the simulation tick loop is refactored.

**Recommended Fix** — Add comprehensive unit tests in `tests/marketEngine.test.ts` covering:
1. `addIntradayTrade` creates an `OPEN` position.
2. `triggerSpikeToTargetProfit` transitions trade status to `AUTO_EXITED_PROFIT` with correct P&L calculation.
3. `exitTradeManually` transitions trade status to `EXITED_MANUAL`.
4. `addCustomPriceAlert` triggers an alert when condition is met.

**Risks of Fixing** — Low. Tests are completely isolated from production runtime.

**Dependencies** — None.

**Validation** — Run `npm test` and verify all new test assertions pass cleanly.

---

## 5. Consequence-Based Severity Ranking

In accordance with Section 1.4 of `generic-audit-standards.md`, findings are ranked strictly by consequence:

1. **F-002 (P2 — Correctness)**: Foreign symbol (`'AAPL'`) fallback in Indian stock market context risks broken application state and NaN valuation calculations.
2. **F-001 (P2 — Maintainability / Operational)**: Declaring unused server and AI packages bloats dependency trees and exposes the project to supply-chain vulnerability noise.
3. **F-003 (P2 — Maintainability)**: Dead component artifact (`AlertsModal.tsx`) introduces code divergence.
4. **F-006 (P3 — Testing)**: Missing unit tests over auto-exit and stop-loss logic leaves critical business workflows unprotected.
5. **F-004 (P3 — Operational)**: Missing automated release workflow requires manual release management.
6. **F-005 (P3 — Documentation/DX)**: Documentation drift regarding order types and leverage.

---

## 6. Dependency Graph & Relationship Matrix

Applying Section 3.2 classifications from `generic-audit-standards.md`:

```text
┌────────────────────────┐
│  F-006: Add Tests for  │
│  Auto-Exit & Trades    │ (Safety Net for future simulation changes)
└───────────┬────────────┘
            │  Hard Prerequisite (F-006 ──► Future Engine Refactoring)
            ▼
┌────────────────────────┐         ┌────────────────────────┐
│  F-002: Fix 'AAPL'     │ ⟂       │  F-001: Prune Unused   │
│  Fallback in Portfolio │         │  Dependencies          │
└────────────────────────┘         └───────────┬────────────┘
            ⟂                                  │  Strong Recommendation
┌────────────────────────┐                     ▼
│  F-003: Remove Dead    │         ┌────────────────────────┐
│  AlertsModal.tsx       │         │  F-004: Add Release    │
└────────────────────────┘         │  Workflow Pipeline     │
            ⟂                      └────────────────────────┘
┌────────────────────────┐
│  F-005: Align Docs     │
│  on Order Mechanics    │
└────────────────────────┘
```

- **F-006 $\rightarrow$ Engine Refactoring**: Establishing tests for Auto-Exit is a hard prerequisite before making modifications to `MarketEngine.ts`.
- **F-001 $\Rightarrow$ F-004**: Pruning unused dependencies minimizes the build footprint before formalizing automated release builds.
- **F-002, F-003, F-005**: Completely independent ($F \perp F$) and can be executed concurrently.

---

## 7. Safe Implementation Order

Applying Section 3.3 ("Hard Prerequisite Rule & Safety Net Sequencing"):

| Step | Finding ID | Priority | Implementation Ease | Risk | Dependencies | Rationale |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | **F-002** | P2 | Easy | Low | None | Trivial 1-line change fixing domain data integrity in `PortfolioPanel.tsx`. |
| **2** | **F-003** | P2 | Easy | Low | None | Safe deletion of unused `AlertsModal.tsx` file. |
| **3** | **F-006** | P3 | Moderate | Low | None | Establishes regression safety net for auto-exit, stop loss, and trade lifecycles. |
| **4** | **F-001** | P2 | Easy | Low | None | Uninstalls dead dependencies (`express`, `dotenv`, `@google/genai`) without code risk. |
| **5** | **F-005** | P3 | Easy | Low | None | Synchronizes README, `docs/usage.md`, and `docs/architecture.md` with implementation. |
| **6** | **F-004** | P3 | Easy | Low | F-001 | Adds `.github/workflows/release.yml` conforming to Universal Master Template. |

---

## 8. Phased Execution Roadmap

### Phase 1: Foundations & Quick Fixes (Immediate)
- **Step 1**: Replace `'AAPL'` fallback in `PortfolioPanel.tsx` with `'RELIANCE'` (**F-002**).
- **Step 2**: Remove orphaned `AlertsModal.tsx` component (**F-003**).
- **Step 3**: Add test suite coverage for Auto-Exit target profit spikes, manual exits, and alerts (**F-006**).

### Phase 2: Dependency & Supply-Chain Hygiene
- **Step 4**: Prune unused packages `express`, `@types/express`, `@google/genai`, and `dotenv` from `package.json` (**F-001**).
- **Step 5**: Re-lock dependencies and verify clean build (`npm run build`).

### Phase 3: Documentation Alignment & CI/CD Completion
- **Step 6**: Update `README.md`, `docs/usage.md`, and `docs/architecture.md` to reflect actual auto-exit order mechanics (**F-005**).
- **Step 7**: Implement `.github/workflows/release.yml` for automated GitHub Releases on SemVer tags (**F-004**).

---

## 9. Step-by-Step Execution Plan

### Step 1: Fix Portfolio Symbol Fallback (F-002)
- **Goal**: Ensure fallback holding selection always resolves to a valid Indian stock.
- **Changes**: Modify `src/components/PortfolioPanel.tsx:39` from `'AAPL'` to `'RELIANCE'`.
- **Verification**: Run `npm run lint` and verify portfolio modal defaults to `RELIANCE`.

### Step 2: Remove Dead Component Artifact (F-003)
- **Goal**: Clean up obsolete component code.
- **Changes**: Delete `src/components/AlertsModal.tsx`.
- **Verification**: Run `npx tsc --noEmit` to confirm no broken import paths.

### Step 3: Expand Test Coverage Over Auto-Exit Logic (F-006)
- **Goal**: Add unit tests for auto-exit profit triggers, stop loss bounds, and manual exits.
- **Changes**: Add new `describe('Intraday Trades & Auto-Exit Engine [Unit]')` block in `tests/marketEngine.test.ts`:
  - Test opening trade sets status `OPEN`.
  - Test `triggerSpikeToTargetProfit()` triggers auto-exit, updates status to `AUTO_EXITED_PROFIT`, and logs success alert.
  - Test `exitTradeManually()` updates status to `EXITED_MANUAL`.
- **Verification**: Execute `npm test`.

### Step 4: Prune Unused Dependencies (F-001)
- **Goal**: Remove unused packages to streamline installation and dependencies.
- **Changes**: Run `npm uninstall express @types/express @google/genai dotenv`.
- **Verification**: Run `npm run lint && npm test && npm run build`.

### Step 5: Align Documentation on Order Types (F-005)
- **Goal**: Eliminate discrepancy between documented order types and UI features.
- **Changes**: Update `README.md`, `docs/usage.md`, and `docs/architecture.md` to accurately document the auto-exit intraday engine.
- **Verification**: Review markdown links and text accuracy.

### Step 6: Create Release Workflow (F-004)
- **Goal**: Implement release automation compliant with Universal Master Template v3.
- **Changes**: Add `.github/workflows/release.yml`.
- **Verification**: Validate YAML syntax against GitHub Actions specification.

---

## 10. Testing Strategy & Safety Net

In accordance with Model C of `generic-engineering-standards-v3.md`:
- **Tagging Discipline**: All tests are tagged with `[Unit]` or `[Integration]`.
- **Isolation**: Market simulation tests run in-memory without browser dependencies (mocked or non-reliant on DOM).
- **Assertion Validity**: Avoid tautological assertions (`assert.ok(true)`). Ensure exact state checks (e.g. `assert.equal(trade.status, 'AUTO_EXITED_PROFIT')`).

---

## 11. Quick Wins (Low Risk / Zero Regression)

1. **Fallback Fix (`PortfolioPanel.tsx`)**: Immediate 1-line change fixing domain correctness.
2. **Delete Orphaned File (`AlertsModal.tsx`)**: Zero risk since it is unreferenced.
3. **Docs Correction**: Pure documentation adjustments with no code risk.

---

## 12. Technical Debt & Maintainability Observations

1. **Hardcoded Initial Lists**: Initial stocks, directory templates, and holdings are maintained in TypeScript arrays in `src/data/`. This is clean for an offline client simulator, but if extended to historical backend streaming, these should be adapted through a repository interface.
2. **Tailwind v4 Setup**: Uses modern `@tailwindcss/vite` plugin seamlessly without legacy PostCSS configs.
3. **Canvas Confetti Call**: Safely wrapped inside a `try/catch` in `marketEngine.ts` to prevent crashes in headless or non-canvas test environments.

---

## 13. Things That Should NOT Be Changed

1. **Decoupled Simulation Engine**: The singleton `MarketEngine` running high-frequency ticks on a regulated interval while notifying UI via `requestAnimationFrame` guarantees smooth 60 FPS performance without React render loop thrashing.
2. **Domain Type Definitions**: The types in `src/types.ts` are well-modeled, strictly typed, and free of `any`.
3. **Dark-Mode Fintech UI**: The styling strictly adheres to the established palette in `docs/coding-standards.md`.
4. **Single Source of Truth Versioning**: `VERSION` is accurately parsed dynamically via `useAppVersion.ts`.

---

## 14. Final Summary & Governance

The proposed 6-step remediation plan resolves all identified defects while introducing zero breaking architectural changes. All remediation steps strictly comply with the governance principles of `generic-audit-standards.md` and `generic-engineering-standards-v3.md`.
