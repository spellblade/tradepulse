import React, { useState } from 'react';
import { IntradayTrade, StockSymbol } from '../types';
import { marketEngine } from '../services/marketEngine';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Minus,
  PlayCircle,
  XCircle,
  ArrowUpRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { SymbolSearchCombobox } from './SymbolSearchCombobox';

/**
 * Props for the IntradayTradingPanel order book and execution management panel.
 */
interface IntradayTradingPanelProps {
  /** Active and closed intraday trades in the terminal */
  trades: IntradayTrade[];
  /** Tracked stock symbols providing live mark-to-market prices */
  stocks: StockSymbol[];
  /** Currently selected symbol in the platform view */
  selectedSymbol: string;
}

/**
 * Real-time intraday trading terminal panel supporting position sizing, profit target auto-exit triggers,
 * stop loss parameters, and manual square-off executions.
 *
 * @param {IntradayTradingPanelProps} props - Render configuration.
 * @returns {React.ReactElement} Intraday order management console.
 */
export const IntradayTradingPanel: React.FC<IntradayTradingPanelProps> = ({
  trades,
  stocks,
  selectedSymbol,
}) => {
  const [activeTab, setActiveTab] = useState<'OPEN' | 'HISTORY'>('OPEN');
  const [isCreating, setIsCreating] = useState<boolean>(false);

  // Form state for creating a new intraday trade with Auto-Exit Target Profit
  const [symbol, setSymbol] = useState<string>(selectedSymbol || 'RELIANCE');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(50);
  const [targetProfitAmount, setTargetProfitAmount] = useState<number>(1000);
  const [stopLossAmount, setStopLossAmount] = useState<number>(500);

  // Keep symbol in sync when selectedSymbol changes
  React.useEffect(() => {
    if (selectedSymbol) setSymbol(selectedSymbol);
  }, [selectedSymbol]);

  const openTrades = trades.filter((t) => t.status === 'OPEN');
  const closedTrades = trades.filter((t) => t.status !== 'OPEN');

  const totalIntradayPnl = trades.reduce((acc, t) => acc + t.pnl, 0);
  const openPnl = openTrades.reduce((acc, t) => acc + t.pnl, 0);

  const handleCreateTrade = (e: React.FormEvent) => {
    e.preventDefault();
    let stock = stocks.find((s) => s.symbol === symbol);
    if (!stock) {
      stock = marketEngine.ensureStockActive(symbol);
    }
    if (!stock) return;

    marketEngine.addIntradayTrade({
      symbol: stock.symbol,
      name: stock.name,
      type: tradeType,
      quantity: Number(quantity) || 1,
      entryPrice: stock.currentPrice,
      currentPrice: stock.currentPrice,
      targetProfitAmount: Number(targetProfitAmount) || 100,
      stopLossAmount: Number(stopLossAmount) || 0,
    });

    setIsCreating(false);
  };

  const handleSanitizedChange = (setter: (val: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      setter(0);
      return;
    }
    const cleaned = raw.replace(/^0+(?=\d)/, '');
    const num = Number(cleaned);
    if (!isNaN(num)) {
      setter(num);
    }
  };

  const handleTestAutoExit = (tradeId: string) => {
    marketEngine.triggerSpikeToTargetProfit(tradeId);
  };

  const handleManualExit = (tradeId: string) => {
    marketEngine.exitTradeManually(tradeId);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Panel Header & Summary Metrics */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-indigo-400 fill-current" />
              <span>Intraday Trades & Auto-Exit Engine</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-xs font-semibold">
              BSE • NSE • MCX
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time trade evaluation. Automatically exits the position when your predefined Target Profit amount is reached.
          </p>
        </div>

        {/* Live Intraday PnL Badges */}
        <div className="flex items-center gap-4">
          <div className="bg-slate-950 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs text-right">
            <span className="text-[10px] text-slate-400 block">Open Intraday P&L</span>
            <span
              className={`font-mono font-bold text-sm ${
                openPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {openPnl >= 0 ? '+' : ''}₹{openPnl.toFixed(2)}
            </span>
          </div>

          <button
            id="btn-toggle-new-intraday-order"
            onClick={() => setIsCreating(!isCreating)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-all cursor-pointer ${
              isCreating
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80 hover:bg-rose-900/80'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {isCreating ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{isCreating ? 'Cancel Order' : 'New Intraday Order'}</span>
          </button>
        </div>
      </div>

      {/* NEW INTRADAY ORDER FORM COLLAPSIBLE */}
      {isCreating && (
        <form
          onSubmit={handleCreateTrade}
          className="bg-slate-950/90 border-b border-slate-800 p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end animate-fadeIn"
        >
          {/* Dynamic Symbol & Market Combobox */}
          <div>
            <SymbolSearchCombobox
              label="Symbol & Market"
              selectedSymbol={symbol}
              onSelectSymbol={(s) => setSymbol(s)}
              stocks={stocks}
            />
          </div>

          {/* Trade Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
              Order Type
            </label>
            <div className="grid grid-cols-2 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setTradeType('BUY')}
                className={`py-1 rounded-lg text-xs font-bold transition-all ${
                  tradeType === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                BUY
              </button>
              <button
                type="button"
                onClick={() => setTradeType('SELL')}
                className={`py-1 rounded-lg text-xs font-bold transition-all ${
                  tradeType === 'SELL'
                    ? 'bg-rose-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                SELL (Short)
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
              Quantity / Lots
            </label>
            <input
              type="number"
              min="1"
              value={quantity === 0 ? '' : quantity}
              onChange={handleSanitizedChange(setQuantity)}
              placeholder="0"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Target Profit Amount */}
          <div>
            <label className="block text-[11px] font-semibold text-emerald-400 uppercase mb-1 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Target Profit (₹)
            </label>
            <input
              type="number"
              step="50"
              min="50"
              value={targetProfitAmount === 0 ? '' : targetProfitAmount}
              onChange={handleSanitizedChange(setTargetProfitAmount)}
              placeholder="0"
              className="w-full bg-slate-900 border border-emerald-500/50 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-emerald-300 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Stop Loss Amount */}
          <div>
            <label className="block text-[11px] font-semibold text-rose-400 uppercase mb-1">
              Stop Loss (₹)
            </label>
            <input
              type="number"
              step="50"
              min="0"
              value={stopLossAmount === 0 ? '' : stopLossAmount}
              onChange={handleSanitizedChange(setStopLossAmount)}
              placeholder="0"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-rose-300 focus:outline-none focus:border-rose-400"
            />
          </div>

          {/* Submit and Cancel Actions */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Place Order</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-3 py-2.5 rounded-xl text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/80 hover:bg-rose-900/80 transition-colors cursor-pointer"
              title="Cancel Order"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Tabs Bar */}
      <div className="flex items-center justify-between px-4 sm:px-5 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-6">
          <button
            onClick={() => setActiveTab('OPEN')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'OPEN'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Open Positions</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 text-[11px] font-mono">
              {openTrades.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('HISTORY')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'HISTORY'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Auto-Exit Log & History</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-200 text-[11px] font-mono">
              {closedTrades.length}
            </span>
          </button>
        </div>

        {/* Info label */}
        <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Auto-Exit executes automatically when Target Profit is reached</span>
        </div>
      </div>

      {/* TAB CONTENT: OPEN POSITIONS */}
      {activeTab === 'OPEN' && (
        <div className="p-4 sm:p-5 space-y-4">
          {openTrades.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/40 rounded-xl border border-slate-800/60">
              <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No Open Intraday Positions</p>
              <p className="text-xs text-slate-500 mt-1">
                Click "New Intraday Order" above or select a stock to open a position with target profit auto-exit.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openTrades.map((trade) => {
                const isBuy = trade.type === 'BUY';
                const isPositive = trade.pnl >= 0;
                const progressPercent = Math.min(
                  100,
                  Math.max(0, (trade.pnl / trade.targetProfitAmount) * 100)
                );

                return (
                  <div
                    key={trade.id}
                    className="bg-slate-950/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 transition-all shadow-md relative overflow-hidden"
                  >
                    {/* Top row: Symbol, Badge, and Real-Time P&L */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-extrabold text-white">
                            {trade.symbol}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isBuy
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {trade.type} {trade.quantity} Qty
                          </span>
                        </div>
                        <span className="text-xs text-slate-400 block mt-0.5">
                          {trade.name} • Entry ₹{trade.entryPrice.toFixed(2)} → Live ₹{trade.currentPrice.toFixed(2)}
                        </span>
                      </div>

                      {/* Real-time PnL */}
                      <div className="text-right">
                        <span
                          className={`block font-mono text-base font-bold ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {isPositive ? '+' : ''}₹{trade.pnl.toFixed(2)}
                        </span>
                        <span
                          className={`inline-block text-[11px] font-semibold font-mono ${
                            isPositive ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          ({isPositive ? '+' : ''}{trade.pnlPercent}%)
                        </span>
                      </div>
                    </div>

                    {/* TARGET PROFIT PROGRESS BAR */}
                    <div className="bg-slate-900 rounded-xl p-3 border border-slate-800/80 mb-3">
                      <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                        <span className="text-slate-300 flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Target Profit Auto-Exit:</span>
                        </span>
                        <span className="font-mono text-emerald-400 font-bold">
                          +₹{trade.targetProfitAmount.toFixed(2)}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden relative">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
                        <span>Current Profit: +₹{Math.max(0, trade.pnl).toFixed(2)}</span>
                        <span>{progressPercent.toFixed(0)}% to Auto-Exit</span>
                      </div>
                    </div>

                    {/* ACTIONS: Test Auto-Exit Spike & Manual Exit */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
                      <button
                        onClick={() => handleTestAutoExit(trade.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all"
                        title="Simulate a price spike to instantly hit target profit and trigger auto-exit"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>⚡ Test Auto-Exit Spike</span>
                      </button>

                      <button
                        onClick={() => handleManualExit(trade.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-all"
                      >
                        Exit Now
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CLOSED / AUTO-EXIT LOG */}
      {activeTab === 'HISTORY' && (
        <div className="p-4 sm:p-5">
          {closedTrades.length === 0 ? (
            <div className="text-center py-12 bg-slate-950/40 rounded-xl border border-slate-800/60">
              <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No Auto-Exited or Closed Trades Yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[11px]">
                    <th className="pb-3 pr-4">Symbol / Type</th>
                    <th className="pb-3 px-4">Qty</th>
                    <th className="pb-3 px-4">Entry / Exit</th>
                    <th className="pb-3 px-4">Exit Status & Reason</th>
                    <th className="pb-3 pl-4 text-right">Net Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {closedTrades.map((t) => {
                    const isPositive = t.pnl >= 0;
                    const isAutoExit = t.status === 'AUTO_EXITED_PROFIT';

                    return (
                      <tr key={t.id} className="hover:bg-slate-950/50 transition-colors">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">{t.symbol}</span>
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                t.type === 'BUY'
                                  ? 'bg-emerald-500/20 text-emerald-300'
                                  : 'bg-rose-500/20 text-rose-300'
                              }`}
                            >
                              {t.type}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-500">{t.name}</span>
                        </td>

                        <td className="py-3 px-4 font-mono font-semibold text-slate-300">
                          {t.quantity}
                        </td>

                        <td className="py-3 px-4 font-mono">
                          <div className="text-slate-300">
                            Entry: ₹{t.entryPrice.toFixed(2)}
                          </div>
                          <div className="text-slate-400">
                            Exit: ₹{t.exitPrice ? t.exitPrice.toFixed(2) : t.currentPrice.toFixed(2)}
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {isAutoExit ? (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              <span>⚡ AUTO-EXIT: Target Profit Reached!</span>
                            </div>
                          ) : t.status === 'STOPPED_OUT' ? (
                            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 font-medium">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Stop-Loss Triggered</span>
                            </div>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                              Manual Exit
                            </span>
                          )}
                          {t.exitReason && (
                            <p className="text-[11px] text-slate-400 mt-1 max-w-sm">
                              {t.exitReason}
                            </p>
                          )}
                        </td>

                        <td className="py-3 pl-4 text-right font-mono font-bold text-sm">
                          <span
                            className={
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }
                          >
                            {isPositive ? '+' : ''}₹{t.pnl.toFixed(2)}
                          </span>
                          <span className="block text-[11px] font-normal text-slate-500">
                            ({isPositive ? '+' : ''}{t.pnlPercent}%)
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
