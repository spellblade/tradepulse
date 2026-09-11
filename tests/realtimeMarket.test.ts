/**
 * @file realtimeMarket.test.ts
 * Automated Unit Test Suite for Real-time Indian Market Tracking:
 * - Symbol Mapping (BSE, NSE, MCX, Indices, FX/contract conversions)
 * - Exchange Calendars & Trading Hours (BSE/NSE 09:15-15:30 IST, MCX 09:00-23:30 IST, Holidays, Weekends)
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  mapToYahooSymbol,
  getExternalTicker,
  getFallbackTicker,
} from '../src/services/symbolMapper';
import {
  isMarketOpen,
  getISTDate,
  getNextMarketSession,
  INDIAN_MARKET_HOLIDAYS_2026,
} from '../src/services/exchangeSchedule';
import { realtimeMarketService } from '../src/services/realtimeMarketService';

describe('Real-Time Symbol Mapper & Native INR Instruments [Unit]', () => {
  it('should accurately map NSE equity symbols to .NS suffix', () => {
    assert.equal(mapToYahooSymbol('RELIANCE', 'NSE'), 'RELIANCE.NS');
    assert.equal(mapToYahooSymbol('TCS', 'NSE'), 'TCS.NS');
    assert.equal(mapToYahooSymbol('HDFCBANK', 'NSE'), 'HDFCBANK.NS');
  });

  it('should accurately map BSE equity symbols to .BO suffix', () => {
    assert.equal(mapToYahooSymbol('BOMDYEING', 'BSE'), 'BOMDYEING.BO');
    assert.equal(mapToYahooSymbol('TCS', 'BSE'), 'TCS.BO');
  });

  it('should accurately map major Indian benchmark indices', () => {
    assert.equal(mapToYahooSymbol('SENSEX'), '^BSESN');
    assert.equal(mapToYahooSymbol('BSE SENSEX'), '^BSESN');
    assert.equal(mapToYahooSymbol('NIFTY 50'), '^NSEI');
    assert.equal(mapToYahooSymbol('NIFTY'), '^NSEI');
    assert.equal(mapToYahooSymbol('INDIA VIX'), '^INDIAVIX');
  });

  it('should treat MCX commodities as native INR instruments with no USD forex conversion', () => {
    // Commodities are direct native INR symbols with zero USD forex dependency
    assert.equal(getExternalTicker('GOLD'), 'GOLD');
    assert.equal(getExternalTicker('SILVER'), 'SILVER');
    assert.equal(getExternalTicker('CRUDEOIL'), 'CRUDEOIL');
    assert.equal(getExternalTicker('NATURALGAS'), 'NATURALGAS');
    assert.equal(getExternalTicker('COPPER'), 'COPPER');
  });
});

describe('Exchange Schedule & Market Hours [Unit]', () => {
  it('should accurately convert UTC timestamp to Indian Standard Time (IST)', () => {
    // 2026-03-10 03:45:00 UTC == 2026-03-10 09:15:00 IST (UTC+5:30)
    const testUtcDate = new Date(Date.UTC(2026, 2, 10, 3, 45, 0));
    const ist = getISTDate(testUtcDate);

    assert.equal(ist.hours, 9);
    assert.equal(ist.minutes, 15);
    assert.equal(ist.dayOfWeek, 2); // Tuesday
  });

  it('should evaluate BSE and NSE as OPEN during 09:15 to 15:30 IST on regular trading days', () => {
    // Wednesday 11:30 IST
    const openTime = new Date(Date.UTC(2026, 2, 11, 6, 0, 0)); // 11:30 IST
    assert.equal(isMarketOpen('NSE', openTime), true);
    assert.equal(isMarketOpen('BSE', openTime), true);

    // Wednesday 08:30 IST (Pre-market/Closed)
    const preTime = new Date(Date.UTC(2026, 2, 11, 3, 0, 0)); // 08:30 IST
    assert.equal(isMarketOpen('NSE', preTime), false);
    assert.equal(isMarketOpen('BSE', preTime), false);

    // Wednesday 16:00 IST (Post-market/Closed)
    const postTime = new Date(Date.UTC(2026, 2, 11, 10, 30, 0)); // 16:00 IST
    assert.equal(isMarketOpen('NSE', postTime), false);
    assert.equal(isMarketOpen('BSE', postTime), false);
  });

  it('should evaluate MCX as OPEN during evening commodity session up to 23:30 IST', () => {
    // Wednesday 20:00 IST (BSE/NSE closed, MCX open)
    const eveningTime = new Date(Date.UTC(2026, 2, 11, 14, 30, 0)); // 20:00 IST
    assert.equal(isMarketOpen('NSE', eveningTime), false);
    assert.equal(isMarketOpen('BSE', eveningTime), false);
    assert.equal(isMarketOpen('MCX', eveningTime), true);

    // Wednesday 23:45 IST (MCX closed)
    const midnightTime = new Date(Date.UTC(2026, 2, 11, 18, 15, 0)); // 23:45 IST
    assert.equal(isMarketOpen('MCX', midnightTime), false);
  });

  it('should evaluate all exchanges as CLOSED on weekends (Saturday & Sunday)', () => {
    // Saturday 12:00 IST
    const saturday = new Date(Date.UTC(2026, 2, 14, 6, 30, 0));
    assert.equal(isMarketOpen('NSE', saturday), false);
    assert.equal(isMarketOpen('BSE', saturday), false);
    assert.equal(isMarketOpen('MCX', saturday), false);

    // Sunday 12:00 IST
    const sunday = new Date(Date.UTC(2026, 2, 15, 6, 30, 0));
    assert.equal(isMarketOpen('NSE', sunday), false);
    assert.equal(isMarketOpen('BSE', sunday), false);
    assert.equal(isMarketOpen('MCX', sunday), false);
  });

  it('should evaluate all exchanges as CLOSED on Indian National Holidays', () => {
    // Republic Day: 2026-01-26
    assert.ok(INDIAN_MARKET_HOLIDAYS_2026.has('2026-01-26'));
    const republicDayTradingHour = new Date(Date.UTC(2026, 0, 26, 5, 30, 0)); // 11:00 IST
    assert.equal(isMarketOpen('NSE', republicDayTradingHour), false);
    assert.equal(isMarketOpen('BSE', republicDayTradingHour), false);
    assert.equal(isMarketOpen('MCX', republicDayTradingHour), false);

    // Independence Day: 2026-08-15
    assert.ok(INDIAN_MARKET_HOLIDAYS_2026.has('2026-08-15'));
  });

  it('should return human-readable next session open information', () => {
    const nextSession = getNextMarketSession('NSE');
    assert.ok(typeof nextSession === 'string');
    assert.ok(nextSession.length > 0);
  });
});

describe('BSE 1D Historical Candles & Fallback Resolution [Unit]', () => {
  it('should have dual-listed fallback tickers configured for BSE equities', () => {
    const bseStocks = ['ITC', 'SBIN', 'LT', 'TITAN', 'ASIANPAINT', 'HINDUNILVR', 'BAJAJ_AUTO', 'NESTLEIND', 'ULTRACEMCO', 'COALINDIA', 'DMART', 'BEL', 'TATAPOWER'];
    for (const sym of bseStocks) {
      const ext = getExternalTicker(sym);
      const fb = getFallbackTicker(sym);
      assert.ok(ext.includes('.BO') || ext.includes('-'), `External ticker for ${sym} should be BSE: ${ext}`);
      assert.ok(fb && fb.includes('.NS'), `Fallback ticker for ${sym} should be NSE .NS: ${fb}`);
    }
  });

  it('should successfully generate complete 1D historical candle sequence for BSE stocks', async () => {
    const itcCandles = await realtimeMarketService.fetchHistoricalCandles('ITC', '1D');
    assert.ok(itcCandles && itcCandles.length >= 20, `ITC 1D candles should have >= 20 bars (received ${itcCandles?.length})`);

    const sample = itcCandles[itcCandles.length - 1];
    assert.ok(sample.timestamp > 0, 'Timestamp should be valid');
    assert.ok(typeof sample.timeLabel === 'string' && sample.timeLabel.length > 0, 'timeLabel should be formatted date');
    assert.ok(sample.high >= sample.low, 'High should be >= Low');
    assert.ok(sample.open > 0 && sample.close > 0, 'Open and Close should be positive');
    assert.ok(sample.volume >= 0, 'Volume should be non-negative');
    assert.ok(typeof sample.sma20 === 'number' && sample.sma20 > 0, 'SMA20 should be computed');
    assert.ok(typeof sample.ema50 === 'number' && sample.ema50 > 0, 'EMA50 should be computed');
  });
});
