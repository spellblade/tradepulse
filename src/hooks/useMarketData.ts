import { useState, useEffect } from 'react';
import { marketEngine } from '../services/marketEngine';
import { StockSymbol, IntradayTrade, VolatilityAlert, MarketIndex, MarketActivitySpeed } from '../types';

/**
 * State container interface for real-time market data consumed by UI components.
 */
export interface MarketDataState {
  stocks: StockSymbol[];
  trades: IntradayTrade[];
  alerts: VolatilityAlert[];
  indices: MarketIndex[];
  fps: number;
  batchCount: number;
  isRunning: boolean;
  speed: MarketActivitySpeed;
}

/**
 * Custom React hook providing reactive subscriptions to the real-time MarketEngine singleton.
 * Automatically manages listener attachment and unsubscription on component lifecycle.
 *
 * @returns {MarketDataState} Reactive snapshot of active stocks, trades, alerts, indices, and engine telemetry.
 */
export function useMarketData(): MarketDataState {
  const [state, setState] = useState<MarketDataState>({
    stocks: marketEngine.getStocks(),
    trades: marketEngine.getTrades(),
    alerts: marketEngine.getAlerts(),
    indices: [],
    fps: 60,
    batchCount: 0,
    isRunning: marketEngine.isSimulationRunning(),
    speed: marketEngine.getSpeed(),
  });

  useEffect(() => {
    const unsubscribe = marketEngine.subscribe((stocks, trades, alerts, indices, fps, batchCount) => {
      setState({
        stocks,
        trades,
        alerts,
        indices,
        fps,
        batchCount,
        isRunning: marketEngine.isSimulationRunning(),
        speed: marketEngine.getSpeed(),
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return state;
}
