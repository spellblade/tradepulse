import React, { useState, useRef, useEffect } from 'react';
import { StockSymbol, MarketExchange } from '../types';
import { TrendingUp, TrendingDown, Settings } from 'lucide-react';
import { TickerManageModal } from './TickerManageModal';
import { isMarketOpen } from '../services/exchangeSchedule';

/**
 * Props for the continuous horizontal ticker tape strip.
 */
interface TickerStripProps {
  /** All stock entities tracked by the simulation engine */
  stocks: StockSymbol[];
  /** Currently active stock symbol shown in chart */
  selectedSymbol: string;
  /** Callback when user clicks a ticker card */
  onSelectSymbol: (symbol: string) => void;
  /** Current exchange tab filter ('ALL' | 'BSE' | 'NSE' | 'MCX') */
  selectedMarket: 'ALL' | MarketExchange;
  /** Callback to switch active exchange filter */
  onSelectMarket: (market: 'ALL' | MarketExchange) => void;
  /** List of symbol tickers configured to display in the ticker tape */
  tickerSymbols: string[];
  /** Callback when user updates ticker configuration in modal */
  onUpdateTickerSymbols: (symbols: string[]) => void;
}

/**
 * Continuous smooth-scrolling ticker tape banner displaying live stock prices,
 * mini trend arrows, exchange badges, and rapid chart selection controls.
 *
 * @param {TickerStripProps} props - Render properties.
 * @returns {React.ReactElement} Animated horizontal ticker tape.
 */
export const TickerStrip: React.FC<TickerStripProps> = ({
  stocks,
  selectedSymbol,
  onSelectSymbol,
  selectedMarket,
  onSelectMarket,
  tickerSymbols,
  onUpdateTickerSymbols,
}) => {
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Filter stocks that are enabled in user's ticker
  const activeTickerStocks = tickerSymbols
    .map((sym) => stocks.find((s) => s.symbol === sym))
    .filter((s): s is StockSymbol => Boolean(s));

  // Apply market filter (ALL, BSE, NSE, MCX)
  const displayStocks = selectedMarket === 'ALL'
    ? activeTickerStocks
    : activeTickerStocks.filter((s) => s.exchange === selectedMarket);

  const getExchangeBadgeStyle = (exchange: MarketExchange) => {
    switch (exchange) {
      case 'BSE':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'NSE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'MCX':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Duplicate items for continuous looping
  const marqueeItems = displayStocks.length > 0 ? [...displayStocks, ...displayStocks, ...displayStocks] : [];

  // Smooth auto-scroll loop via requestAnimationFrame
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollSpeed = 1.5; // Pixels per frame (doubled for brisk continuous gliding)

    const step = () => {
      if (!isHovered && container) {
        container.scrollLeft += scrollSpeed;

        // Reset scroll seamlessly when reaching 1/3 of the duplicated content
        const maxScroll = container.scrollWidth / 3;
        if (container.scrollLeft >= maxScroll) {
          container.scrollLeft -= maxScroll;
        }
      }
      animationFrameRef.current = requestAnimationFrame(step);
    };

    animationFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isHovered, displayStocks.length]);

  return (
    <>
      <div className="bg-slate-900/95 border-b border-slate-800 px-3 sm:px-4 py-2 shadow-inner overflow-hidden relative">
        <div className="max-w-7xl mx-auto flex items-center gap-2.5">
          {/* Left Controls: 3-Market Switcher & ONLY Gear Icon */}
          <div className="flex items-center gap-1.5 shrink-0 z-10 bg-slate-900/95 pr-2 border-r border-slate-800/80">
            {/* Market Filter Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
              {(['ALL', 'BSE', 'NSE', 'MCX'] as const).map((mkt) => {
                const isActive = selectedMarket === mkt;
                const marketOpen = mkt === 'ALL' ? undefined : isMarketOpen(mkt);
                return (
                  <button
                    key={mkt}
                    id={`market-filter-${mkt.toLowerCase()}`}
                    onClick={() => onSelectMarket(mkt)}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? mkt === 'BSE'
                          ? 'bg-blue-600 text-white shadow-sm'
                          : mkt === 'NSE'
                          ? 'bg-amber-600 text-white shadow-sm'
                          : mkt === 'MCX'
                          ? 'bg-emerald-600 text-white shadow-sm'
                          : 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                  >
                    <span>{mkt === 'ALL' ? 'All' : mkt}</span>
                    {marketOpen !== undefined && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          marketOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                        }`}
                        title={marketOpen ? `${mkt} is Open` : `${mkt} is Closed`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            {/* ONLY Gear Icon Button (Reveals Box) */}
            <button
              onClick={() => setIsManageModalOpen(true)}
              id="btn-ticker-settings"
              className="p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all shadow-sm group cursor-pointer"
              title="Customize Ticker Companies (Up to 20)"
            >
              <Settings className="w-4 h-4 text-indigo-400 group-hover:rotate-90 transition-transform duration-300" />
            </button>
          </div>

          {/* Continuous Moving Ticker Track (Hover pauses & active horizontal scrolling enabled) */}
          <div
            ref={scrollContainerRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onTouchStart={() => setIsHovered(true)}
            onTouchEnd={() => setIsHovered(false)}
            className="flex-1 overflow-x-auto no-scrollbar scroll-smooth flex items-center gap-2.5 cursor-grab active:cursor-grabbing select-none"
            style={{
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {displayStocks.length === 0 ? (
              <div className="py-2 text-xs text-slate-400 italic">
                No active companies for {selectedMarket}. Click the gear icon to add companies.
              </div>
            ) : (
              marqueeItems.map((stock, index) => {
                const isSelected = stock.symbol === selectedSymbol;
                const isPositive = stock.change >= 0;

                return (
                  <button
                    key={`${stock.symbol}-${index}`}
                    onClick={() => onSelectSymbol(stock.symbol)}
                    /* EXACT FIXED DIMENSIONS: Width 210px, Height 54px - NEVER resizes on value fluctuations */
                    className={`w-[210px] min-w-[210px] max-w-[210px] h-[54px] px-3 py-1.5 rounded-xl border text-left transition-all shrink-0 select-none flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border-indigo-500 shadow-md shadow-indigo-500/10 text-white ring-1 ring-indigo-500/40'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Top Row: Symbol & Exchange Badge */}
                    <div className="flex items-center justify-between w-full">
                      <span className="font-bold text-xs tracking-tight text-white truncate max-w-[120px]">
                        {stock.symbol}
                      </span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded border font-semibold tracking-wide shrink-0 ${getExchangeBadgeStyle(
                          stock.exchange
                        )}`}
                      >
                        {stock.exchange}
                      </span>
                    </div>

                    {/* Bottom Row: Price & Percentage Change */}
                    <div className="flex items-center justify-between font-mono text-xs w-full">
                      <span className="font-semibold text-slate-100 tabular-nums truncate max-w-[110px]">
                        ₹{stock.currentPrice.toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      <span
                        className={`flex items-center text-[11px] font-medium tabular-nums shrink-0 justify-end ${
                          isPositive ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-3 h-3 inline mr-0.5 shrink-0" />
                        ) : (
                          <TrendingDown className="w-3 h-3 inline mr-0.5 shrink-0" />
                        )}
                        {isPositive ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Ticker Management Modal */}
      <TickerManageModal
        isOpen={isManageModalOpen}
        onClose={() => setIsManageModalOpen(false)}
        tickerSymbols={tickerSymbols}
        stocks={stocks}
        onUpdateTickerSymbols={onUpdateTickerSymbols}
        onSelectSymbol={onSelectSymbol}
      />
    </>
  );
};
