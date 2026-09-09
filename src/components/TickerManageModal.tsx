import React, { useState } from 'react';
import { MarketExchange, StockSymbol } from '../types';
import { LISTED_COMPANIES_DIRECTORY } from '../data/listedCompanies';
import { marketEngine } from '../services/marketEngine';
import { X, Search, Plus, Trash2, Check, AlertCircle, Sparkles, Filter } from 'lucide-react';

interface TickerManageModalProps {
  isOpen: boolean;
  onClose: () => void;
  tickerSymbols: string[];
  stocks: StockSymbol[];
  onUpdateTickerSymbols: (symbols: string[]) => void;
  onSelectSymbol: (symbol: string) => void;
}

const MAX_TICKER_COMPANIES = 20;

export const TickerManageModal: React.FC<TickerManageModalProps> = ({
  isOpen,
  onClose,
  tickerSymbols,
  stocks,
  onUpdateTickerSymbols,
  onSelectSymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExchange, setSelectedExchange] = useState<'ALL' | MarketExchange>('ALL');

  if (!isOpen) return null;

  const isFull = tickerSymbols.length >= MAX_TICKER_COMPANIES;

  // Filter listed directory based on search term & exchange
  const filteredDirectory = LISTED_COMPANIES_DIRECTORY.filter((item) => {
    const matchesExchange = selectedExchange === 'ALL' || item.exchange === selectedExchange;
    const matchesSearch =
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sector.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesExchange && matchesSearch;
  });

  const handleAddSymbol = (symbol: string) => {
    if (isFull) return;
    if (tickerSymbols.includes(symbol)) return;

    // Ensure stock is active in the simulation engine
    marketEngine.ensureStockActive(symbol);

    const updated = [...tickerSymbols, symbol];
    onUpdateTickerSymbols(updated);
    onSelectSymbol(symbol);
  };

  const handleRemoveSymbol = (symbol: string) => {
    // Keep at least 1 symbol
    if (tickerSymbols.length <= 1) return;
    const updated = tickerSymbols.filter((s) => s !== symbol);
    onUpdateTickerSymbols(updated);
  };

  const handleResetDefaults = () => {
    const defaultSymbols = [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATAMOTORS', 'ICICIBANK',
      'ITC', 'SBIN', 'LT', 'TITAN', 'ASIANPAINT',
      'GOLD', 'SILVER', 'CRUDEOIL'
    ];
    defaultSymbols.forEach((s) => marketEngine.ensureStockActive(s));
    onUpdateTickerSymbols(defaultSymbols);
  };

  const getExchangeBadgeStyle = (exchange: MarketExchange) => {
    switch (exchange) {
      case 'BSE':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'NSE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MCX':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                Customize Moving Ticker
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${
                  isFull
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                }`}
              >
                {tickerSymbols.length} / {MAX_TICKER_COMPANIES} Companies
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Select up to 20 listed companies & commodities from BSE, NSE, and MCX to show in the live ticker
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Limit Warning Banner if >= 20 */}
        {isFull && (
          <div className="bg-rose-950/40 border-b border-rose-800/40 px-4 py-2.5 flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Limit Reached:</strong> The ticker has reached the maximum of 20 companies. Remove a company below to add another.
            </span>
          </div>
        )}

        {/* Currently Active in Ticker Pills */}
        <div className="p-4 bg-slate-950/70 border-b border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase text-slate-400">
              Active In Ticker ({tickerSymbols.length})
            </span>
            <button
              onClick={handleResetDefaults}
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Reset to Defaults
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto pr-1">
            {tickerSymbols.map((symbol) => {
              const stock = stocks.find((s) => s.symbol === symbol);
              const template = LISTED_COMPANIES_DIRECTORY.find((t) => t.symbol === symbol);
              const exchange = stock?.exchange || template?.exchange || 'NSE';

              return (
                <div
                  key={symbol}
                  className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-semibold text-white group hover:border-slate-600 transition-all"
                >
                  <span>{symbol}</span>
                  <span className={`text-[9px] px-1 py-0.2 rounded border font-semibold ${getExchangeBadgeStyle(exchange)}`}>
                    {exchange}
                  </span>
                  <button
                    onClick={() => handleRemoveSymbol(symbol)}
                    disabled={tickerSymbols.length <= 1}
                    className="p-0.5 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 disabled:opacity-30 transition-colors ml-0.5"
                    title={tickerSymbols.length <= 1 ? "At least 1 stock required" : "Remove from ticker"}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Search & Exchange Filter */}
        <div className="p-3.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search company by name, symbol, or sector (e.g. Wipro, Gold, Tata)..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold">
            {(['ALL', 'BSE', 'NSE', 'MCX'] as const).map((mkt) => (
              <button
                key={mkt}
                onClick={() => setSelectedExchange(mkt)}
                className={`px-2.5 py-1 rounded-lg transition-all ${
                  selectedExchange === mkt
                    ? mkt === 'BSE'
                      ? 'bg-blue-600 text-white'
                      : mkt === 'NSE'
                      ? 'bg-amber-600 text-white'
                      : mkt === 'MCX'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {mkt}
              </button>
            ))}
          </div>
        </div>

        {/* Listed Directory Table / List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60 p-2 sm:p-3">
          {filteredDirectory.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No companies found matching "{searchTerm}" on {selectedExchange}
            </div>
          ) : (
            filteredDirectory.map((company) => {
              const isAlreadyAdded = tickerSymbols.includes(company.symbol);
              const liveStock = stocks.find((s) => s.symbol === company.symbol);
              const price = liveStock ? liveStock.currentPrice : company.basePrice;

              return (
                <div
                  key={company.symbol}
                  className="flex items-center justify-between p-2.5 hover:bg-slate-950/40 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center font-bold text-xs text-slate-200">
                      {company.symbol.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{company.symbol}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded border font-semibold ${getExchangeBadgeStyle(company.exchange)}`}>
                          {company.exchange}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        {company.name} • <span className="text-slate-500">{company.sector}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right font-mono text-xs hidden sm:block">
                      <span className="font-bold text-white">
                        ₹{price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      {company.unit && <span className="text-[10px] text-slate-400 ml-1">{company.unit}</span>}
                    </div>

                    {isAlreadyAdded ? (
                      <button
                        onClick={() => handleRemoveSymbol(company.symbol)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 transition-all group"
                      >
                        <Check className="w-3.5 h-3.5 group-hover:hidden" />
                        <Trash2 className="w-3.5 h-3.5 hidden group-hover:inline" />
                        <span className="group-hover:hidden">Added</span>
                        <span className="hidden group-hover:inline">Remove</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleAddSymbol(company.symbol)}
                        disabled={isFull}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                        title={isFull ? 'Max 20 companies allowed' : 'Add to live ticker'}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            {tickerSymbols.length} of {MAX_TICKER_COMPANIES} active slots used
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition-all shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
