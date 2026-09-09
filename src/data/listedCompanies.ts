import { StockSymbol, MarketExchange, OHLCPoint } from '../types';

// Helper to generate realistic OHLC historical points with moving averages
export function generateCandlesForPrice(basePrice: number, pointsCount: number = 40, volatility: number = 0.015): OHLCPoint[] {
  const points: OHLCPoint[] = [];
  let currentPrice = basePrice * (1 - (pointsCount * 0.002));
  const now = Date.now();
  const intervalMs = 60 * 1000;

  for (let i = pointsCount - 1; i >= 0; i--) {
    const timestamp = now - (i * intervalMs);
    const date = new Date(timestamp);
    const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const changePercent = (Math.random() - 0.48) * volatility * 2;
    const open = currentPrice;
    const close = Number((open * (1 + changePercent)).toFixed(2));
    const high = Number((Math.max(open, close) * (1 + Math.random() * volatility * 0.8)).toFixed(2));
    const low = Number((Math.min(open, close) * (1 - Math.random() * volatility * 0.8)).toFixed(2));
    const volume = Math.floor(Math.random() * 800000 + 150000);

    currentPrice = close;

    points.push({
      timestamp,
      timeLabel,
      open,
      high,
      low,
      close,
      volume,
    });
  }

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
}

export interface ListedCompanyTemplate {
  symbol: string;
  name: string;
  exchange: MarketExchange;
  sector: string;
  basePrice: number;
  marketCap: string;
  peRatio: number;
  volatilityIndex: number;
  unit?: string;
}

