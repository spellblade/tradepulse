import React, { useState } from 'react';
import { PortfolioHolding, StockSymbol } from '../types';
import { 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieChartIcon, 
  Plus, 
  Minus,
  Download,
  ArrowUpRight, 
  Trash2,
  DollarSign,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { SymbolSearchCombobox } from './SymbolSearchCombobox';
import { marketEngine } from '../services/marketEngine';

/**
 * Props for the PortfolioPanel investment management view.
 */
interface PortfolioPanelProps {
  /** User investment holdings stored locally */
  holdings: PortfolioHolding[];
  /** Live stock market prices for valuation recomputation */
  stocks: StockSymbol[];
  /** Callback to inspect symbol on analytical chart */
  onSelectSymbol: (symbol: string) => void;
  /** Callback to launch trade modal for holding */
  onOpenTrade: (symbol: string) => void;
  /** Callback to add new portfolio holding */
  onAddHolding: (holding: Omit<PortfolioHolding, 'id'>) => void;
  /** Callback to delete holding position */
  onRemoveHolding: (id: string) => void;
}

/**
 * Real-time investment portfolio management panel displaying total asset valuation,
 * invested vs. current capital, sector allocation breakdown, and manual position entry.
 *
 * @param {PortfolioPanelProps} props - Render configuration.
 * @returns {React.ReactElement} Portfolio overview and holdings management dashboard.
 */
export const PortfolioPanel: React.FC<PortfolioPanelProps> = ({
  holdings,
  stocks,
  onSelectSymbol,
  onOpenTrade,
  onAddHolding,
  onRemoveHolding,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedStockSymbol, setSelectedStockSymbol] = useState(stocks[0]?.symbol || 'AAPL');
  const [newQuantity, setNewQuantity] = useState(10);
  const [newBuyPrice, setNewBuyPrice] = useState(200);

  /*
   * ARCHITECTURAL INTENT: Real-Time Mark-To-Market Revaluation
   * Enriches each persistent holding with live prices, current valuation, unrealized P&L,
   * and single-day returns derived from streaming marketEngine ticks.
   */
  const enrichedHoldings = holdings.map((h) => {
    const stock = stocks.find((s) => s.symbol === h.symbol);
    const livePrice = stock ? stock.currentPrice : h.avgBuyPrice;
    const dayChangePercent = stock ? stock.changePercent : 0;
    const investedAmount = h.quantity * h.avgBuyPrice;
    const currentValue = h.quantity * livePrice;
    const pnl = currentValue - investedAmount;
    const pnlPercent = (pnl / investedAmount) * 100;
    const dayGain = stock ? (stock.change * h.quantity) : 0;

    return {
      ...h,
      livePrice,
      currentValue,
      investedAmount,
      pnl,
      pnlPercent,
      dayGain,
      dayChangePercent,
    };
  });

  const totalInvested = enrichedHoldings.reduce((sum, h) => sum + h.investedAmount, 0);
  const totalCurrentValue = enrichedHoldings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalPnl = totalCurrentValue - totalInvested;
  const totalPnlPercent = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;
  const totalDayGain = enrichedHoldings.reduce((sum, h) => sum + h.dayGain, 0);

  // Sector diversification breakdown
  const sectorAllocations: { [key: string]: number } = {};
  enrichedHoldings.forEach((h) => {
    sectorAllocations[h.sector] = (sectorAllocations[h.sector] || 0) + h.currentValue;
  });

  const sectorList = Object.entries(sectorAllocations).map(([sector, val]) => ({
    sector,
    value: val,
    percent: totalCurrentValue > 0 ? (val / totalCurrentValue) * 100 : 0,
  })).sort((a, b) => b.value - a.value);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const stock = stocks.find((s) => s.symbol === selectedStockSymbol);
    if (!stock) return;

    onAddHolding({
      symbol: stock.symbol,
      name: stock.name,
      quantity: Number(newQuantity),
      avgBuyPrice: Number(newBuyPrice),
      sector: stock.sector,
    });
    setShowAddForm(false);
  };

  const isTotalPositive = totalPnl >= 0;
  const isDayPositive = totalDayGain >= 0;

  const handleExportCSV = () => {
    const rows: string[] = [];
    
    // Section 1: Portfolio Holdings
    rows.push('--- PORTFOLIO HOLDINGS ---');
    rows.push('Symbol,Name,Exchange,Sector,Quantity,Avg Buy Price (INR),Live Price (INR),Invested Amount (INR),Current Value (INR),PnL (INR),PnL (%)');
    
    enrichedHoldings.forEach((h) => {
      rows.push(
        `"${h.symbol}","${h.name}","${h.exchange || 'NSE'}","${h.sector}",${h.quantity},${h.avgBuyPrice.toFixed(2)},${h.livePrice.toFixed(2)},${h.investedAmount.toFixed(2)},${h.currentValue.toFixed(2)},${h.pnl.toFixed(2)},${h.pnlPercent.toFixed(2)}%`
      );
    });

    rows.push('');
    // Section 2: Intraday Trading History
    rows.push('--- INTRADAY TRADING HISTORY ---');
    rows.push('Trade ID,Symbol,Type,Quantity,Entry Price (INR),Exit Price (INR),Target Profit (INR),Stop Loss (INR),PnL (INR),Status,Exit Reason,Entry Time,Exit Time');

    const trades = marketEngine.getTrades();
    trades.forEach((t) => {
      const exitPrice = t.exitPrice ? t.exitPrice.toFixed(2) : 'N/A';
      const exitReason = t.exitReason ? `"${t.exitReason}"` : 'N/A';
      const exitTime = t.exitTime ? new Date(t.exitTime).toLocaleString() : 'N/A';
      rows.push(
        `"${t.id}","${t.symbol}","${t.type}",${t.quantity},${t.entryPrice.toFixed(2)},${exitPrice},${t.targetProfitAmount.toFixed(2)},${t.stopLossAmount ? t.stopLossAmount.toFixed(2) : '0.00'},${t.pnl.toFixed(2)},"${t.status}",${exitReason},"${new Date(t.entryTime).toLocaleString()}","${exitTime}"`
      );
    });

    const blob = new Blob([rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `portfolio_trading_history_${Date.now()}.csv`);
    link.click();
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Portfolio Header & Summary */}
      <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-400" />
              <span>Investment Portfolio</span>
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold">
              LIVE VALUATION
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tracks total returns, intraday day-gains, and sector exposure in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Export CSV Button */}
          <button
            id="btn-export-portfolio-csv"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-semibold px-3 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
            title="Export portfolio holdings and trading history to CSV"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {/* Add / Cancel Holding Button with + and - icon switch */}
          <button
            id="btn-toggle-add-holding"
            onClick={() => setShowAddForm(!showAddForm)}
            className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition-all cursor-pointer ${
              showAddForm
                ? 'bg-rose-950/80 text-rose-300 border border-rose-800/80 hover:bg-rose-900/80'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {showAddForm ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            <span>{showAddForm ? 'Cancel' : 'Add Holding'}</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4 sm:p-5 border-b border-slate-800/80 bg-slate-950/40">
        {/* Total Current Value */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Current Portfolio Value
          </span>
          <div className="font-mono text-xl sm:text-2xl font-bold text-white mt-1">
            ₹{totalCurrentValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Across {holdings.length} active assets (BSE, NSE, MCX)
          </span>
        </div>

        {/* Total Return (Unrealized P&L) */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Total P&L (All-Time)
          </span>
          <div
            className={`font-mono text-xl sm:text-2xl font-bold mt-1 flex items-center gap-1 ${
              isTotalPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isTotalPositive ? '+' : ''}
            ₹{totalPnl.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span
            className={`text-[11px] font-semibold font-mono ${
              isTotalPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isTotalPositive ? '+' : ''}{totalPnlPercent.toFixed(2)}% return
          </span>
        </div>

        {/* Today's Day Gain */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Today's Day Gain
          </span>
          <div
            className={`font-mono text-xl sm:text-2xl font-bold mt-1 flex items-center gap-1 ${
              isDayPositive ? 'text-emerald-400' : 'text-rose-400'
            }`}
          >
            {isDayPositive ? (
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-rose-400" />
            )}
            {isDayPositive ? '+' : ''}
            ₹{totalDayGain.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Real-time market session
          </span>
        </div>

        {/* Total Cost Invested */}
        <div className="bg-slate-950/70 border border-slate-800/80 p-3.5 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            Total Invested Capital
          </span>
          <div className="font-mono text-xl sm:text-2xl font-bold text-slate-200 mt-1">
            ₹{totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[11px] text-slate-500 mt-0.5 block">
            Cost basis
          </span>
        </div>
      </div>

      {/* ADD HOLDING COLLAPSIBLE FORM */}
      {showAddForm && (
        <form
          onSubmit={handleFormSubmit}
          className="p-4 sm:p-5 bg-slate-950/90 border-b border-slate-800 grid grid-cols-1 sm:grid-cols-4 gap-4 items-end"
        >
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
              Select Stock (Search Ticker or Name)
            </label>
            <SymbolSearchCombobox
              stocks={stocks}
              selectedSymbol={selectedStockSymbol}
              onSelectSymbol={(sym) => {
                setSelectedStockSymbol(sym);
                const s = stocks.find((st) => st.symbol === sym);
                if (s) setNewBuyPrice(s.currentPrice);
              }}
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
              Shares / Lots (Qty)
            </label>
            <input
              type="number"
              min="1"
              value={newQuantity}
              onChange={(e) => setNewQuantity(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
              Average Buy Price (₹)
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={newBuyPrice}
              onChange={(e) => setNewBuyPrice(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/20"
            >
              Add to Portfolio
            </button>
          </div>
        </form>
      )}

      {/* Sector Allocation Breakdown Bar */}
      <div className="px-4 sm:px-5 py-3 border-b border-slate-800 bg-slate-950/50">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
            <PieChartIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sector Diversification</span>
          </span>
          <span className="text-slate-500 text-[11px]">100% Allocated</span>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
          {sectorList.map((sec, idx) => {
            const colors = [
              'bg-indigo-500',
              'bg-cyan-500',
              'bg-emerald-500',
              'bg-amber-500',
              'bg-rose-500',
              'bg-purple-500',
            ];
            const color = colors[idx % colors.length];
            return (
              <div
                key={sec.sector}
                style={{ width: `${sec.percent}%` }}
                className={`${color} h-full transition-all duration-300 relative group`}
                title={`${sec.sector}: ${sec.percent.toFixed(1)}% ($${sec.value.toFixed(0)})`}
              />
            );
          })}
        </div>

        {/* Sector Legend */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2.5 text-[11px]">
          {sectorList.map((sec, idx) => {
            const colors = [
              'bg-indigo-500',
              'bg-cyan-500',
              'bg-emerald-500',
              'bg-amber-500',
              'bg-rose-500',
              'bg-purple-500',
            ];
            const color = colors[idx % colors.length];
            return (
              <div key={sec.sector} className="flex items-center gap-1.5 text-slate-400">
                <span className={`w-2 h-2 rounded-full ${color}`} />
                <span className="text-slate-300 font-medium">{sec.sector}</span>
                <span className="font-mono text-slate-500">({sec.percent.toFixed(1)}%)</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Holdings Table */}
      <div className="p-4 sm:p-5 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[11px]">
              <th className="pb-3 pr-4">Asset / Sector</th>
              <th className="pb-3 px-3">Shares</th>
              <th className="pb-3 px-3">Avg Price</th>
              <th className="pb-3 px-3">Live Price</th>
              <th className="pb-3 px-3">Current Value</th>
              <th className="pb-3 px-3">Day Gain</th>
              <th className="pb-3 px-3">Total P&L</th>
              <th className="pb-3 pl-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {enrichedHoldings.map((h) => {
              const isPnlPositive = h.pnl >= 0;
              const isDayGainPositive = h.dayGain >= 0;

              return (
                <tr key={h.id} className="hover:bg-slate-950/40 transition-colors group">
                  {/* Symbol & Sector */}
                  <td className="py-3.5 pr-4 font-sans">
                    <button
                      onClick={() => onSelectSymbol(h.symbol)}
                      className="text-left group-hover:text-indigo-400 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-white text-sm">{h.symbol}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-[11px] text-slate-400 block font-normal">
                        {h.name} • {h.sector}
                      </span>
                    </button>
                  </td>

                  {/* Quantity */}
                  <td className="py-3.5 px-3 text-slate-200 font-semibold">
                    {h.quantity}
                  </td>

                  {/* Avg Buy Price */}
                  <td className="py-3.5 px-3 text-slate-400">
                    ₹{h.avgBuyPrice.toFixed(2)}
                  </td>

                  {/* Live Price */}
                  <td className="py-3.5 px-3 font-bold text-white">
                    ₹{h.livePrice.toFixed(2)}
                  </td>

                  {/* Current Value */}
                  <td className="py-3.5 px-3 text-slate-100 font-semibold">
                    ₹{h.currentValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>

                  {/* Day Gain */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`font-semibold ${
                        isDayGainPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isDayGainPositive ? '+' : ''}₹{h.dayGain.toFixed(2)}
                    </span>
                    <span className="block text-[10px] text-slate-500">
                      ({isDayGainPositive ? '+' : ''}{h.dayChangePercent.toFixed(2)}%)
                    </span>
                  </td>

                  {/* Total PnL */}
                  <td className="py-3.5 px-3">
                    <span
                      className={`font-bold ${
                        isPnlPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isPnlPositive ? '+' : ''}₹{h.pnl.toFixed(2)}
                    </span>
                    <span
                      className={`block text-[10px] font-semibold ${
                        isPnlPositive ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      ({isPnlPositive ? '+' : ''}{h.pnlPercent.toFixed(2)}%)
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 pl-3 text-right font-sans">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onOpenTrade(h.symbol)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-medium transition-all"
                        title="Open Intraday Trade with Auto-Exit"
                      >
                        Trade
                      </button>
                      <button
                        onClick={() => onRemoveHolding(h.id)}
                        className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors"
                        title="Remove holding"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
