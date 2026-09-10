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
  getCommodityMultiplier,
  convertCommodityPrice,
} from '../src/services/symbolMapper';
import {
  isMarketOpen,
  getISTDate,
  getNextMarketSession,
  INDIAN_MARKET_HOLIDAYS_2026,
} from '../src/services/exchangeSchedule';

describe('Real-Time Symbol Mapper [Unit]', () => {
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

  it('should accurately map MCX commodity tickers to active futures contracts', () => {
    assert.equal(mapToYahooSymbol('GOLD', 'MCX'), 'GC=F');
    assert.equal(mapToYahooSymbol('SILVER', 'MCX'), 'SI=F');
    assert.equal(mapToYahooSymbol('CRUDEOIL', 'MCX'), 'CL=F');
    assert.equal(mapToYahooSymbol('NATURALGAS', 'MCX'), 'NG=F');
    assert.equal(mapToYahooSymbol('COPPER', 'MCX'), 'HG=F');
  });

  it('should return 1 for standard equities without multiplier', () => {
    assert.equal(getCommodityMultiplier('RELIANCE'), 1);
    assert.equal(getCommodityMultiplier('TCS'), 1);
  });

  it('should compute valid contract unit conversions for MCX commodities in INR', () => {
    // Gold: $2700 / troy oz -> ₹ per 10 grams (approx ~₹75,000 - ₹85,000)
    const goldInr = convertCommodityPrice(2700, 'GOLD', 86.5);
    assert.ok(goldInr > 70000 && goldInr < 90000, `Gold INR price ${goldInr} should be realistic`);

    // Silver: $32 / troy oz -> ₹ per 1 kg (approx ~₹80,000 - ₹100,000)
    const silverInr = convertCommodityPrice(32, 'SILVER', 86.5);
    assert.ok(silverInr > 70000 && silverInr < 110000, `Silver INR price ${silverInr} should be realistic`);

    // Crude Oil: $70 / bbl -> ₹ per barrel
    const crudeInr = convertCommodityPrice(70, 'CRUDEOIL', 86.5);
    assert.equal(crudeInr, 70 * 86.5);
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
