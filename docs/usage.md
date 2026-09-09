# User Guide & Workflows

This document outlines the core workflows and interaction patterns available in **TradePulse**.

---

## 1. Main Navigation Tabs

TradePulse organizes trading and market tracking into three primary views:

1. **Analytical Charts & Intraday**: Interactive candlestick/area charts, moving averages, and the active intraday order book.
2. **Portfolio Tracking**: Real-time position tracking, holding valuation, capital allocation, and manual stock holding entries.
3. **BSE NSE MCX Screener**: Tabular overview of Indian equities and commodities across the Bombay Stock Exchange, National Stock Exchange, and Multi Commodity Exchange.

---

## 2. Real-Time Ticker & Indices Ribbon

### Persistent Indices Ribbon
At the top of the viewport, the ribbon displays live updates for:
- **SENSEX (BSE)**: Top 30 companies on the Bombay Stock Exchange.
- **NIFTY 50 (NSE)**: Benchmark Indian market index.
- **MCX iCOMDEX**: Multi Commodity Exchange composite index.
- **INDIA VIX**: Real-time market volatility index.

### Gliding Ticker Strip
- Displays scrolling ticker cards with live prices, percentage changes, and trend arrows.
- Filter by exchange: Click **ALL**, **BSE**, **NSE**, or **MCX** in the strip to filter the ticker items.
- Click any card to load that asset into the analytical chart.
- Click the **Manage** button on the right to customize which symbols appear in the ticker (up to 20 assets).

---

## 3. Technical Chart Analysis

When viewing the **Analytical Charts** section:
- **Timeframe Selector**: Toggle between `1m`, `5m`, `15m`, `1h`, `1D`, and `1W` intervals.
- **Indicator Overlays**:
  - **SMA 20**: 20-period Simple Moving Average (amber line).
  - **EMA 50**: 50-period Exponential Moving Average (indigo line).
  - **Volume Bars**: Dynamic volume bars indicating bull/bear volume splits.
- **Trade Button**: Launch an order directly for the selected symbol with pre-filled live price data.

---

## 4. Placing Intraday Orders

1. Navigate to the **Analytical Charts & Intraday** tab.
2. Click **+ New Intraday Order** in the order section.
3. Fill in the order parameters:
   - **Order Type**: Select `BUY` (Long) or `SELL` (Short).
   - **Execution Category**:
     - `MARKET`: Executes immediately at the best available ask/bid price.
     - `LIMIT`: Executes automatically once the price crosses your specified limit price.
   - **Quantity**: Enter the number of shares or commodity contracts.
   - **Leverage**: Select from `1x`, `2x`, `3x`, `4x`, or `5x` intraday margin.
   - **Target-Profit Auto-Exit**: Enable to set a profit threshold (e.g., +2.5%). When the position reaches this target, the engine will automatically square off the trade.
4. Click **Place Order**.

---

## 5. Portfolio Management

1. Switch to the **Portfolio Tracking** tab.
2. Review top-level metrics:
   - **Total Current Value**: Live valuation reflecting market ticks.
   - **Total Invested Capital**: Original purchase cost.
   - **Total Overall Gain/Loss**: Absolute and percentage return.
   - **Today's Day Gain**: Single-day profit/loss movement.
3. **Add Manual Holdings**:
   - Click **+ Add Holding**.
   - Select the symbol, quantity, and average purchase price.
   - The holding will update in real time based on market simulation ticks.
4. **Remove Holdings**: Click **Remove** on any individual position.

---

## 6. Screener & Volatility Heatmap

1. Switch to the **BSE NSE MCX Screener** tab.
2. Filter assets by exchange: Click **ALL**, **BSE**, **NSE**, or **MCX**. The badges show the total symbols configured under each exchange.
3. View high-density financial metrics: Live Price, 24h Change, Day Range, Volume, Market Cap, and Volatility Index.
4. Click **Add Company** to append additional symbols to your active screener universe.

---

## 7. Price Alerts & Volatility Notifications

- **Notification Bell**: Located in the top header. Badges show unread alerts for high volatility moves, limit order fills, and auto-exit events.
- **Price Alert Config**: Click the bell-ring icon in the header to set custom price alert thresholds for any supported company.
