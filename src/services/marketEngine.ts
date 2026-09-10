import { StockSymbol, IntradayTrade, VolatilityAlert, MarketIndex, MarketActivitySpeed, CustomPriceAlert, MarketExchange } from '../types';
import { INITIAL_STOCKS, INITIAL_INTRADAY_TRADES, INITIAL_ALERTS, INITIAL_INDICES } from '../data/initialData';
import { LISTED_COMPANIES_DIRECTORY, instantiateStockFromTemplate } from '../data/listedCompanies';
import { realtimeMarketService, LiveQuote } from './realtimeMarketService';
import { isMarketOpen, getExchangeStatus, ExchangeMarketStatus } from './exchangeSchedule';
import confetti from 'canvas-confetti';

type SubscribeCallback = (
  stocks: StockSymbol[],
  trades: IntradayTrade[],
  alerts: VolatilityAlert[],
  indices: MarketIndex[],
  fps: number,
  batchCount: number
) => void;

/**
 * High-performance real-time market tracking and execution engine for TradePulse.
 * Implements a regulated observer event bus integrating live real-time feeds from BSE, NSE,
 * and MCX with official market hours scheduling and off-hours static closing governance.
 */
export class MarketEngine {
  private stocks: StockSymbol[] = [];
  private intradayTrades: IntradayTrade[] = [];
  private alerts: VolatilityAlert[] = [];
  private indices: MarketIndex[] = [];
  private customAlerts: CustomPriceAlert[] = [];
  private subscribers: Set<SubscribeCallback> = new Set();

  private isRunning: boolean = true;
  private isLiveFeedActive: boolean = true;
  private isPracticeMode: boolean = false;
  private speed: MarketActivitySpeed = 'normal';
  private timerId: ReturnType<typeof setInterval> | null = null;
  private syncInProgress: boolean = false;
  private lastLiveSyncTime: number = 0;

  // Performance metrics
  private lastUiNotifyTime: number = Date.now();
  private frameCount: number = 0;
  private currentFps: number = 60;
  private tickBatchCount: number = 0;
  private pendingNotify: boolean = false;

  constructor() {
    this.stocks = JSON.parse(JSON.stringify(INITIAL_STOCKS));
    this.intradayTrades = JSON.parse(JSON.stringify(INITIAL_INTRADAY_TRADES));
    this.alerts = JSON.parse(JSON.stringify(INITIAL_ALERTS));
    this.indices = JSON.parse(JSON.stringify(INITIAL_INDICES)).map((idx: MarketIndex) => ({
      ...idx,
      isOpen: isMarketOpen(idx.exchange === 'VIX' ? 'NSE' : (idx.exchange || 'NSE')),
    }));

    this.startSimulation();
    // Fetch initial real-time market quotes asynchronously
    this.syncWithRealMarket();
  }

  /**
   * Subscribes a listener callback to real-time market engine ticks and state mutations.
   * Immediately invokes the callback with current state upon subscription.
   *
   * @param {SubscribeCallback} cb - Subscriber callback invoked on price updates and trade events.
   * @returns {() => void} Unsubscribe function to release the listener on unmount.
   */
  public subscribe(cb: SubscribeCallback): () => void {
    this.subscribers.add(cb);
    // Notify immediately on subscribe
    cb(this.stocks, this.intradayTrades, this.alerts, this.indices, this.currentFps, this.tickBatchCount);
    return () => {
      this.subscribers.delete(cb);
    };
  }

  private getTickIntervalMs(): number {
    switch (this.speed) {
      case 'hyper': return 160;   // High-activity stress mode (6+ ticks per sec)
      case 'turbo': return 400;   // 2.5 ticks per sec
      case 'normal':              // Default 1000ms
      default: return 1000;
    }
  }

  /**
   * Sets the simulation activity rate (normal: 1000ms, turbo: 400ms, hyper: 160ms).
   *
   * @param {MarketActivitySpeed} newSpeed - Target activity speed profile.
   */
  public setSpeed(newSpeed: MarketActivitySpeed) {
    this.speed = newSpeed;
    if (this.isRunning) {
      this.stopSimulation();
      this.startSimulation();
    }
    this.notifySubscribers();
  }

