import { StockSymbol, MarketIndex, OHLCPoint, MarketExchange } from '../types';
import { SYMBOL_MAPPINGS, getExternalTicker, convertCommodityToINR, USD_INR_TICKER } from './symbolMapper';
import { isMarketOpen } from './exchangeSchedule';

/**
 * Normalized market quote model returned by the live market data service.
 */
export interface LiveQuote {
  /** Internal TradePulse symbol */
  symbol: string;
  /** Primary market exchange */
  exchange: MarketExchange | 'VIX';
  /** Current or official closing price in INR */
  price: number;
  /** Previous session closing price */
  previousClose: number;
  /** Absolute net price movement */
  change: number;
  /** Percentage price movement from previous close */
  changePercent: number;
  /** Intraday high price */
  dayHigh: number;
  /** Intraday low price */
  dayLow: number;
  /** Intraday traded volume */
  volume: number;
  /** Timestamp of quote in epoch milliseconds */
  timestamp: number;
  /** Whether this quote represents a live trading tick or an official session close */
  isLive: boolean;
}

/**
 * Real-time market feed service fetching live quotes and candle data for Indian markets.
 * Connects to Yahoo Finance via Vite development proxy with graceful offline/closed fallbacks.
 */
export class RealtimeMarketService {
  private quoteCache: Map<string, LiveQuote> = new Map();
  private usdInrRate: number = 86.5; // Baseline fallback exchange rate
  private lastFetchTime: number = 0;
  private isFetching: boolean = false;

  /**
   * Resolves the request URL for a given external ticker.
   * Uses the local Vite dev proxy `/api/market` or direct URL.
   */
  private getChartApiUrl(ticker: string, range: string = '1d', interval: string = '5m'): string {
    const encoded = encodeURIComponent(ticker);
    // When running under Vite, `/api/market` proxies directly to `https://query1.finance.yahoo.com`
    return `/api/market/v8/finance/chart/${encoded}?range=${range}&interval=${interval}&includePrePost=false`;
  }

  /**
   * Fetches the current live USD/INR exchange rate to accurately convert global commodity contracts into INR.
   */
  public async updateUsdInrRate(): Promise<number> {
    try {
      const url = this.getChartApiUrl(USD_INR_TICKER, '1d', '1h');
      const response = await fetch(url);
      if (!response.ok) return this.usdInrRate;

      const data = await response.json();
      const meta = data?.chart?.result?.[0]?.meta;
      const rate = meta?.regularMarketPrice;
      if (typeof rate === 'number' && rate > 0) {
        this.usdInrRate = rate;
      }
    } catch (e) {
      // Retain fallback rate silently
    }
    return this.usdInrRate;
  }

  /**
   * Fetches real-time market data for a single asset or index.
   *
   * @param {string} symbol - TradePulse symbol (e.g. 'RELIANCE', 'BSE SENSEX', 'GOLD').
   * @returns {Promise<LiveQuote | null>} Live quote with real price and change metrics.
   */
  public async fetchQuote(symbol: string): Promise<LiveQuote | null> {
    const mapping = SYMBOL_MAPPINGS[symbol];
    const externalTicker = getExternalTicker(symbol);
    const exchange = mapping?.exchange || 'NSE';

    try {
      const url = this.getChartApiUrl(externalTicker, '1d', '5m');
      const response = await fetch(url);
      if (!response.ok) {
        return this.quoteCache.get(symbol) || null;
      }

      const data = await response.json();
      const result = data?.chart?.result?.[0];
      if (!result || !result.meta) {
        return this.quoteCache.get(symbol) || null;
      }

      const meta = result.meta;
      let rawPrice = meta.regularMarketPrice ?? meta.chartPreviousClose ?? 0;
      let rawPrevClose = meta.chartPreviousClose ?? meta.previousClose ?? rawPrice;
      let rawHigh = meta.regularMarketDayHigh ?? rawPrice;
      let rawLow = meta.regularMarketDayLow ?? rawPrice;
      const volume = meta.regularMarketVolume ?? 0;

      // Handle commodity conversions for MCX contracts (USD -> INR per specified contract unit)
      if (mapping?.assetType === 'COMMODITY') {
        rawPrice = convertCommodityToINR(symbol, rawPrice, this.usdInrRate);
        rawPrevClose = convertCommodityToINR(symbol, rawPrevClose, this.usdInrRate);
        rawHigh = convertCommodityToINR(symbol, rawHigh, this.usdInrRate);
        rawLow = convertCommodityToINR(symbol, rawLow, this.usdInrRate);
      }

      const price = Number(rawPrice.toFixed(2));
      const previousClose = Number(rawPrevClose.toFixed(2));
      const change = Number((price - previousClose).toFixed(2));
      const changePercent = previousClose > 0 ? Number(((change / previousClose) * 100).toFixed(2)) : 0;
      const dayHigh = Number(rawHigh.toFixed(2));
      const dayLow = Number(rawLow.toFixed(2));

      const isLive = isMarketOpen(exchange === 'VIX' ? 'NSE' : exchange);

      const quote: LiveQuote = {
        symbol,
        exchange,
        price,
        previousClose,
        change,
        changePercent,
        dayHigh,
        dayLow,
        volume,
        timestamp: (meta.regularMarketTime ? meta.regularMarketTime * 1000 : Date.now()),
        isLive,
      };

      this.quoteCache.set(symbol, quote);
      return quote;
    } catch (error) {
      // Return cached quote if network fails
      return this.quoteCache.get(symbol) || null;
    }
  }

