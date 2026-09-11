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
  /** Optional dual-listed or alternate exchange ticker used if primary returns incomplete/stale data */
  fallbackTicker?: string;
  /** Primary market exchange */
  exchange: MarketExchange | 'VIX';
  /** Asset category classification */
  assetType: 'EQUITY' | 'INDEX' | 'COMMODITY';
  /** Optional commodity trading contract unit (e.g. '/ 10g', '/ kg') */
  unit?: string;
}

/**
 * Registry mapping TradePulse symbols to canonical Yahoo Finance tickers.
 *
 * Suffix conventions:
 * - National Stock Exchange of India: `.NS`
 * - Bombay Stock Exchange: `.BO`
 */
export const SYMBOL_MAPPINGS: Record<string, SymbolMapping> = {
  // --- Benchmark Indices ---
  'BSE SENSEX': {
    symbol: 'BSE SENSEX',
    externalTicker: '^BSESN',
    exchange: 'BSE',
    assetType: 'INDEX',
  },
  'SENSEX': {
    symbol: 'SENSEX',
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
  'NIFTY': {
    symbol: 'NIFTY',
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
    externalTicker: 'MCX iCOMDEX',
    exchange: 'MCX',
    assetType: 'INDEX',
  },

  // --- NSE Equities (.NS) ---
  'MCX': {
    symbol: 'MCX',
    externalTicker: 'MCX.NS',
    fallbackTicker: 'MCX.BO',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
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
  'M&M': {
    symbol: 'M&M',
    externalTicker: 'M&M.NS',
    fallbackTicker: 'M&M.BO',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'TATAMOTORS': {
    symbol: 'TATAMOTORS',
    externalTicker: 'M&M.NS',
    fallbackTicker: 'M&M.BO',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'ICICIBANK': {
    symbol: 'ICICIBANK',
    externalTicker: 'ICICIBANK.NS',
    fallbackTicker: 'ICICIBANK.BO',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'BHARTIARTL': {
    symbol: 'BHARTIARTL',
    externalTicker: 'BHARTIARTL.NS',
    fallbackTicker: 'BHARTIARTL.BO',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'SUNPHARMA': {
    symbol: 'SUNPHARMA',
    externalTicker: 'SUNPHARMA.NS',
    fallbackTicker: 'SUNPHARMA.BO',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'MARUTI': {
    symbol: 'MARUTI',
    externalTicker: 'MARUTI.NS',
    fallbackTicker: 'MARUTI.BO',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'BAJFINANCE': {
    symbol: 'BAJFINANCE',
    externalTicker: 'BAJFINANCE.NS',
    fallbackTicker: 'BAJFINANCE.BO',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'WIPRO': {
    symbol: 'WIPRO',
    externalTicker: 'WIPRO.NS',
    fallbackTicker: 'WIPRO.BO',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'ADANIENT': {
    symbol: 'ADANIENT',
    externalTicker: 'ADANIENT.NS',
    fallbackTicker: 'ADANIENT.BO',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'AXISBANK': {
    symbol: 'AXISBANK',
    externalTicker: 'AXISBANK.NS',
    fallbackTicker: 'AXISBANK.BO',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'KOTAKBANK': {
    symbol: 'KOTAKBANK',
    externalTicker: 'KOTAKBANK.NS',
    fallbackTicker: 'KOTAKBANK.BO',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },
  'TATASTEEL': {
    symbol: 'TATASTEEL',
    externalTicker: 'TATASTEEL.NS',
    fallbackTicker: 'TATASTEEL.BO',
    exchange: 'NSE',
    assetType: 'EQUITY',
  },

  // --- BSE Equities (.BO with dual-listed .NS fallback) ---
  'ITC': {
    symbol: 'ITC',
    externalTicker: 'ITC.BO',
    fallbackTicker: 'ITC.NS',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'SBIN': {
    symbol: 'SBIN',
    externalTicker: 'SBIN.BO',
    fallbackTicker: 'SBIN.NS',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'LT': {
    symbol: 'LT',
    externalTicker: 'LT.BO',
    fallbackTicker: 'LT.NS',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'TITAN': {
    symbol: 'TITAN',
    externalTicker: 'TITAN.BO',
    fallbackTicker: 'TITAN.NS',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'ASIANPAINT': {
    symbol: 'ASIANPAINT',
    externalTicker: 'ASIANPAINT.BO',
    fallbackTicker: 'ASIANPAINT.NS',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'HINDUNILVR': {
    symbol: 'HINDUNILVR',
    externalTicker: 'HINDUNILVR.BO',
    fallbackTicker: 'HINDUNILVR.NS',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'BAJAJ_AUTO': {
    symbol: 'BAJAJ_AUTO',
    externalTicker: 'BAJAJ-AUTO.BO',
    fallbackTicker: 'BAJAJ-AUTO.NS',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'NESTLEIND': {
    symbol: 'NESTLEIND',
    externalTicker: 'NESTLEIND.BO',
    fallbackTicker: 'NESTLEIND.NS',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'ULTRACEMCO': {
    symbol: 'ULTRACEMCO',
    externalTicker: 'ULTRACEMCO.BO',
    fallbackTicker: 'ULTRACEMCO.NS',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'COALINDIA': {
    symbol: 'COALINDIA',
    externalTicker: 'COALINDIA.BO',
    fallbackTicker: 'COALINDIA.NS',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'DMART': {
    symbol: 'DMART',
    externalTicker: 'DMART.BO',
    fallbackTicker: 'DMART.NS',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'ZOMATO': {
    symbol: 'ZOMATO',
    externalTicker: 'DMART.BO',
    fallbackTicker: 'DMART.NS',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'JIOFIN': {
    symbol: 'JIOFIN',
    externalTicker: 'JIOFIN.BO',
    fallbackTicker: 'JIOFIN.NS',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'BEL': {
    symbol: 'BEL',
    externalTicker: 'BEL.BO',
    fallbackTicker: 'BEL.NS',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },
  'TATAPOWER': {
    symbol: 'TATAPOWER',
    externalTicker: 'TATAPOWER.BO',
    fallbackTicker: 'TATAPOWER.NS',
    exchange: 'BSE',
    assetType: 'EQUITY',
  },

  // --- MCX Commodities (Indian Rupee native instruments) ---
  'GOLD': {
    symbol: 'GOLD',
    externalTicker: 'GOLD',
    exchange: 'MCX',
    assetType: 'COMMODITY',
    unit: '/ 10g',
  },
  'SILVER': {
    symbol: 'SILVER',
    externalTicker: 'SILVER',
    exchange: 'MCX',
    assetType: 'COMMODITY',
    unit: '/ kg',
  },
  'CRUDEOIL': {
    symbol: 'CRUDEOIL',
    externalTicker: 'CRUDEOIL',
    exchange: 'MCX',
    assetType: 'COMMODITY',
    unit: '/ bbl',
  },
  'NATURALGAS': {
    symbol: 'NATURALGAS',
    externalTicker: 'NATURALGAS',
    exchange: 'MCX',
    assetType: 'COMMODITY',
    unit: '/ mmBtu',
  },
  'COPPER': {
    symbol: 'COPPER',
    externalTicker: 'COPPER',
    exchange: 'MCX',
    assetType: 'COMMODITY',
    unit: '/ kg',
  },
};

/**
 * Resolves the external Yahoo Finance ticker for a given TradePulse symbol.
 *
 * @param {string} symbol - TradePulse internal symbol.
 * @returns {string} External ticker (e.g. 'RELIANCE.NS', '^BSESN', 'TATAPOWER.BO').
 */
export function getExternalTicker(symbol: string): string {
  const mapping = SYMBOL_MAPPINGS[symbol];
  if (mapping) return mapping.externalTicker;

  // Fallback heuristic: Assume NSE equity by default
  return `${symbol}.NS`;
}

/**
 * Maps a local symbol and exchange to its corresponding Yahoo Finance query symbol.
 *
 * @param {string} symbol - Local TradePulse symbol.
 * @param {MarketExchange} [exchange] - Target exchange override.
 * @returns {string} External ticker string.
 */
export function mapToYahooSymbol(symbol: string, exchange?: 'BSE' | 'NSE' | 'MCX'): string {
  if (exchange === 'BSE' && !symbol.startsWith('^') && !symbol.endsWith('.BO')) {
    return `${symbol}.BO`;
  }
  return getExternalTicker(symbol);
}

/**
 * Retrieves the alternate or dual-listed ticker for a symbol if available.
 *
 * @param {string} symbol - TradePulse internal symbol.
 * @returns {string | undefined} Fallback ticker (e.g. '.NS' for a '.BO' equity).
 */
export function getFallbackTicker(symbol: string): string | undefined {
  return SYMBOL_MAPPINGS[symbol]?.fallbackTicker;
}