  /**
   * Retrieves the current simulation activity speed setting.
   *
   * @returns {MarketActivitySpeed} Active speed setting ('normal' | 'turbo' | 'hyper').
   */
  public getSpeed(): MarketActivitySpeed {
    return this.speed;
  }

  /**
   * Toggles the continuous market tick simulation between running and paused states.
   *
   * @returns {boolean} True if simulation is now running, false if paused.
   */
  public toggleRunning(): boolean {
    if (this.isRunning) {
      this.stopSimulation();
    } else {
      this.startSimulation();
    }
    this.notifySubscribers();
    return this.isRunning;
  }

  /**
   * Checks whether the background market simulation loop is currently active.
   *
   * @returns {boolean} True if active, false if stopped.
   */
  public isSimulationRunning(): boolean {
    return this.isRunning;
  }

  private startSimulation() {
    if (this.timerId) clearInterval(this.timerId);
    this.isRunning = true;
    const interval = this.getTickIntervalMs();

    this.timerId = setInterval(() => {
      this.tick();
    }, interval);
  }

  /**
   * Halts the background simulation interval timer and pauses price generation.
   */
  public stopSimulation() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    this.isRunning = false;
  }

  private tick() {
    this.tickBatchCount++;
    const now = Date.now();

    // 1. Periodically fetch real market quotes if live feed is enabled (every 4 seconds)
    if (this.isLiveFeedActive && now - this.lastLiveSyncTime > 4000) {
      this.syncWithRealMarket();
    }

    // Check exchange open states
    const bseOpen = isMarketOpen('BSE');
    const nseOpen = isMarketOpen('NSE');
    const mcxOpen = isMarketOpen('MCX');

    /*
     * ARCHITECTURAL INTENT: Market Hours Aware Price Evolution
     * If the asset's exchange is CLOSED and practice mode is OFF, prices freeze at the
     * official closing prices (as mandated by engineering requirements).
     * If OPEN (or practice simulation is enabled), prices evolve with live feeds or gentle stochastic ticks.
     */
    this.stocks = this.stocks.map((stock) => {
      const isOpen = stock.exchange === 'MCX' ? mcxOpen : (stock.exchange === 'BSE' ? bseOpen : nseOpen);

      // Freeze at real closing price if market is closed and practice mode is off
      if (!isOpen && !this.isPracticeMode) {
        return stock;
      }

      // In practice mode or live open market session, simulate micro-ticks between API syncs
      const drift = 0.00002;
      const vol = stock.volatilityIndex * (this.speed === 'hyper' ? 0.003 : 0.0015);
      const randomNormal = (Math.random() - 0.495) * 2;
      const priceDeltaPercent = drift + vol * randomNormal;

      const oldPrice = stock.currentPrice;
      const newPrice = Number((Math.max(0.01, oldPrice * (1 + priceDeltaPercent))).toFixed(2));
      const change = Number((newPrice - stock.previousClose).toFixed(2));
      const changePercent = Number(((change / stock.previousClose) * 100).toFixed(2));

      const newHigh = Math.max(stock.dayHigh, newPrice);
      const newLow = Math.min(stock.dayLow, newPrice);

      // Append or update latest bar
      const latestHistory = [...stock.history];
      if (latestHistory.length > 0) {
        const lastCandle = latestHistory[latestHistory.length - 1];
        lastCandle.close = newPrice;
        lastCandle.high = Math.max(lastCandle.high, newPrice);
        lastCandle.low = Math.min(lastCandle.low, newPrice);
        lastCandle.volume = lastCandle.volume + Math.floor(Math.random() * 1500 + 300);

        const startIdx = Math.max(0, latestHistory.length - 20);
        const subset = latestHistory.slice(startIdx);
        const sma = subset.reduce((sum, p) => sum + p.close, 0) / subset.length;
        lastCandle.sma20 = Number(sma.toFixed(2));
      }

      // Check sudden surge alert
      if (Math.abs(priceDeltaPercent) > 0.011) {
        const isSurge = priceDeltaPercent > 0;
        this.addAlert({
          id: `alert-${now}-${stock.symbol}`,
          timestamp: now,
          symbol: stock.symbol,
          name: stock.name,
          type: isSurge ? 'SURGE' : 'DIVE',
          price: newPrice,
          changePercent: changePercent,
          message: isSurge
            ? `${stock.symbol} spiked +${(priceDeltaPercent * 100).toFixed(2)}% in seconds! High volume surge.`
            : `${stock.symbol} dropped ${(priceDeltaPercent * 100).toFixed(2)}% rapidly. Volatility warning.`,
          severity: isSurge ? 'warning' : 'alert',
          read: false,
        });
      }

      // Check custom user price alerts
      this.customAlerts.forEach((calert) => {
        if (calert.active && calert.symbol === stock.symbol) {
          const isTriggered =
            (calert.condition === 'ABOVE' && newPrice >= calert.targetPrice) ||
            (calert.condition === 'BELOW' && newPrice <= calert.targetPrice);

          if (isTriggered) {
            calert.active = false;
            calert.triggeredAt = now;
            this.addAlert({
              id: `custom-alert-${now}-${stock.symbol}-${Math.random().toString(36).substring(2, 6)}`,
              timestamp: now,
              symbol: stock.symbol,
              name: stock.name,
              type: 'HIGH_VOLATILITY',
              price: newPrice,
              changePercent: changePercent,
              message: `Price Alert Triggered: ${stock.symbol} is ₹${newPrice.toFixed(2)} (${calert.condition === 'ABOVE' ? '≥' : '≤'} ₹${calert.targetPrice.toFixed(2)})`,
              severity: 'warning',
              read: false,
            });
          }
        }
      });

      return {
        ...stock,
        currentPrice: newPrice,
        change,
        changePercent,
        dayHigh: newHigh,
        dayLow: newLow,
        history: latestHistory,
      };
    });

    // 2. Keep benchmark exchange indices synchronized with market hours status
    this.indices = this.indices.map((idx) => {
      const open = isMarketOpen(idx.exchange === 'VIX' ? 'NSE' : (idx.exchange || 'NSE'));
      return {
        ...idx,
        isOpen: open,
      };
    });

    // 3. Evaluate Intraday Risk Governance
    this.evaluateIntradayTrades(now);
  }

  /**
   * Synchronizes the engine state with real-time market data across BSE, NSE, and MCX.
   * Updates stocks, indices, and evaluates auto-exit and alert conditions against real prices.
   */
  public async syncWithRealMarket(): Promise<void> {
    if (this.syncInProgress) return;
    this.syncInProgress = true;
    this.lastLiveSyncTime = Date.now();

    try {
      const symbolsToFetch = [
        ...this.indices.map((i) => i.symbol),
        ...this.stocks.map((s) => s.symbol),
      ];

      const quotes = await realtimeMarketService.fetchBatchQuotes(symbolsToFetch);
      const now = Date.now();

      // 1. Synchronize Indices
      this.indices = this.indices.map((idx) => {
        const quote = quotes.get(idx.symbol);
        const open = isMarketOpen(idx.exchange === 'VIX' ? 'NSE' : (idx.exchange || 'NSE'));
        if (quote && quote.price > 0) {
          return {
            ...idx,
            value: quote.price,
            change: quote.change,
            changePercent: quote.changePercent,
            isOpen: open,
          };
        }
        return {
          ...idx,
          isOpen: open,
        };
      });

      // 2. Synchronize Stocks & Commodities
      this.stocks = this.stocks.map((stock) => {
        const quote = quotes.get(stock.symbol);
        if (!quote || quote.price <= 0) return stock;

        const newPrice = quote.price;
        const previousClose = quote.previousClose > 0 ? quote.previousClose : stock.previousClose;
        const change = quote.change;
        const changePercent = quote.changePercent;
        const newHigh = Math.max(stock.dayHigh, quote.dayHigh, newPrice);
        const newLow = stock.dayLow > 0 ? Math.min(stock.dayLow, quote.dayLow, newPrice) : quote.dayLow;

        const latestHistory = [...stock.history];
        if (latestHistory.length > 0) {
          const lastCandle = latestHistory[latestHistory.length - 1];
          lastCandle.close = newPrice;
          lastCandle.high = Math.max(lastCandle.high, newPrice);
          lastCandle.low = Math.min(lastCandle.low, newPrice);
          if (quote.volume > 0) {
            lastCandle.volume = quote.volume;
          }
        }

        return {
          ...stock,
          currentPrice: newPrice,
          previousClose,
          change,
          changePercent,
          dayHigh: newHigh,
          dayLow: newLow,
          volume: quote.volume > 0 ? quote.volume : stock.volume,
          history: latestHistory,
        };
      });

      this.evaluateIntradayTrades(now);
      this.notifySubscribers();
    } catch (e) {
      // Graceful fallback
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Evaluates open intraday trade positions for target profit auto-exit and stop loss triggers.
   *
   * @param {number} now - Current epoch timestamp.
   */
  private evaluateIntradayTrades(now: number) {
    let autoExitTriggered = false;

    this.intradayTrades = this.intradayTrades.map((trade) => {
      if (trade.status !== 'OPEN') return trade;

      const stock = this.stocks.find((s) => s.symbol === trade.symbol);
      if (!stock) return trade;

      const currentPrice = stock.currentPrice;
      const priceDiff = trade.type === 'BUY'
        ? (currentPrice - trade.entryPrice)
        : (trade.entryPrice - currentPrice);

      const pnl = Number((priceDiff * trade.quantity).toFixed(2));
      const pnlPercent = Number(((priceDiff / trade.entryPrice) * 100).toFixed(2));

      // Check if target profit is reached!
      if (pnl >= trade.targetProfitAmount) {
        autoExitTriggered = true;
        const exitedTrade: IntradayTrade = {
          ...trade,
          currentPrice,
          pnl,
          pnlPercent,
          status: 'AUTO_EXITED_PROFIT',
          exitTime: now,
          exitPrice: currentPrice,
          exitReason: `Auto-Exit: Predefined target profit (₹${trade.targetProfitAmount.toFixed(2)}) reached automatically! Profit: +₹${pnl.toFixed(2)}`,
          autoExited: true,
        };

        this.addAlert({
          id: `auto-exit-${now}-${trade.symbol}`,
          timestamp: now,
          symbol: trade.symbol,
          name: trade.name,
          type: 'AUTO_EXIT',
          price: currentPrice,
          changePercent: pnlPercent,
          message: `TARGET PROFIT REACHED! Automatically exited ${trade.type} ${trade.quantity} ${trade.symbol} at ₹${currentPrice.toFixed(2)} for +₹${pnl.toFixed(2)} profit.`,
          severity: 'success',
          read: false,
        });

        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {}

        return exitedTrade;
      }

      // Check optional Stop Loss
      if (trade.stopLossAmount && pnl <= -trade.stopLossAmount) {
        const stoppedTrade: IntradayTrade = {
          ...trade,
          currentPrice,
          pnl,
          pnlPercent,
          status: 'STOPPED_OUT',
          exitTime: now,
          exitPrice: currentPrice,
          exitReason: `Stop-Loss Exited: Predefined stop loss (-₹${trade.stopLossAmount.toFixed(2)}) reached.`,
        };

        this.addAlert({
          id: `stop-loss-${now}-${trade.symbol}`,
          timestamp: now,
          symbol: trade.symbol,
          name: trade.name,
          type: 'HIGH_VOLATILITY',
          price: currentPrice,
          changePercent: pnlPercent,
          message: `Stop Loss Triggered! Exited ${trade.symbol} at ₹${currentPrice.toFixed(2)} (P&L: -₹${Math.abs(pnl).toFixed(2)}).`,
          severity: 'alert',
          read: false,
        });

        return stoppedTrade;
      }

      return {
        ...trade,
        currentPrice,
        pnl,
        pnlPercent,
      };
    });
  }

  // Ensure high-market activity never blocks the main UI thread
  private scheduleUiNotify() {
    if (this.pendingNotify) return;
    this.pendingNotify = true;

    // Throttle notifications to approx 30-60 FPS so heavy React chart trees stay responsive
    const now = Date.now();
    const elapsed = now - this.lastUiNotifyTime;

    if (elapsed >= 1000) {
      this.currentFps = Math.min(60, Math.round((this.frameCount * 1000) / elapsed));
      this.frameCount = 0;
      this.lastUiNotifyTime = now;
    }
    this.frameCount++;

    requestAnimationFrame(() => {
      this.pendingNotify = false;
      this.notifySubscribers();
    });
  }

  private notifySubscribers() {
    this.subscribers.forEach((cb) => {
      cb(
        [...this.stocks],
        [...this.intradayTrades],
        [...this.alerts],
        [...this.indices],
        this.currentFps,
        this.tickBatchCount
      );
    });
  }

  private addAlert(alert: VolatilityAlert) {
    this.alerts = [alert, ...this.alerts].slice(0, 50); // Keep last 50 alerts
  }

  // --- PUBLIC MODIFICATION API FOR USER ACTIONS ---

  /**
   * Retrieves an immutable snapshot of all active stock symbols and their current market prices.
   *
   * @returns {StockSymbol[]} Array of currently tracked stock symbols.
   */
  public getStocks(): StockSymbol[] {
    return this.stocks;
  }

  /**
   * Retrieves all active and historically completed intraday trades.
   *
   * @returns {IntradayTrade[]} List of intraday trades in the terminal order book.
   */
  public getTrades(): IntradayTrade[] {
    return this.intradayTrades;
  }

  /**
   * Retrieves active market volatility, execution, and price trigger alerts.
   *
   * @returns {VolatilityAlert[]} Recent notification events (capped at 50).
   */
  public getAlerts(): VolatilityAlert[] {
    return this.alerts;
  }

  /**
   * Marks an individual alert as read by its unique identifier.
   *
   * @param {string} alertId - Target alert ID to update.
   */
  public markAlertAsRead(alertId: string) {
    this.alerts = this.alerts.map((a) => a.id === alertId ? { ...a, read: true } : a);
    this.notifySubscribers();
  }

  /**
   * Marks all alerts across the application as read.
   */
  public markAllAlertsAsRead() {
    this.alerts = this.alerts.map((a) => ({ ...a, read: true }));
    this.notifySubscribers();
  }

  /**
   * Clears all notifications and reset the alert tray.
   */
  public clearAllAlerts() {
    this.alerts = [];
    this.notifySubscribers();
  }

  // --- CUSTOM PRICE ALERTS CONFIGURATION ---

  /**
   * Returns all active and triggered custom price alerts configured by the user.
   *
   * @returns {CustomPriceAlert[]} List of custom price alerts.
   */
  public getCustomAlerts(): CustomPriceAlert[] {
    return [...this.customAlerts];
  }

  /**
   * Registers a new custom price threshold alert for a specific symbol.
   *
   * @param {string} symbol - Equity or commodity symbol (e.g., 'RELIANCE', 'GOLD').
   * @param {'ABOVE' | 'BELOW'} condition - Comparison operator for the trigger.
   * @param {number} targetPrice - Price boundary in INR.
   * @returns {CustomPriceAlert} Created alert definition.
   */
  public addCustomPriceAlert(symbol: string, condition: 'ABOVE' | 'BELOW', targetPrice: number): CustomPriceAlert {
    const newAlert: CustomPriceAlert = {
      id: `calert-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      symbol,
      condition,
      targetPrice,
      active: true,
      createdAt: Date.now(),
    };
    this.customAlerts.push(newAlert);
    this.notifySubscribers();
    return newAlert;
  }

  /**
   * Removes a custom price alert by its unique identifier.
   *
   * @param {string} id - Target alert identifier to remove.
   */
  public removeCustomPriceAlert(id: string) {
    this.customAlerts = this.customAlerts.filter((a) => a.id !== id);
    this.notifySubscribers();
  }

  /**
   * Toggles the active/paused evaluation status of a custom price alert.
   *
   * @param {string} id - Target alert identifier to toggle.
   */
  public toggleCustomPriceAlert(id: string) {
    const alert = this.customAlerts.find((a) => a.id === id);
    if (alert) {
      alert.active = !alert.active;
      this.notifySubscribers();
    }
  }

  /**
   * Adds an active intraday trade position to the terminal order book and dispatches execution alerts.
   *
   * @param {Omit<IntradayTrade, 'id' | 'pnl' | 'pnlPercent' | 'status' | 'entryTime'>} newTrade - Trade order details.
   * @returns {IntradayTrade} Instantiated intraday trade with generated ID and OPEN status.
   */
  public addIntradayTrade(newTrade: Omit<IntradayTrade, 'id' | 'pnl' | 'pnlPercent' | 'status' | 'entryTime'>): IntradayTrade {
    const id = `trade-${Date.now()}`;
    const trade: IntradayTrade = {
      ...newTrade,
      id,
      pnl: 0,
      pnlPercent: 0,
      status: 'OPEN',
      entryTime: Date.now(),
    };
    this.intradayTrades = [trade, ...this.intradayTrades];
    this.notifySubscribers();

    this.addAlert({
      id: `new-trade-${Date.now()}`,
      timestamp: Date.now(),
      symbol: trade.symbol,
      name: trade.name,
      type: 'SURGE',
      price: trade.entryPrice,
      changePercent: 0,
      message: `Opened Intraday ${trade.type} on ${trade.quantity} ${trade.symbol} at ₹${trade.entryPrice.toFixed(2)}. Target Profit: +₹${trade.targetProfitAmount.toFixed(2)}`,
      severity: 'info',
      read: false,
    });

    return trade;
  }

  /**
   * Manually squares off an open intraday trade position at current market prices.
   *
   * @param {string} tradeId - Identifier of the trade to square off.
   */
  public exitTradeManually(tradeId: string) {
    const now = Date.now();
    this.intradayTrades = this.intradayTrades.map((t) => {
      if (t.id !== tradeId || t.status !== 'OPEN') return t;
      const stock = this.stocks.find((s) => s.symbol === t.symbol);
      const exitPrice = stock ? stock.currentPrice : t.currentPrice;
      const priceDiff = t.type === 'BUY' ? (exitPrice - t.entryPrice) : (t.entryPrice - exitPrice);
      const pnl = Number((priceDiff * t.quantity).toFixed(2));
      const pnlPercent = Number(((priceDiff / t.entryPrice) * 100).toFixed(2));

      return {
        ...t,
        status: 'EXITED_MANUAL',
        currentPrice: exitPrice,
        pnl,
        pnlPercent,
        exitTime: now,
        exitPrice,
        exitReason: `Manual Exit at ₹${exitPrice.toFixed(2)} (P&L: ${pnl >= 0 ? '+' : ''}₹${pnl.toFixed(2)})`,
      };
    });
    this.notifySubscribers();
  }

  /**
   * Diagnostic & testing helper that instantaneously surges a stock price so that an open trade
   * crosses its target profit threshold and executes an automatic square-off.
   *
   * @param {string} tradeId - Identifier of the target trade.
   * @returns {boolean} True if price jump was simulated and auto-exit evaluated, false otherwise.
   */
  public triggerSpikeToTargetProfit(tradeId: string): boolean {
    const trade = this.intradayTrades.find((t) => t.id === tradeId && t.status === 'OPEN');
    if (!trade) return false;

    const stockIndex = this.stocks.findIndex((s) => s.symbol === trade.symbol);
    if (stockIndex === -1) return false;

    // Calculate the target price needed to reach Target Profit Amount
    // pnl = (newPrice - entryPrice) * qty -> newPrice = entryPrice + (targetProfit / qty) + small buffer
    const bufferPercent = 1.002; // Slightly above target so condition triggers instantly
    const requiredPriceDelta = (trade.targetProfitAmount / trade.quantity) * bufferPercent;
    const targetPrice = trade.type === 'BUY'
      ? Number((trade.entryPrice + requiredPriceDelta).toFixed(2))
      : Number((trade.entryPrice - requiredPriceDelta).toFixed(2));

    const stock = this.stocks[stockIndex];
    const change = Number((targetPrice - stock.previousClose).toFixed(2));
    const changePercent = Number(((change / stock.previousClose) * 100).toFixed(2));

    // Update stock price instantly
    this.stocks[stockIndex] = {
      ...stock,
      currentPrice: targetPrice,
      change,
      changePercent,
      dayHigh: Math.max(stock.dayHigh, targetPrice),
      dayLow: Math.min(stock.dayLow, targetPrice),
    };

    // Immediately trigger tick evaluation so auto-exit fires!
    this.tick();
    return true;
  }

  /**
   * Ensures a stock symbol is loaded in the active simulation list, instantiating from the listed directory if needed.
   *
   * @param {string} symbol - Company or commodity symbol ticker.
   * @returns {StockSymbol | undefined} The active stock symbol object, or undefined if not in directory.
   */
  public ensureStockActive(symbol: string): StockSymbol | undefined {
    const existing = this.stocks.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
    if (existing) return existing;

    const template = LISTED_COMPANIES_DIRECTORY.find((t) => t.symbol.toUpperCase() === symbol.toUpperCase());
    if (!template) return undefined;

    const newStock = instantiateStockFromTemplate(template);
    this.stocks = [...this.stocks, newStock];
    this.notifySubscribers();
    return newStock;
  }

  /**
   * Returns the canonical static listed company directory across BSE, NSE, and MCX.
   *
   * @returns {readonly ListedCompanyTemplate[]} Directory templates.
   */
  public getDirectory() {
    return LISTED_COMPANIES_DIRECTORY;
  }

  /**
   * Retrieves live operational market hours status for a specified exchange.
   *
   * @param {MarketExchange} exchange - Market exchange ('BSE' | 'NSE' | 'MCX').
   * @returns {ExchangeMarketStatus} Operational status and next session notice.
   */
  public getExchangeStatus(exchange: MarketExchange): ExchangeMarketStatus {
    return getExchangeStatus(exchange);
  }

  /**
   * Checks whether real-time market data tracking is enabled.
   *
   * @returns {boolean} True if live feed is enabled, false if running in purely offline mode.
   */
  public isLiveFeed(): boolean {
    return this.isLiveFeedActive;
  }

  /**
   * Toggles live feed streaming on or off.
   *
   * @returns {boolean} New live feed state.
   */
  public toggleLiveFeed(): boolean {
    this.isLiveFeedActive = !this.isLiveFeedActive;
    if (this.isLiveFeedActive) {
      this.syncWithRealMarket();
    }
    this.notifySubscribers();
    return this.isLiveFeedActive;
  }

  /**
   * Checks whether off-hours practice simulation mode is enabled.
   *
   * @returns {boolean} True if practice mode is on.
   */
  public isPracticeModeActive(): boolean {
    return this.isPracticeMode;
  }

  /**
   * Toggles practice simulation mode during closed market hours.
   *
   * @returns {boolean} New practice mode state.
   */
  public togglePracticeMode(): boolean {
    this.isPracticeMode = !this.isPracticeMode;
    this.notifySubscribers();
    return this.isPracticeMode;
  }

  /**
   * Fetches real historical OHLC candles from Yahoo Finance to update the analytical chart.
   *
   * @param {string} symbol - TradePulse symbol.
   * @param {string} [timeframe='1D'] - Chart resolution range.
   * @returns {Promise<OHLCPoint[] | null>} Real candle series with indicator overlays.
   */
  public async fetchHistoricalCandles(symbol: string, timeframe: string = '1D'): Promise<OHLCPoint[] | null> {
    const candles = await realtimeMarketService.fetchHistoricalCandles(symbol, timeframe);
    if (candles && candles.length > 0) {
      const stock = this.stocks.find((s) => s.symbol.toUpperCase() === symbol.toUpperCase());
      if (stock) {
        stock.history = candles;
        this.notifySubscribers();
      }
      return candles;
    }
    return null;
  }
}

/**
 * Singleton instance of MarketEngine for app-wide real-time telemetry and execution.
 */
export const marketEngine = new MarketEngine();
