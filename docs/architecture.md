# TradePulse Architecture

This document describes the architectural layout, data flow, simulation loop, and state management of TradePulse.

---

## 1. High-Level Architecture Overview

TradePulse operates as a high-performance, client-side trading terminal and simulated exchange. The architecture is divided into three distinct layers:

```text
┌─────────────────────────────────────────────────────────────┐
│                    Presentation Layer                       │
│  (Header, Ticker Strip, Analytical Charts, Intraday, Screener)│
└──────────────────────────────▲──────────────────────────────┘
                               │  Custom React Hooks (useMarketData)
┌──────────────────────────────┴──────────────────────────────┐
│                  Application State & Storage                │
│  (React State, Observer Subscribers, LocalStorage Sync)     │
└──────────────────────────────▲──────────────────────────────┘
                               │  Event-Driven Updates / Ticks
┌──────────────────────────────┴──────────────────────────────┐
│                 Real-Time Simulation Engine                 │
│  (60 FPS Loop, Stochastic Price Model, Order Matching, Auto-Exit) │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Real-Time Simulation Engine (`src/services/marketEngine.ts`)

The simulation engine is implemented as an event-driven singleton:

- **60 FPS Animation Frame Loop**: Runs continuous market ticks using `requestAnimationFrame` with precise delta-time measurement.
- **Price Generation Mechanics**:
  - Uses geometric Brownian motion with mean reversion toward fundamental target values.
  - Applies exchange-specific volatility regimes (NSE large caps exhibit lower volatility than MCX commodities).
  - Updates day high, day low, percentage change, and volume accumulation per tick.
- **Speed & Throttling Modes**:
  - `normal`: Standard tick rate (~10 updates/sec).
  - `turbo`: Accelerated market activity (~30 updates/sec).
  - `hyper`: Stress-test mode (~60 updates/sec).
- **Automated Order Execution**:
  - On every price update, the engine inspects pending **LIMIT** orders. If the market price crosses the limit threshold, the order executes immediately.
- **Target-Profit Auto-Exit**:
  - If a trade has an active profit target or stop loss, the engine calculates the real-time position P&L on every tick.
  - Once the target percentage (e.g. +2.5%) is achieved, the engine automatically closes the position, logs an alert, and secures the profit.

---

## 3. Data Flow & Subscriptions

1. **Observer Pattern**:
   Components and hooks register listeners using `marketEngine.subscribe(callback)`.
2. **Batching**:
   Ticks are batched before dispatching to prevent excessive React re-renders while maintaining smooth UI animation.
3. **Data Hook (`src/hooks/useMarketData.ts`)**:
   Provides a clean React hook interface exposing:
   - `stocks`: Array of `StockSymbol` objects.
   - `indices`: Market indices (SENSEX, NIFTY 50, MCX iCOMDEX, INDIA VIX).
   - `trades`: Active and historical intraday trades.
   - `alerts`: Active volatility and execution notifications.
   - `fps`, `batchCount`, `isRunning`, `speed`: Engine telemetry.

---

## 4. Component Structure

- **`Header.tsx`**:
  Displays application brand, market connectivity status, simulation controls, price alert manager trigger, and the persistent indices ticker ribbon.
- **`TickerStrip.tsx`**:
  Smooth, continuous gliding ticker strip displaying Indian stocks with mini trend indicators and market filters. Supports customizable company lists.
- **`AnalyticalChart.tsx`**:
  Interactive technical chart with timeframe toggles (1m, 5m, 15m, 1h, 1D, 1W), SMA-20 / EMA-50 moving average overlays, and live volume bars.
- **`IntradayTradingPanel.tsx`**:
  Active position management, unrealized/realized P&L calculations, manual square-off controls, and trade execution forms.
- **`PortfolioPanel.tsx`**:
  Real-time portfolio valuation comparing invested versus current market value, day return breakdown, and manual holding entry.
- **`App.tsx (Screener Tab)`**:
  3-market tabular screener allowing dynamic filtering across BSE, NSE, and MCX, with add/remove company modals.

---

## 5. Storage & Persistence

TradePulse employs `localStorage` with fallback to seeded initial defaults (and backwards compatibility):
- `tradepulse_holdings`: User portfolio investments.
- `tradepulse_ticker_symbols`: Configured symbols displayed in the moving ticker strip.
- `tradepulse_screener_symbols`: Configured symbols tracked in the screener table.
- `tradepulse_price_alerts`: User-defined price threshold triggers.