  /**
   * Fetches real historical OHLC candlestick series for a symbol to populate technical charts.
   *
   * @param {string} symbol - TradePulse symbol.
   * @param {string} [timeframe='1D'] - Chart resolution range.
   * @returns {Promise<OHLCPoint[] | null>} Real chronological OHLC points with moving average overlays.
   */
  public async fetchHistoricalCandles(symbol: string, timeframe: string = '1D'): Promise<OHLCPoint[] | null> {
    const externalTicker = getExternalTicker(symbol);
    const mapping = SYMBOL_MAPPINGS[symbol];

    let range = '1d';
    let interval = '5m';

    switch (timeframe) {
      case '1m':
        range = '1d';
        interval = '1m';
        break;
      case '5m':
        range = '1d';
        interval = '5m';
        break;
      case '15m':
        range = '5d';
        interval = '15m';
        break;
      case '1H':
        range = '1mo';
        interval = '60m';
        break;
      case '1D':
      default:
        range = '3mo';
        interval = '1d';
        break;
    }

    try {
      const url = this.getChartApiUrl(externalTicker, range, interval);
      const response = await fetch(url);
      if (!response.ok) return null;

      const data = await response.json();
      const result = data?.chart?.result?.[0];
      if (!result || !result.timestamp || !result.indicators?.quote?.[0]) return null;

      const timestamps: number[] = result.timestamp;
      const quotes = result.indicators.quote[0];
      const isCommodity = mapping?.assetType === 'COMMODITY';

      const points: OHLCPoint[] = [];

      for (let i = 0; i < timestamps.length; i++) {
        const t = timestamps[i] * 1000;
        let o = quotes.open?.[i];
        let h = quotes.high?.[i];
        let l = quotes.low?.[i];
        let c = quotes.close?.[i];
        const v = quotes.volume?.[i] || 0;

        // Skip null or missing points
        if (o === null || h === null || l === null || c === null || isNaN(c)) continue;

        if (isCommodity) {
          o = convertCommodityToINR(symbol, o, this.usdInrRate);
          h = convertCommodityToINR(symbol, h, this.usdInrRate);
          l = convertCommodityToINR(symbol, l, this.usdInrRate);
          c = convertCommodityToINR(symbol, c, this.usdInrRate);
        }

        const date = new Date(t);
        const timeLabel = timeframe === '1D'
          ? date.toLocaleDateString([], { month: 'short', day: 'numeric' })
          : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        points.push({
          timestamp: t,
          timeLabel,
          open: Number(o.toFixed(2)),
          high: Number(h.toFixed(2)),
          low: Number(l.toFixed(2)),
          close: Number(c.toFixed(2)),
          volume: Math.floor(v),
        });
      }

      // Calculate SMA-20 and EMA-50 overlays
      for (let i = 0; i < points.length; i++) {
        const startIdx = Math.max(0, i - 19);
        const subset = points.slice(startIdx, i + 1);
        const avg = subset.reduce((sum, p) => sum + p.close, 0) / subset.length;
        points[i].sma20 = Number(avg.toFixed(2));

        const k = 2 / (50 + 1);
        if (i === 0) {
          points[i].ema50 = points[0].close;
        } else {
          points[i].ema50 = Number((points[i].close * k + (points[i - 1].ema50 || points[0].close) * (1 - k)).toFixed(2));
        }
      }

      return points;
    } catch (e) {
      return null;
    }
  }

  /**
   * Fetches batch quotes for a list of symbols concurrently.
   *
   * @param {string[]} symbols - Array of internal symbols to query.
   * @returns {Promise<Map<string, LiveQuote>>} Map of symbol to live quote data.
   */
  public async fetchBatchQuotes(symbols: string[]): Promise<Map<string, LiveQuote>> {
    if (this.isFetching) {
      return this.quoteCache;
    }

    this.isFetching = true;
    try {
      // Update currency multiplier once per batch run
      await this.updateUsdInrRate();

      // Query in chunks of 5 to avoid browser network congestion
      const chunkSize = 5;
      for (let i = 0; i < symbols.length; i += chunkSize) {
        const chunk = symbols.slice(i, i + chunkSize);
        await Promise.all(chunk.map((sym) => this.fetchQuote(sym)));
      }
      this.lastFetchTime = Date.now();
    } finally {
      this.isFetching = false;
    }

    return this.quoteCache;
  }

  /**
   * Retrieves a cached quote for a symbol.
   *
   * @param {string} symbol - Symbol identifier.
   * @returns {LiveQuote | undefined} Cached quote if present.
   */
  public getCachedQuote(symbol: string): LiveQuote | undefined {
    return this.quoteCache.get(symbol);
  }
}

export const realtimeMarketService = new RealtimeMarketService();
