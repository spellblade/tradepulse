# ADR-0001: Selection of Vite, React 19, and Client-Side Simulation Engine

## Status
Accepted

## Context
We require a high-frequency, sub-second latency simulated financial trading terminal and market tracker for Indian equity (BSE, NSE) and commodity (MCX) markets. The platform must operate at 60 FPS without requiring continuous server roundtrips or complex backend infrastructure for individual student, trader, or demo sessions.

## Decision
1. **Build Tool & Bundler**: Selected Vite with `@vitejs/plugin-react` and `@tailwindcss/vite` for sub-second development server startup, native ES module resolution, and high-performance production tree-shaking.
2. **Framework & UI Engine**: Adopted React 19 and TypeScript 5.8 with strict type checking and Recharts for interactive technical charts (candlesticks, area, SMA-20, EMA-50).
3. **Simulation Architecture**: Implemented a client-side `MarketEngine` running high-frequency ticks via a regulated timer, decoupling tick updates from React's render loop via subscriber callbacks and batching to guarantee stable 60 FPS performance.
4. **State Persistence**: Utilized browser `localStorage` with fallback to seeded initial defaults for user holdings, watchlists, and price alerts.

## Consequences
- **Positive**: Zero backend deployment operational cost; instantaneous page loads; runs completely offline once loaded; clean separation between market simulation state and UI components.
- **Negative**: Historical tick persistence across distinct machines or browser clearings is bounded by browser local storage policies.
