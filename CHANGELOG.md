# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Export trade book to CSV / PDF functionality.
- Custom watchlists for derivatives and commodities.

### Changed
- 

### Fixed
- 

---

## [0.1.0] - 2026-09-04

### Added
- **Real-Time Simulation Engine**: 60 FPS price tick engine simulating high-frequency order books, bid-ask spreads, and realistic volatility for Indian equity markets and commodities.
- **Tri-Market Coverage**: Live ticker streams and data models supporting BSE (Bombay Stock Exchange), NSE (National Stock Exchange of India), and MCX (Multi Commodity Exchange of India).
- **Index Ribbon**: Live tracking for SENSEX, NIFTY 50, MCX iCOMDEX, and INDIA VIX volatility gauge.
- **Analytical Interactive Charts**: Multi-timeframe candlestick & area charts powered by Recharts with SMA-20, EMA-50, volume bars, and price target lines.
- **Intraday Trading Panel**: Limit & Market order placement with leverage controls, automatic profit target auto-exit execution, and live P&L tracking.
- **Portfolio Tracking**: Real-time asset valuation, invested vs current capital, unrealized P&L, day return breakdown, and manual holding entry.
- **3-Market Screener & Heatmap**: Comprehensive tabular screener with dynamic exchange filtering (ALL, BSE, NSE, MCX), mini trend sparklines, and add/remove company watchlist management.
- **Volatility & Auto-Exit Alerts**: Notification bell and configurable price alert threshold manager.

### Changed
- Streamlined header layout by removing duplicate action buttons and refining telemetry density.
- Standardized section header sizes and trade action buttons across long and short ticker symbols.
- Updated application branding with a modern multi-tone candlestick pulse logo.

### Fixed
- Fixed screener market filter count badges where selecting an exchange filter accidentally zeroed out counts on other market tabs.
- Harmonized Cancel Order button colors to match the portfolio cancellation style.
