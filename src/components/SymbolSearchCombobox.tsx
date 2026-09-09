import React, { useState, useRef, useEffect } from 'react';
import { StockSymbol, MarketExchange } from '../types';
import { LISTED_COMPANIES_DIRECTORY } from '../data/listedCompanies';
import { marketEngine } from '../services/marketEngine';
import { Search, ChevronDown, Check, Building2 } from 'lucide-react';

interface SymbolSearchComboboxProps {
  selectedSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  stocks: StockSymbol[];
  className?: string;
  label?: string;
}

export const SymbolSearchCombobox: React.FC<SymbolSearchComboboxProps> = ({
  selectedSymbol,
  onSelectSymbol,
  stocks,
  className = '',
  label,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Find currently selected stock
  const currentStock = stocks.find((s) => s.symbol.toUpperCase() === selectedSymbol.toUpperCase());
  const currentTemplate = LISTED_COMPANIES_DIRECTORY.find((t) => t.symbol.toUpperCase() === selectedSymbol.toUpperCase());

  const displayName = currentStock?.name || currentTemplate?.name || selectedSymbol;
  const exchange = currentStock?.exchange || currentTemplate?.exchange || 'NSE';
  const price = currentStock?.currentPrice || currentTemplate?.basePrice || 0;

  // Search across both active stocks and listed companies directory
  const query = searchQuery.trim().toLowerCase();
  const searchResults = LISTED_COMPANIES_DIRECTORY.filter((item) => {
    if (!query) return true;
    return (
      item.symbol.toLowerCase().includes(query) ||
      item.name.toLowerCase().includes(query) ||
      item.sector.toLowerCase().includes(query) ||
      item.exchange.toLowerCase().includes(query)
    );
  });

  const handleSelect = (symbol: string) => {
    marketEngine.ensureStockActive(symbol);
    onSelectSymbol(symbol);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getExchangeBadgeStyle = (ex: MarketExchange) => {
    switch (ex) {
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
    <div className={`relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
          {label}
        </label>
      )}

      {/* Trigger Button / Display */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
          }
        }}
        className="w-full bg-slate-900 border border-slate-700 hover:border-slate-600 rounded-xl px-3 py-2 text-xs font-semibold text-white flex items-center justify-between gap-2 transition-colors text-left focus:outline-none focus:border-indigo-500"
      >
        <div className="flex items-center gap-1.5 truncate">
          <span className={`text-[10px] px-1.5 py-0.2 rounded border font-bold shrink-0 ${getExchangeBadgeStyle(exchange)}`}>
            {exchange}
          </span>
          <span className="font-bold text-white shrink-0">{selectedSymbol}</span>
          <span className="text-slate-400 font-normal truncate hidden sm:inline">— {displayName}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="font-mono text-emerald-400 text-xs font-bold">
            ₹{price.toFixed(2)}
          </span>
          <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fadeIn">
          {/* Search Input Bar */}
          <div className="p-2 border-b border-slate-800 bg-slate-950 flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1.5" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Type to search symbol or company (e.g. Reliance, Silver, Tata)..."
              className="w-full bg-transparent text-xs text-white placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {/* Search Results List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60 p-1">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                No company found matching "{searchQuery}"
              </div>
            ) : (
              searchResults.map((item) => {
                const isSelected = item.symbol.toUpperCase() === selectedSymbol.toUpperCase();
                const active = stocks.find((s) => s.symbol === item.symbol);
                const itemPrice = active ? active.currentPrice : item.basePrice;

                return (
                  <button
                    key={item.symbol}
                    type="button"
                    onClick={() => handleSelect(item.symbol)}
                    className={`w-full p-2 rounded-xl text-left flex items-center justify-between text-xs transition-colors ${
                      isSelected
                        ? 'bg-indigo-600/20 text-white'
                        : 'hover:bg-slate-800/70 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className={`text-[9px] px-1.5 py-0.2 rounded border font-bold shrink-0 ${getExchangeBadgeStyle(item.exchange)}`}>
                        {item.exchange}
                      </span>
                      <div className="truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-white">{item.symbol}</span>
                          <span className="text-[11px] text-slate-400 truncate">{item.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 block truncate">{item.sector}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 font-mono">
                      <span className="text-emerald-400 font-bold">
                        ₹{itemPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
