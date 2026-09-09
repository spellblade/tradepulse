export type ChartTimeframe = '1m' | '5m' | '15m' | '1H' | '1D';

export interface OHLCPoint {
  timestamp: number;
  timeLabel: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  sma20?: number;
  ema50?: number;
}

export type MarketExchange = 'BSE' | 'NSE' | 'MCX';

export interface StockSymbol {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  exchange: MarketExchange;
  currentPrice: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  avgVolume: number;
  marketCap: string;
  peRatio: number;
  volatilityIndex: number; // 0.05 to 1.0 (higher = wilder intraday swings)
  history: OHLCPoint[];
  unit?: string; // e.g. "/ 10g", "/ kg", "/ bbl", "/ share"
}

export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgBuyPrice: number;
  sector: string;
  exchange?: MarketExchange;
}

export type TradeStatus = 'OPEN' | 'AUTO_EXITED_PROFIT' | 'EXITED_MANUAL' | 'STOPPED_OUT';

export interface IntradayTrade {
  id: string;
  symbol: string;
  name: string;
  type: 'BUY' | 'SELL';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  targetProfitAmount: number; // e.g. +$100.00 target profit
  stopLossAmount?: number;    // e.g. -$50.00 stop loss
  pnl: number;
  pnlPercent: number;
  status: TradeStatus;
  entryTime: number;
  exitTime?: number;
  exitPrice?: number;
  exitReason?: string;
  autoExited?: boolean;
}

export type AlertSeverity = 'info' | 'warning' | 'alert' | 'success';

export interface VolatilityAlert {
  id: string;
  timestamp: number;
  symbol: string;
  name: string;
  type: 'SURGE' | 'DIVE' | 'HIGH_VOLATILITY' | 'AUTO_EXIT';
  price: number;
  changePercent: number;
  message: string;
  severity: AlertSeverity;
  read: boolean;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  exchange?: MarketExchange | 'VIX';
  value: number;
  change: number;
  changePercent: number;
}

export type MarketActivitySpeed = 'normal' | 'turbo' | 'hyper';

export type ChartIndicator = 'none' | 'sma20' | 'ema50';

export interface CustomPriceAlert {
  id: string;
  symbol: string;
  condition: 'ABOVE' | 'BELOW';
  targetPrice: number;
  active: boolean;
  createdAt: number;
  triggeredAt?: number;
}
