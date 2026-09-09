import { useState, useEffect } from 'react';
import { marketEngine } from '../services/marketEngine';
import { StockSymbol, IntradayTrade, VolatilityAlert, MarketIndex, MarketActivitySpeed } from '../types';

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
