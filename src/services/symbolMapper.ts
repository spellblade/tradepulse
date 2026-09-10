import { MarketExchange } from '../types';

/**
 * Definition metadata mapping an internal TradePulse asset or index symbol
 * to its external Yahoo Finance quote ticker and exchange specification.
 */
export interface SymbolMapping {
  /** Internal TradePulse ticker symbol (e.g. 'RELIANCE', 'GOLD', 'BSE SENSEX') */
  symbol: string;
  /** External Yahoo Finance query ticker */
  externalTicker: string;
  /** Primary market exchange */
  exchange: MarketExchange | 'VIX';
  /** Asset category classification */
  assetType: 'EQUITY' | 'INDEX' | 'COMMODITY';
  /** Optional commodity trading contract unit (e.g. '/ 10g', '/ kg') */
  unit?: string;
  /** Metric conversion multiplier to convert global benchmark units to Indian MCX contract specifications */
  commodityUnitMultiplier?: number;
}

/**
 * Registry mapping TradePulse symbols to canonical Yahoo Finance tickers.
 *
 * Suffix conventions:
 * - National Stock Exchange of India: `.NS`
 * - Bombay Stock Exchange: `.BO`
 * - Global benchmark futures for MCX: `=F`
 * - Currency exchange rate: `INR=X`
 */