// Comprehensive verified directory of genuine BSE, NSE, and MCX listed companies and commodities
export const LISTED_COMPANIES_DIRECTORY: ListedCompanyTemplate[] = [
  // --- NSE (National Stock Exchange) ---
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    exchange: 'NSE',
    sector: 'Energy & Telecom',
    basePrice: 3012.40,
    marketCap: '₹20.4L Cr',
    peRatio: 28.5,
    volatilityIndex: 0.55,
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services',
    exchange: 'NSE',
    sector: 'IT Services',
    basePrice: 4245.60,
    marketCap: '₹15.3L Cr',
    peRatio: 31.2,
    volatilityIndex: 0.42,
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    exchange: 'NSE',
    sector: 'Banking & Finance',
    basePrice: 1648.50,
    marketCap: '₹12.5L Cr',
    peRatio: 18.6,
    volatilityIndex: 0.60,
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    exchange: 'NSE',
    sector: 'IT Services',
    basePrice: 1894.20,
    marketCap: '₹7.8L Cr',
    peRatio: 27.8,
    volatilityIndex: 0.50,
  },
  {
    symbol: 'TATAMOTORS',
    name: 'Tata Motors Ltd.',
    exchange: 'NSE',
    sector: 'Automotive & EV',
    basePrice: 1068.30,
    marketCap: '₹3.9L Cr',
    peRatio: 12.4,
    volatilityIndex: 0.80,
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd.',
    exchange: 'NSE',
    sector: 'Banking & Finance',
    basePrice: 1215.40,
    marketCap: '₹8.5L Cr',
    peRatio: 17.5,
    volatilityIndex: 0.48,
  },
  {
    symbol: 'BHARTIARTL',
    name: 'Bharti Airtel Ltd.',
    exchange: 'NSE',
    sector: 'Telecommunications',
    basePrice: 1540.80,
    marketCap: '₹9.1L Cr',
    peRatio: 64.2,
    volatilityIndex: 0.52,
  },
  {
    symbol: 'SUNPHARMA',
    name: 'Sun Pharmaceutical Industries',
    exchange: 'NSE',
    sector: 'Pharmaceuticals',
    basePrice: 1780.20,
    marketCap: '₹4.3L Cr',
    peRatio: 38.5,
    volatilityIndex: 0.45,
  },
  {
    symbol: 'MARUTI',
    name: 'Maruti Suzuki India Ltd.',
    exchange: 'NSE',
    sector: 'Automobile',
    basePrice: 12450.00,
    marketCap: '₹3.9L Cr',
    peRatio: 29.8,
    volatilityIndex: 0.58,
  },
  {
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance Ltd.',
    exchange: 'NSE',
    sector: 'Financial Services',
    basePrice: 7320.00,
    marketCap: '₹4.5L Cr',
    peRatio: 32.1,
    volatilityIndex: 0.72,
  },
  {
    symbol: 'WIPRO',
    name: 'Wipro Ltd.',
    exchange: 'NSE',
    sector: 'IT Consulting & BPO',
    basePrice: 535.40,
    marketCap: '₹2.8L Cr',
    peRatio: 24.6,
    volatilityIndex: 0.56,
  },
  {
    symbol: 'ADANIENT',
    name: 'Adani Enterprises Ltd.',
    exchange: 'NSE',
    sector: 'Metals & Energy',
    basePrice: 3045.00,
    marketCap: '₹3.5L Cr',
    peRatio: 92.4,
    volatilityIndex: 0.88,
  },
  {
    symbol: 'AXISBANK',
    name: 'Axis Bank Ltd.',
    exchange: 'NSE',
    sector: 'Private Banking',
    basePrice: 1195.50,
    marketCap: '₹3.7L Cr',
    peRatio: 14.8,
    volatilityIndex: 0.62,
  },
  {
    symbol: 'KOTAKBANK',
    name: 'Kotak Mahindra Bank',
    exchange: 'NSE',
    sector: 'Banking & Wealth',
    basePrice: 1820.00,
    marketCap: '₹3.6L Cr',
    peRatio: 22.4,
    volatilityIndex: 0.46,
  },
  {
    symbol: 'TATASTEEL',
    name: 'Tata Steel Ltd.',
    exchange: 'NSE',
    sector: 'Steel & Metallurgy',
    basePrice: 154.20,
    marketCap: '₹1.9L Cr',
    peRatio: 42.1,
    volatilityIndex: 0.78,
  },

  // --- BSE (Bombay Stock Exchange) ---
  {
    symbol: 'ITC',
    name: 'ITC Ltd.',
    exchange: 'BSE',
    sector: 'FMCG & Diversified',
    basePrice: 502.40,
    marketCap: '₹6.2L Cr',
    peRatio: 29.4,
    volatilityIndex: 0.40,
  },
  {
    symbol: 'SBIN',
    name: 'State Bank of India',
    exchange: 'BSE',
    sector: 'Public Banking',
    basePrice: 815.60,
    marketCap: '₹7.3L Cr',
    peRatio: 10.8,
    volatilityIndex: 0.70,
  },
  {
    symbol: 'LT',
    name: 'Larsen & Toubro Ltd.',
    exchange: 'BSE',
    sector: 'Infrastructure & Engineering',
    basePrice: 3640.20,
    marketCap: '₹5.0L Cr',
    peRatio: 33.1,
    volatilityIndex: 0.65,
  },
  {
    symbol: 'TITAN',
    name: 'Titan Company Ltd.',
    exchange: 'BSE',
    sector: 'Consumer & Jewellery',
    basePrice: 3560.00,
    marketCap: '₹3.1L Cr',
    peRatio: 84.5,
    volatilityIndex: 0.62,
  },
  {
    symbol: 'ASIANPAINT',
    name: 'Asian Paints Ltd.',
    exchange: 'BSE',
    sector: 'Paints & Chemicals',
    basePrice: 3180.50,
    marketCap: '₹3.0L Cr',
    peRatio: 52.8,
    volatilityIndex: 0.50,
  },
  {
    symbol: 'HINDUNILVR',
    name: 'Hindustan Unilever Ltd.',
    exchange: 'BSE',
    sector: 'FMCG Consumer',
    basePrice: 2790.00,
    marketCap: '₹6.5L Cr',
    peRatio: 58.2,
    volatilityIndex: 0.38,
  },
  {
    symbol: 'BAJAJ_AUTO',
    name: 'Bajaj Auto Ltd.',
    exchange: 'BSE',
    sector: 'Automobile 2W/3W',
    basePrice: 10250.00,
    marketCap: '₹2.8L Cr',
    peRatio: 35.6,
    volatilityIndex: 0.68,
  },
  {
    symbol: 'NESTLEIND',
    name: 'Nestle India Ltd.',
    exchange: 'BSE',
    sector: 'Food & Nutrition',
    basePrice: 2480.00,
    marketCap: '₹2.4L Cr',
    peRatio: 72.4,
    volatilityIndex: 0.35,
  },
  {
    symbol: 'ULTRACEMCO',
    name: 'UltraTech Cement Ltd.',
    exchange: 'BSE',
    sector: 'Cement & Building Materials',
    basePrice: 11400.00,
    marketCap: '₹3.3L Cr',
    peRatio: 44.5,
    volatilityIndex: 0.54,
  },
  {
    symbol: 'COALINDIA',
    name: 'Coal India Ltd.',
    exchange: 'BSE',
    sector: 'Mining & Power',
    basePrice: 512.30,
    marketCap: '₹3.1L Cr',
    peRatio: 8.6,
    volatilityIndex: 0.74,
  },
  {
    symbol: 'ZOMATO',
    name: 'Zomato Ltd.',
    exchange: 'BSE',
    sector: 'Internet & Quick Commerce',
    basePrice: 260.40,
    marketCap: '₹2.3L Cr',
    peRatio: 118.2,
    volatilityIndex: 0.85,
  },
  {
    symbol: 'JIOFIN',
    name: 'Jio Financial Services',
    exchange: 'BSE',
    sector: 'NBFC & Fintech',
    basePrice: 348.00,
    marketCap: '₹2.2L Cr',
    peRatio: 145.0,
    volatilityIndex: 0.76,
  },
  {
    symbol: 'BEL',
    name: 'Bharat Electronics Ltd.',
    exchange: 'BSE',
    sector: 'Defense Electronics',
    basePrice: 305.50,
    marketCap: '₹2.2L Cr',
    peRatio: 52.0,
    volatilityIndex: 0.70,
  },
  {
    symbol: 'TATAPOWER',
    name: 'Tata Power Co. Ltd.',
    exchange: 'BSE',
    sector: 'Electric Utilities & Solar',
    basePrice: 440.00,
    marketCap: '₹1.4L Cr',
    peRatio: 36.4,
    volatilityIndex: 0.72,
  },

  // --- MCX (Multi Commodity Exchange) ---
  {
    symbol: 'GOLD',
    name: 'Gold 999 Futures',
    exchange: 'MCX',
    sector: 'Precious Metals',
    basePrice: 72450.00,
    marketCap: '₹34,000 Cr',
    peRatio: 0,
    volatilityIndex: 0.75,
    unit: '/ 10g',
  },
  {
    symbol: 'SILVER',
    name: 'Silver Futures',
    exchange: 'MCX',
    sector: 'Precious Metals',
    basePrice: 84200.00,
    marketCap: '₹22,000 Cr',
    peRatio: 0,
    volatilityIndex: 0.88,
    unit: '/ kg',
  },
  {
    symbol: 'CRUDEOIL',
    name: 'Crude Oil Futures',
    exchange: 'MCX',
    sector: 'Energy Commodities',
    basePrice: 6480.00,
    marketCap: '₹18,500 Cr',
    peRatio: 0,
    volatilityIndex: 0.92,
    unit: '/ bbl',
  },
  {
    symbol: 'NATURALGAS',
    name: 'Natural Gas Futures',
    exchange: 'MCX',
    sector: 'Energy Commodities',
    basePrice: 215.80,
    marketCap: '₹7,200 Cr',
    peRatio: 0,
    volatilityIndex: 0.95,
    unit: '/ mmBtu',
  },
  {
    symbol: 'COPPER',
    name: 'Copper Futures',
    exchange: 'MCX',
    sector: 'Base Metals',
    basePrice: 825.40,
    marketCap: '₹11,000 Cr',
    peRatio: 0,
    volatilityIndex: 0.76,
    unit: '/ kg',
  },
  {
    symbol: 'ZINC',
    name: 'Zinc Futures',
    exchange: 'MCX',
    sector: 'Base Metals',
    basePrice: 268.30,
    marketCap: '₹6,400 Cr',
    peRatio: 0,
    volatilityIndex: 0.72,
    unit: '/ kg',
  },
  {
    symbol: 'ALUMINIUM',
    name: 'Aluminium Futures',
    exchange: 'MCX',
    sector: 'Base Metals',
    basePrice: 228.60,
    marketCap: '₹5,800 Cr',
    peRatio: 0,
    volatilityIndex: 0.68,
    unit: '/ kg',
  },
  {
    symbol: 'LEAD',
    name: 'Lead Mini Futures',
    exchange: 'MCX',
    sector: 'Base Metals',
    basePrice: 184.20,
    marketCap: '₹3,200 Cr',
    peRatio: 0,
    volatilityIndex: 0.60,
    unit: '/ kg',
  },
  {
    symbol: 'COTTON',
    name: 'Cotton Candy 29mm Futures',
    exchange: 'MCX',
    sector: 'Agri Commodities',
    basePrice: 57400.00,
    marketCap: '₹1,500 Cr',
    peRatio: 0,
    volatilityIndex: 0.65,
    unit: '/ candy',
  },
];

export function instantiateStockFromTemplate(template: ListedCompanyTemplate): StockSymbol {
  const previousClose = Number((template.basePrice * (1 - (Math.random() * 0.02 - 0.01))).toFixed(2));
  const change = Number((template.basePrice - previousClose).toFixed(2));
  const changePercent = Number(((change / previousClose) * 100).toFixed(2));

  return {
    id: template.symbol,
    symbol: template.symbol,
    name: template.name,
    exchange: template.exchange,
    sector: template.sector,
    currentPrice: template.basePrice,
    previousClose,
    change,
    changePercent,
    dayHigh: Number((template.basePrice * 1.015).toFixed(2)),
    dayLow: Number((template.basePrice * 0.985).toFixed(2)),
    volume: Math.floor(Math.random() * 5000000 + 500000),
    avgVolume: Math.floor(Math.random() * 6000000 + 600000),
    marketCap: template.marketCap,
    peRatio: template.peRatio,
    volatilityIndex: template.volatilityIndex,
    unit: template.unit,
    history: generateCandlesForPrice(template.basePrice, 45, 0.012),
  };
}
