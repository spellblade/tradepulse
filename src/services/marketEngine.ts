import { StockSymbol, IntradayTrade, VolatilityAlert, MarketIndex, MarketActivitySpeed, CustomPriceAlert } from '../types';
import { INITIAL_STOCKS, INITIAL_INTRADAY_TRADES, INITIAL_ALERTS, INITIAL_INDICES } from '../data/initialData';
import { LISTED_COMPANIES_DIRECTORY, instantiateStockFromTemplate } from '../data/listedCompanies';
import confetti from 'canvas-confetti';

type SubscribeCallback = (
  stocks: StockSymbol[],
  trades: IntradayTrade[],
  alerts: VolatilityAlert[],
  indices: MarketIndex[],
  fps: number,
  batchCount: number
) => void;

export class MarketEngine {
  private stocks: StockSymbol[] = [];
  private intradayTrades: IntradayTrade[] = [];
  private alerts: VolatilityAlert[] = [];
  private indices: MarketIndex[] = [];
  private customAlerts: CustomPriceAlert[] = [];
  private subscribers: Set<SubscribeCallback> = new Set();

  private isRunning: boolean = true;
  private speed: MarketActivitySpeed = 'normal';
  private timerId: ReturnType<typeof setInterval> | null = null;

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
    this.indices = JSON.parse(JSON.stringify(INITIAL_INDICES));

    this.startSimulation();
  }

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

  public setSpeed(newSpeed: MarketActivitySpeed) {
    this.speed = newSpeed;
    if (this.isRunning) {
      this.stopSimulation();
      this.startSimulation();
    }
    this.notifySubscribers();
  }

  public getSpeed(): MarketActivitySpeed {
    return this.speed;
  }

  public toggleRunning(): boolean {
    if (this.isRunning) {
      this.stopSimulation();
    } else {
      this.startSimulation();
    }
    this.notifySubscribers();
    return this.isRunning;
  }

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

    // 1. Simulate real-time price ticks for each stock
    this.stocks = this.stocks.map((stock) => {
      // Geometric brownian jump with volatility index
      const drift = 0.00005;
      const vol = stock.volatilityIndex * (this.speed === 'hyper' ? 0.004 : 0.0025);
      const randomNormal = (Math.random() - 0.492) * 2;
      const priceDeltaPercent = drift + vol * randomNormal;

      const oldPrice = stock.currentPrice;
      const newPrice = Number((Math.max(0.01, oldPrice * (1 + priceDeltaPercent))).toFixed(2));
      const change = Number((newPrice - stock.previousClose).toFixed(2));
      const changePercent = Number(((change / stock.previousClose) * 100).toFixed(2));

      const newHigh = Math.max(stock.dayHigh, newPrice);
      const newLow = Math.min(stock.dayLow, newPrice);

      // Append new OHLC point to history if time moved enough, or update latest bar
      const latestHistory = [...stock.history];
      if (latestHistory.length > 0) {
        const lastCandle = latestHistory[latestHistory.length - 1];
        lastCandle.close = newPrice;
        lastCandle.high = Math.max(lastCandle.high, newPrice);
        lastCandle.low = Math.min(lastCandle.low, newPrice);
        lastCandle.volume = lastCandle.volume + Math.floor(Math.random() * 2500 + 500);

        // Calculate moving averages
        const startIdx = Math.max(0, latestHistory.length - 20);
        const subset = latestHistory.slice(startIdx);
        const sma = subset.reduce((sum, p) => sum + p.close, 0) / subset.length;
        lastCandle.sma20 = Number(sma.toFixed(2));
      }

      // 2. Check for sudden price volatility alert (> 1.2% jump in single tick)
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

    // 3. Update market indices slightly
    this.indices = this.indices.map((idx) => {
      const delta = (Math.random() - 0.49) * 0.15;
      const newValue = Number((idx.value + delta).toFixed(2));
      const newChange = Number((idx.change + delta).toFixed(2));
      const newPercent = Number(((newChange / (newValue - newChange)) * 100).toFixed(2));
      return {
        ...idx,
        value: newValue,
        change: newChange,
        changePercent: newPercent,
      };
    });

    // 4. Update Intraday trades and EVALUATE AUTOMATIC EXIT ON TARGET PROFIT OR STOP LOSS
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

        // Trigger confetti
        try {
          confetti({
            particleCount: 60,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch (e) {
          // Ignore if canvas isn't ready
        }

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

    // Batched UI sync (requestAnimationFrame throttling to guarantee high FPS)
    this.scheduleUiNotify();
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

  public getStocks(): StockSymbol[] {
    return this.stocks;
  }

  public getTrades(): IntradayTrade[] {
    return this.intradayTrades;
  }

  public getAlerts(): VolatilityAlert[] {
    return this.alerts;
  }

  public markAlertAsRead(alertId: string) {
    this.alerts = this.alerts.map((a) => a.id === alertId ? { ...a, read: true } : a);
    this.notifySubscribers();
  }

  public markAllAlertsAsRead() {
    this.alerts = this.alerts.map((a) => ({ ...a, read: true }));
    this.notifySubscribers();
  }

  public clearAllAlerts() {
    this.alerts = [];
    this.notifySubscribers();
  }

  // --- CUSTOM PRICE ALERTS CONFIGURATION ---
  public getCustomAlerts(): CustomPriceAlert[] {
    return [...this.customAlerts];
  }

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

  public removeCustomPriceAlert(id: string) {
    this.customAlerts = this.customAlerts.filter((a) => a.id !== id);
    this.notifySubscribers();
  }

  public toggleCustomPriceAlert(id: string) {
    const alert = this.customAlerts.find((a) => a.id === id);
    if (alert) {
      alert.active = !alert.active;
      this.notifySubscribers();
    }
  }

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

  // **Test Helper**: Instantly surges a stock price so that an OPEN trade hits its target profit amount!
  // Perfect for demonstrating the automatic exit requirement immediately.
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

  public getDirectory() {
    return LISTED_COMPANIES_DIRECTORY;
  }
}

// Singleton instance for app-wide real-time engine
export const marketEngine = new MarketEngine();
