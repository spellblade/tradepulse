/**
 * @file marketEngine.test.ts
 * Automated Unit Test Suite for TradePulse Simulation Engine & Directory Integrity.
 * Follows Model C test classification: pure deterministic unit tests without network or side-effects.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { generateCandlesForPrice, instantiateStockFromTemplate, LISTED_COMPANIES_DIRECTORY } from '../src/data/listedCompanies';
import { MarketEngine } from '../src/services/marketEngine';
import { INITIAL_INDICES, INITIAL_HOLDINGS } from '../src/data/initialData';

describe('Market Engine & Technical Indicators [Unit]', () => {
  it('should generate valid OHLC candle series with correct length', () => {
    const candles = generateCandlesForPrice(1500, 30, 0.01);
    assert.equal(candles.length, 30);

    for (const candle of candles) {
      assert.ok(candle.timestamp > 0, 'Timestamp should be positive');
      assert.ok(candle.high >= candle.low, 'High must be >= Low');
      assert.ok(candle.high >= Math.min(candle.open, candle.close), 'High must be >= min(open, close)');
      assert.ok(candle.low <= Math.max(candle.open, candle.close), 'Low must be <= max(open, close)');
      assert.ok(candle.volume > 0, 'Volume must be positive');
      assert.ok(typeof candle.sma20 === 'number', 'SMA-20 should be computed');
      assert.ok(typeof candle.ema50 === 'number', 'EMA-50 should be computed');
    }
  });

  it('should correctly instantiate a stock from directory template', () => {
    const template = LISTED_COMPANIES_DIRECTORY.find((c) => c.symbol === 'RELIANCE');
    assert.ok(template, 'RELIANCE template must exist');

    const stock = instantiateStockFromTemplate(template);
    assert.equal(stock.symbol, 'RELIANCE');
    assert.equal(stock.exchange, 'NSE');
    assert.ok(stock.currentPrice > 0, 'Current price must be positive');
    assert.ok(stock.dayHigh >= stock.dayLow, 'Day high must be >= Day low');
    assert.ok(stock.history.length > 0, 'Historical candles should be generated');
  });

  it('should initialize MarketEngine and notify subscribers', () => {
    const engine = new MarketEngine();
    let received = false;

    const unsubscribe = engine.subscribe((stocks, trades, alerts, indices, fps, batchCount) => {
      assert.ok(Array.isArray(stocks), 'Stocks must be an array');
      assert.ok(stocks.length > 0, 'Stocks must not be empty');
      assert.ok(Array.isArray(indices), 'Indices must be an array');
      assert.ok(fps >= 0, 'FPS must be non-negative');
      received = true;
    });

    assert.ok(received, 'Subscriber should receive initial tick payload immediately');
    unsubscribe();
    engine.stopSimulation();
  });

  it('should support adjusting simulation speeds', () => {
    const engine = new MarketEngine();
    assert.equal(engine.getSpeed(), 'normal');

    engine.setSpeed('turbo');
    assert.equal(engine.getSpeed(), 'turbo');

    engine.setSpeed('hyper');
    assert.equal(engine.getSpeed(), 'hyper');

    engine.stopSimulation();
  });
});

describe('Static Data & Directory Integrity [Unit]', () => {
  it('should have unique symbols across listed companies directory', () => {
    const symbols = LISTED_COMPANIES_DIRECTORY.map((c) => c.symbol);
    const uniqueSymbols = new Set(symbols);
    assert.equal(symbols.length, uniqueSymbols.size, 'All directory symbols must be unique');
  });

  it('should have valid exchanges for all companies', () => {
    const validExchanges = new Set(['BSE', 'NSE', 'MCX']);
    for (const company of LISTED_COMPANIES_DIRECTORY) {
      assert.ok(validExchanges.has(company.exchange), `Invalid exchange ${company.exchange} for ${company.symbol}`);
      assert.ok(company.basePrice > 0, `Base price must be positive for ${company.symbol}`);
    }
  });

  it('should have properly initialized market indices', () => {
    assert.ok(INITIAL_INDICES.length >= 4, 'Must have at least 4 core indices');
    const indexSymbols = INITIAL_INDICES.map((i) => i.symbol);
    assert.ok(indexSymbols.includes('BSE SENSEX'));
    assert.ok(indexSymbols.includes('NIFTY 50'));
    assert.ok(indexSymbols.includes('MCX iCOMDEX'));
    assert.ok(indexSymbols.includes('INDIA VIX'));
  });

  it('should have valid initial portfolio holdings', () => {
    assert.ok(INITIAL_HOLDINGS.length > 0, 'Initial holdings must have seed assets');
    for (const holding of INITIAL_HOLDINGS) {
      assert.ok(holding.quantity > 0, 'Holding quantity must be > 0');
      assert.ok(holding.avgBuyPrice > 0, 'Average buy price must be > 0');
      assert.ok(holding.symbol.length > 0, 'Symbol must not be empty');
    }
  });

  it('should include MCX stock and MCX commodities in engine stocks', () => {
    const engine = new MarketEngine();
    const stocks = engine.getStocks();

    const mcxStock = stocks.find((s) => s.symbol === 'MCX');
    assert.ok(mcxStock, 'MCX stock must exist in market engine');
    assert.equal(mcxStock.exchange, 'NSE');
    assert.ok(mcxStock.currentPrice > 0, 'MCX price must be positive');

    const gold = stocks.find((s) => s.symbol === 'GOLD');
    assert.ok(gold, 'GOLD commodity must exist in market engine');
    assert.equal(gold.exchange, 'MCX');
    assert.ok(gold.currentPrice > 50000, 'Gold price must be realistic in INR');

    engine.stopSimulation();
  });
});
