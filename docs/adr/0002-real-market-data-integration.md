# 2. Real Market Data Integration (BSE, NSE, MCX)

Date: 2026-09-08

## Status

Accepted

## Context

In Version 0.1.0, TradePulse utilized a client-side synthetic geometric Brownian motion model to simulate intraday stock price jumps. For Version 0.2.0, the requirement was to track real, live market data across Indian financial markets, specifically:
- Bombay Stock Exchange (BSE) equities and BSE SENSEX 30 index.
- National Stock Exchange of India (NSE) equities, NIFTY 50 index, and INDIA VIX.
- Multi Commodity Exchange of India (MCX) commodities (Gold, Silver, Crude Oil, Natural Gas, Copper) and MCX iCOMDEX.

## Decision

1. **Full-Stack Architecture**:
   - Implemented an Express backend (`server.ts`) serving dedicated REST endpoints:
     - `/api/market/quotes`: Real quotes and indices across BSE, NSE, and MCX.
     - `/api/market/indices`: Benchmarks (`BSE SENSEX`, `NIFTY 50`, `MCX iCOMDEX`, `INDIA VIX`).
     - `/api/market/history/:symbol`: Historical and intraday candlestick data with technical indicators.
     - `/api/market/status`: Exchange operational telemetry.
2. **Provider & Caching Strategy (`src/server/realMarketProvider.ts`)**:
   - Parallel fetching from exchange feed gateways with an in-memory cache (8 seconds for live quotes, 30 seconds for candlestick histories) to prevent rate limiting.
   - Robust fallback mechanism to static baselines if network issues occur.
3. **Currency & Unit Parity**:
   - Live USD/INR conversion rate (`INR=X`) fetched dynamically.
   - Precious metals (Gold per 10g, Silver per kg) incorporate Indian import tariff and GST parity factors for authentic domestic MCX pricing.
4. **Client Mode Switching**:
   - Users can seamlessly switch between **Live Market (BSE • NSE • MCX)** and **Simulate** mode via the UI toolbar.

## Consequences

- Real-time prices reflect genuine Indian market sessions and after-hours levels.
- Charting displays true historical candlesticks from exchange feeds.
- Offline and preview resiliency is guaranteed via automatic caching and graceful fallback.
