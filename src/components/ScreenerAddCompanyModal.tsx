import React, { useState } from 'react';
import { StockSymbol } from '../types';
import { X, Plus, Search, Check } from 'lucide-react';

interface ScreenerAddCompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableStocks: StockSymbol[];
  activeSymbols: string[];
  onAddSymbol: (symbol: string) => void;
}

export const ScreenerAddCompanyModal: React.FC<ScreenerAddCompanyModalProps> = ({
  isOpen,
  onClose,
  availableStocks,
  activeSymbols,
  onAddSymbol,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [exchangeFilter, setExchangeFilter] = useState<'ALL' | 'BSE' | 'NSE' | 'MCX'>('ALL');

  if (!isOpen) return null;

  const filtered = availableStocks.filter((st) => {
    const matchesExchange = exchangeFilter === 'ALL' || st.exchange === exchangeFilter;
    const matchesSearch =
      st.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      st.sector.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesExchange && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        style={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)' }}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-indigo-400" />
              Add Company to Screener
            </h2>
            <p className="text-xs text-slate-400">
              Include any listed stock from BSE, NSE, or MCX into your active screener
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Exchange Filter */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/50 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search symbol, company name, or sector..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(['ALL', 'BSE', 'NSE', 'MCX'] as const).map((exch) => (
              <button
                key={exch}
                onClick={() => setExchangeFilter(exch)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  exchangeFilter === exch
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {exch}
              </button>
            ))}
          </div>
        </div>

        {/* Stock List */}
        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-500">
              No matching companies found
            </div>
          ) : (
            filtered.map((stock) => {
              const isAlreadyAdded = activeSymbols.includes(stock.symbol);
              return (
                <div
                  key={stock.symbol}
                  className="p-3 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/40 flex items-center justify-between transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{stock.symbol}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold ${
                          stock.exchange === 'BSE'
                            ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                            : stock.exchange === 'NSE'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        }`}
                      >
                        {stock.exchange}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5">
                      {stock.name} • {stock.sector}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-mono text-xs font-semibold text-white">
                      ₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>

                    {isAlreadyAdded ? (
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Added
                      </span>
                    ) : (
                      <button
                        onClick={() => onAddSymbol(stock.symbol)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" /> Add
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
