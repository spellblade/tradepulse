/**
 * Supported analytical chart timeframe resolutions.
 */
export type ChartTimeframe = '1m' | '5m' | '15m' | '1H' | '1D';

/**
 * Open-High-Low-Close (OHLC) candlestick point with volume and moving average overlays.
 */
export interface OHLCPoint {
  /** Epoch timestamp in milliseconds */
  timestamp: number;
  /** Human-readable time label for axes */
  timeLabel: string;
  /** Opening price for the timeframe interval */
  open: number;
  /** Highest price reached during interval */
  high: number;
  /** Lowest price reached during interval */
  low: number;
  /** Closing price at interval completion */
  close: number;
  /** Traded volume during interval */
  volume: number;
  /** 20-period Simple Moving Average overlay */
  sma20?: number;
  /** 50-period Exponential Moving Average overlay */
  ema50?: number;
}

/**
 * Supported Indian financial and commodity exchanges.
 */
export type MarketExchange = 'BSE' | 'NSE' | 'MCX';

/**
 * Core domain representation of an Indian stock, index component, or commodity asset.
 */
export interface StockSymbol {
  /** Unique symbol or asset identifier */
  id: string;
  /** Ticker symbol (e.g. 'RELIANCE', 'TCS', 'GOLD') */
  symbol: string;
  /** Formal corporate or commodity name */
  name: string;
  /** Industry sector category */
  sector: string;
  /** Associated market exchange */
  exchange: MarketExchange;
  /** Real-time simulated current price in INR */
  currentPrice: number;
  /** Previous trading session close price */
  previousClose: number;
  /** Absolute price movement from previous close */
  change: number;
  /** Percentage price movement from previous close */
  changePercent: number;
  /** Intraday high price */
  dayHigh: number;
  /** Intraday low price */
  dayLow: number;
  /** Total simulated volume today */
  volume: number;
  /** Average 30-day trading volume */
  avgVolume: number;
  /** Market capitalization string (e.g. '₹20.4L Cr') */
  marketCap: string;
  /** Price-to-Earnings valuation ratio */
  peRatio: number;
  /** Intraday volatility index (0.05 to 1.0; higher = wider stochastic swings) */
  volatilityIndex: number;
  /** Historical OHLC series for technical charts */
  history: OHLCPoint[];
  /** Trading unit description (e.g. '/ 10g', '/ bbl', '/ share') */
  unit?: string;
}

/**
 * User portfolio investment holding record.
 */
export interface PortfolioHolding {
  /** Unique holding identifier */
  id: string;
  /** Ticker symbol */
  symbol: string;
  /** Asset or company name */
  name: string;
  /** Number of shares or contracts held */
  quantity: number;
  /** Average acquisition price per unit in INR */
  avgBuyPrice: number;
  /** Industry sector */
  sector: string;
  /** Associated exchange */
  exchange?: MarketExchange;
}

/**
 * Lifecycle status of an intraday trading order.
 */
export type TradeStatus = 'OPEN' | 'AUTO_EXITED_PROFIT' | 'EXITED_MANUAL' | 'STOPPED_OUT';

/**
 * Active or completed intraday trade position in the order book.
 */
export interface IntradayTrade {
  /** Unique trade order identifier */
  id: string;
  /** Ticker symbol */
  symbol: string;
  /** Asset name */
  name: string;
  /** Long ('BUY') or Short ('SELL') position */
  type: 'BUY' | 'SELL';
  /** Order quantity */
  quantity: number;
  /** Price at order fill */
  entryPrice: number;
  /** Mark-to-market current price */
  currentPrice: number;
  /** Predefined absolute profit target threshold for auto-exit in INR */
  targetProfitAmount: number;
  /** Optional stop loss threshold in INR */
  stopLossAmount?: number;
  /** Realized or unrealized Profit & Loss in INR */
  pnl: number;
  /** Profit & Loss percentage */
  pnlPercent: number;
  /** Execution lifecycle status */
  status: TradeStatus;
  /** Epoch timestamp of trade entry */
  entryTime: number;
  /** Epoch timestamp of trade exit */
  exitTime?: number;
  /** Final closing price at exit */
  exitPrice?: number;
  /** Explanatory description of exit trigger */
  exitReason?: string;
  /** Flag indicating whether target-profit auto-exit triggered */
  autoExited?: boolean;
}

/**
 * Visual severity level for system alerts and popovers.
 */
export type AlertSeverity = 'info' | 'warning' | 'alert' | 'success';

/**
 * Volatility or trade execution event notification.
 */
export interface VolatilityAlert {
  /** Unique alert identifier */
  id: string;
  /** Event timestamp */
  timestamp: number;
  /** Affected ticker symbol */
  symbol: string;
  /** Asset name */
  name: string;
  /** Classification of notification trigger */
  type: 'SURGE' | 'DIVE' | 'HIGH_VOLATILITY' | 'AUTO_EXIT';
  /** Price at time of alert */
  price: number;
  /** Price change percentage */
  changePercent: number;
  /** Human-readable event description */
  message: string;
  /** Notification visual badge severity */
  severity: AlertSeverity;
  /** Read/acknowledged state */
  read: boolean;
}

/**
 * Benchmark exchange index or macroeconomic volatility indicator.
 */
export interface MarketIndex {
  /** Index ticker symbol (e.g. 'BSE SENSEX', 'NIFTY 50') */
  symbol: string;
  /** Benchmark name */
  name: string;
  /** Exchange affiliation or 'VIX' */
  exchange?: MarketExchange | 'VIX';
  /** Real-time index points */
  value: number;
  /** Day net point change */
  change: number;
  /** Day net percentage change */
  changePercent: number;
}

/**
 * Simulation tick velocity profile.
 */
export type MarketActivitySpeed = 'normal' | 'turbo' | 'hyper';

/**
 * Active technical indicator overlay selection.
 */
export type ChartIndicator = 'none' | 'sma20' | 'ema50';

/**
 * User-configured price threshold alert trigger.
 */
export interface CustomPriceAlert {
  /** Unique alert rule ID */
  id: string;
  /** Monitored stock symbol */
  symbol: string;
  /** Comparison condition */
  condition: 'ABOVE' | 'BELOW';
  /** Target threshold in INR */
  targetPrice: number;
  /** Whether rule is actively monitored */
  active: boolean;
  /** Creation epoch timestamp */
  createdAt: number;
  /** Trigger timestamp if fired */
  triggeredAt?: number;
}
