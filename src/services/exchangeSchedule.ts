import { MarketExchange } from '../types';

/**
 * Exchange operational status model representing live market hours telemetry.
 */
export interface ExchangeMarketStatus {
  /** Exchange identifier ('BSE' | 'NSE' | 'MCX') */
  exchange: MarketExchange;
  /** Whether the exchange is currently in an active live trading session */
  isOpen: boolean;
  /** Primary status indicator ('OPEN' | 'CLOSED') */
  statusText: 'OPEN' | 'CLOSED';
  /** Standard daily operational session time in IST */
  sessionHours: string;
  /** Current formatted timestamp in Indian Standard Time (IST) */
  currentIstTime: string;
  /** Descriptive notice or countdown to the next session opening */
  nextSessionNotice: string;
}

/**
 * Known Indian national stock exchange market holidays (YYYY-MM-DD format).
 */
export const INDIAN_MARKET_HOLIDAYS = new Set([
  '2026-01-26', // Republic Day
  '2026-03-03', // Mahashivratri
  '2026-03-17', // Holi
  '2026-04-03', // Good Friday
  '2026-04-14', // Dr. Ambedkar Jayanti
  '2026-05-01', // Maharashtra Day
  '2026-08-15', // Independence Day
  '2026-10-02', // Mahatma Gandhi Jayanti
  '2026-10-20', // Dussehra
  '2026-11-09', // Diwali Laxmi Pujan
  '2026-12-25', // Christmas
]);

export const INDIAN_MARKET_HOLIDAYS_2026 = INDIAN_MARKET_HOLIDAYS;

/**
 * Converts a given epoch or Date instance into Indian Standard Time (IST, UTC+05:30).
 *
 * @param {Date} [date=new Date()] - Date object to convert.
 * @returns {Date} Date instance representing current time shifted to IST offset.
 */
export function getIndianStandardTime(date: Date = new Date()): Date {
  const utcEpoch = date.getTime() + (date.getTimezoneOffset() * 60 * 1000);
  const istOffsetMs = 5.5 * 60 * 60 * 1000; // UTC+5:30
  return new Date(utcEpoch + istOffsetMs);
}

/**
 * Formats a Date object as YYYY-MM-DD in IST.
 *
 * @param {Date} istDate - Date adjusted to IST.
 * @returns {string} Formatted date string (e.g. '2026-09-10').
 */
function getFormattedDateIST(istDate: Date): string {
  const year = istDate.getFullYear();
  const month = String(istDate.getMonth() + 1).padStart(2, '0');
  const day = String(istDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Evaluates whether an Indian market exchange is currently open for live trading.
 *
 * Trading Hours:
 * - **BSE / NSE**: Monday to Friday, 09:15 to 15:30 IST.
 * - **MCX**: Monday to Friday, 09:00 to 23:30 IST.
 * - **Weekends**: Saturday (day 6) and Sunday (day 0) are closed.
 * - **Holidays**: Closed on official Indian market holidays.
 *
 * @param {MarketExchange} exchange - Exchange identifier.
 * @param {Date} [testDate] - Optional test date instance for deterministic unit testing.
 * @returns {boolean} True if within active market session, false otherwise.
 */
export function isMarketOpen(exchange: MarketExchange, testDate?: Date): boolean {
  const ist = getIndianStandardTime(testDate);
  const dayOfWeek = ist.getDay(); // 0 = Sunday, 6 = Saturday

  // Closed on weekends
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    return false;
  }

  // Closed on declared market holidays
  const dateStr = getFormattedDateIST(ist);
  if (INDIAN_MARKET_HOLIDAYS.has(dateStr)) {
    return false;
  }

  const hours = ist.getHours();
  const minutes = ist.getMinutes();
  const timeInMinutes = hours * 60 + minutes;

  if (exchange === 'BSE' || exchange === 'NSE') {
    // 09:15 AM (555 min) to 03:30 PM (930 min)
    const marketOpen = 9 * 60 + 15;
    const marketClose = 15 * 60 + 30;
    return timeInMinutes >= marketOpen && timeInMinutes <= marketClose;
  }

  if (exchange === 'MCX') {
    // 09:00 AM (540 min) to 11:30 PM (1410 min)
    const marketOpen = 9 * 60;
    const marketClose = 23 * 60 + 30;
    return timeInMinutes >= marketOpen && timeInMinutes <= marketClose;
  }

  return false;
}

/**
 * Retrieves the full operational status and telemetry for a specified exchange.
 *
 * @param {MarketExchange} exchange - Market exchange to evaluate.
 * @param {Date} [testDate] - Optional test date for verification.
 * @returns {ExchangeMarketStatus} Operational status object with formatted IST time and notices.
 */
export function getExchangeStatus(exchange: MarketExchange, testDate?: Date): ExchangeMarketStatus {
  const ist = getIndianStandardTime(testDate);
  const open = isMarketOpen(exchange, testDate);

  const hours12 = ist.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  const sessionHours = exchange === 'MCX' ? '09:00 - 23:30 IST' : '09:15 - 15:30 IST';

  let nextSessionNotice = '';
  if (open) {
    nextSessionNotice = `Live Session Active until ${exchange === 'MCX' ? '23:30' : '15:30'} IST`;
  } else {
    const day = ist.getDay();
    if (day === 5 && ist.getHours() >= 16) {
      nextSessionNotice = 'Opens Monday 09:15 IST';
    } else if (day === 6) {
      nextSessionNotice = 'Weekend (Opens Monday 09:15 IST)';
    } else if (day === 0) {
      nextSessionNotice = 'Weekend (Opens Tomorrow 09:15 IST)';
    } else if (ist.getHours() < 9) {
      nextSessionNotice = `Pre-Market (Opens Today at ${exchange === 'MCX' ? '09:00' : '09:15'} IST)`;
    } else {
      nextSessionNotice = 'Market Closed (Official Close Prices Displayed)';
    }
  }

  return {
    exchange,
    isOpen: open,
    statusText: open ? 'OPEN' : 'CLOSED',
    sessionHours,
    currentIstTime: `${hours12} IST`,
    nextSessionNotice,
  };
}

/**
 * Convenience helper providing IST calendar date components.
 *
 * @param {Date} [date=new Date()] - UTC date.
 * @returns {{ hours: number; minutes: number; dayOfWeek: number; date: Date }} IST breakdown.
 */
export function getISTDate(date: Date = new Date()): { hours: number; minutes: number; dayOfWeek: number; date: Date } {
  const ist = getIndianStandardTime(date);
  return {
    hours: ist.getHours(),
    minutes: ist.getMinutes(),
    dayOfWeek: ist.getDay(),
    date: ist,
  };
}

/**
 * Retrieves human-readable notice for the next market opening session.
 *
 * @param {MarketExchange} exchange - Market exchange.
 * @returns {string} Opening schedule descriptor.
 */
export function getNextMarketSession(exchange: MarketExchange): string {
  return getExchangeStatus(exchange).nextSessionNotice;
}