export const SYMBOL_MAPPINGS: Record<string, SymbolMapping> = {
  // --- Benchmark Indices ---
  'BSE SENSEX': {
    symbol: 'BSE SENSEX',
    externalTicker: '^BSESN',
    exchange: 'BSE',
    assetType: 'INDEX',
  },
  'NIFTY 50': {
    symbol: 'NIFTY 50',
    externalTicker: '^NSEI',
    exchange: 'NSE',
    assetType: 'INDEX',
  },
  'INDIA VIX': {
    symbol: 'INDIA VIX',
    externalTicker: '^INDIAVIX',
    exchange: 'VIX',
    assetType: 'INDEX',
  },
  'MCX iCOMDEX': {
    symbol: 'MCX iCOMDEX',
    externalTicker: 'MCX.NS', // Multi Commodity Exchange of India Ltd stock as proxy for MCX exchange breadth
    exchange: 'MCX',
    assetType: 'INDEX',
  },

  // --- NSE Equities (.NS) ---
  'RELIANCE': {
    symbol: 'RELIANCE',
    externalTicker: 'RELIANCE.NS',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'TCS': {
    symbol: 'TCS',
    externalTicker: 'TCS.NS',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'HDFCBANK': {
    symbol: 'HDFCBANK',
    externalTicker: 'HDFCBANK.NS',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'INFY': {
    symbol: 'INFY',
    externalTicker: 'INFY.NS',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'TATAMOTORS': {
    symbol: 'TATAMOTORS',
    externalTicker: 'TATAMOTORS.NS',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'ICICIBANK': {
    symbol: 'ICICIBANK',
    externalTicker: 'ICICIBANK.NS',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'BHARTIARTL': {
    symbol: 'BHARTIARTL',
    externalTicker: 'BHARTIARTL.NS',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'SUNPHARMA': {
    symbol: 'SUNPHARMA',
    externalTicker: 'SUNPHARMA.NS',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'MARUTI': {
    symbol: 'MARUTI',
    externalTicker: 'MARUTI.NS',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'BAJFINANCE': {
    symbol: 'BAJFINANCE',
    externalTicker: 'BAJFINANCE.NS',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'WIPRO': {
    symbol: 'WIPRO',
    externalTicker: 'WIPRO.NS',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'ADANIENT': {
    symbol: 'ADANIENT',
    externalTicker: 'ADANIENT.NS',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'AXISBANK': {
    symbol: 'AXISBANK',
    externalTicker: 'AXISBANK.NS',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'KOTAKBANK': {
    symbol: 'KOTAKBANK',
    externalTicker: 'KOTAKBANK.NS',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'TATASTEEL': {
    symbol: 'TATASTEEL',
    externalTicker: 'TATASTEEL.NS',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },

  // --- BSE Equities (.BO) ---
  'ITC': {
    symbol: 'ITC',
    externalTicker: 'ITC.BO',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'SBIN': {
    symbol: 'SBIN',
    externalTicker: 'SBIN.BO',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'LT': {
    symbol: 'LT',
    externalTicker: 'LT.BO',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'TITAN': {
    symbol: 'TITAN',
    externalTicker: 'TITAN.BO',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'ASIANPAINT': {
    symbol: 'ASIANPAINT',
    externalTicker: 'ASIANPAINT.BO',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'HINDUNILVR': {
    symbol: 'HINDUNILVR',
    externalTicker: 'HINDUNILVR.BO',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'BAJAJ_AUTO': {
    symbol: 'BAJAJ_AUTO',
    externalTicker: 'BAJAJ-AUTO.BO',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'NESTLEIND': {
    symbol: 'NESTLEIND',
    externalTicker: 'NESTLEIND.BO',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'ULTRACEMCO': {
    symbol: 'ULTRACEMCO',
    externalTicker: 'ULTRACEMCO.BO',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'COALINDIA': {
    symbol: 'COALINDIA',
    externalTicker: 'COALINDIA.BO',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'ZOMATO': {
    symbol: 'ZOMATO',
    externalTicker: 'ZOMATO.BO',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'JIOFIN': {
    symbol: 'JIOFIN',
    externalTicker: 'JIOFIN.BO',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'BEL': {
    symbol: 'BEL',
    externalTicker: 'BEL.BO',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'TATAPOWER': {
    symbol: 'TATAPOWER',
    externalTicker: 'TATAPOWER.BO',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },

  // --- MCX Commodities (Futures contracts & Indian metric normalization) ---
  'GOLD': {
    symbol: 'GOLD',
    externalTicker: 'GC=F', // Gold futures USD per troy oz
    exchange: 'MCX',
    assetType: 'COMMODITY',
    unit: '/ 10g',
    // 1 troy oz = 31.1034768 g; 10g = 10 / 31.1034768 ≈ 0.321507 troy oz
    commodityUnitMultiplier: 10 / 31.1034768,
  },
  'SILVER': {
    symbol: 'SILVER',
    externalTicker: 'SI=F', // Silver futures USD per troy oz
    exchange: 'MCX',
    assetType: 'COMMODITY',
    unit: '/ kg',
    // 1 kg = 1000g / 31.1034768 ≈ 32.1507 troy oz
    commodityUnitMultiplier: 1000 / 31.1034768,
  },
  'CRUDEOIL': {
    symbol: 'CRUDEOIL',
    externalTicker: 'CL=F', // Crude Oil WTI futures USD per barrel
    exchange: 'MCX',
    assetType: 'COMMODITY',
    unit: '/ bbl',
    commodityUnitMultiplier: 1, // 1 bbl
  },
  'NATURALGAS': {
    symbol: 'NATURALGAS',
    externalTicker: 'NG=F', // Natural Gas futures USD per mmBtu
    exchange: 'MCX',
    assetType: 'COMMODITY',
    unit: '/ mmBtu',
    commodityUnitMultiplier: 1,
  },
  'COPPER': {
    symbol: 'COPPER',
    externalTicker: 'HG=F', // Copper futures USD per pound
    exchange: 'MCX',
    assetType: 'COMMODITY',
    unit: '/ kg',
    // 1 kg = 2.20462 lbs
    commodityUnitMultiplier: 2.20462,
  },
};

/**
 * Currency conversion ticker for USD to INR.
 */
export const USD_INR_TICKER = 'INR=X';

/**
 * Converts global commodity benchmark prices in USD into Indian MCX contract values in INR.
 *
 * @param {string} symbol - TradePulse commodity symbol.
 * @param {number} usdPrice - Global benchmark price in USD.
 * @param {number} usdInrRate - Live or fallback USD to INR exchange rate.
 * @returns {number} Normalized price in INR matching MCX market specifications.
 */
export function convertCommodityToINR(symbol: string, usdPrice: number, usdInrRate: number = 86.5): number {
  const mapping = SYMBOL_MAPPINGS[symbol];
  if (!mapping || mapping.assetType !== 'COMMODITY') {
    return usdPrice;
  }

  const multiplier = mapping.commodityUnitMultiplier || 1;
  const inrPrice = usdPrice * multiplier * usdInrRate;
  return Number(inrPrice.toFixed(2));
}

/**
 * Resolves the external Yahoo Finance ticker for a given TradePulse symbol.
 *
 * @param {string} symbol - TradePulse internal symbol.
 * @returns {string} External ticker (e.g. 'RELIANCE.NS', '^BSESN', 'GC=F').
 */
export function getExternalTicker(symbol: string): string {
  const mapping = SYMBOL_MAPPINGS[symbol];
  if (mapping) return mapping.externalTicker;

  // Fallback heuristic: Assume NSE equity by default
  return `${symbol}.NS`;
}
