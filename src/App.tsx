import React, { useState } from 'react';
import { useMarketData } from './hooks/useMarketData';
import { Header } from './components/Header';
import { TickerStrip } from './components/TickerStrip';
import { AnalyticalChart } from './components/AnalyticalChart';
import { IntradayTradingPanel } from './components/IntradayTradingPanel';
import { PortfolioPanel } from './components/PortfolioPanel';
import { NewOrderModal } from './components/NewOrderModal';
import { PortfolioHolding, MarketExchange } from './types';
import { INITIAL_HOLDINGS } from './data/initialData';
import { 
  BarChart3, 
  Briefcase, 
  Table, 
  TrendingUp, 
  TrendingDown, 
  ShieldCheck, 
  Gauge, 
  Filter,
  Plus,
  Trash2,
  SlidersHorizontal
} from 'lucide-react';
import { MiniSparkline } from './components/MiniSparkline';
import { ScreenerAddCompanyModal } from './components/ScreenerAddCompanyModal';

/**
 * Primary root layout and navigation coordinator for TradePulse.
 * Connects the real-time simulation engine to presentation views:
 * Trading (Charts + Intraday Terminal), Portfolio Management, and Exchange Screener.
 *
 * @returns {React.ReactElement} Root application layout.
 */
export default function App() {
  const {
    stocks,
    trades,
    alerts,
    indices,
    fps,
    batchCount,
    isRunning,
    speed,
  } = useMarketData();

  // Active state
  const [selectedSymbol, setSelectedSymbol] = useState<string>('RELIANCE');
  const [selectedMarket, setSelectedMarket] = useState<'ALL' | MarketExchange>('ALL');
  const [activeMainTab, setActiveMainTab] = useState<'TRADING' | 'PORTFOLIO' | 'SCREENER'>('TRADING');
  const [isAlertsOpen, setIsAlertsOpen] = useState<boolean>(false);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState<boolean>(false);
  const [orderInitialSymbol, setOrderInitialSymbol] = useState<string>('RELIANCE');

  /*
   * ARCHITECTURAL INTENT: LocalStorage Client Persistence
   * Loads user-customized ticker strip symbols, screener tracking lists, and portfolio
   * holdings from browser localStorage with backward compatibility fallbacks and seed defaults.
   */
  const [tickerSymbols, setTickerSymbols] = useState<string[]>(() => {
    const saved = localStorage.getItem('tradepulse_ticker_symbols') || localStorage.getItem('apex_pulse_ticker_symbols');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 20);
        }
      } catch (e) {
        // Fallback
      }
    }
    return [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATAMOTORS', 'ICICIBANK',
      'ITC', 'SBIN', 'LT', 'TITAN', 'ASIANPAINT',
      'GOLD', 'SILVER', 'CRUDEOIL'
    ];
  });

  const handleUpdateTickerSymbols = (newSymbols: string[]) => {
    const capped = newSymbols.slice(0, 20);
    setTickerSymbols(capped);
    localStorage.setItem('tradepulse_ticker_symbols', JSON.stringify(capped));
  };

  // Portfolio holdings state
  const [holdings, setHoldings] = useState<PortfolioHolding[]>(() => {
    const saved = localStorage.getItem('tradepulse_holdings') || localStorage.getItem('apex_pulse_holdings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_HOLDINGS;
      }
    }
    return INITIAL_HOLDINGS;
  });

  // Screener symbols customizable list
  const [isAddScreenerModalOpen, setIsAddScreenerModalOpen] = useState(false);
  const [screenerSymbols, setScreenerSymbols] = useState<string[]>(() => {
    const saved = localStorage.getItem('tradepulse_screener_symbols') || localStorage.getItem('apex_pulse_screener_symbols');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {}
    }
    return [
      'RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'TATAMOTORS', 'ICICIBANK',
      'ITC', 'SBIN', 'LT', 'TITAN', 'ASIANPAINT', 'BHARTIARTL', 'MARUTI',
      'SUNPHARMA', 'WIPRO', 'BAJFINANCE', 'GOLD', 'SILVER', 'CRUDEOIL', 'COPPER'
    ];
  });

  const handleAddScreenerSymbol = (symbol: string) => {
    if (!screenerSymbols.includes(symbol)) {
      const updated = [...screenerSymbols, symbol];
      setScreenerSymbols(updated);
      localStorage.setItem('tradepulse_screener_symbols', JSON.stringify(updated));
    }
  };

  const handleRemoveScreenerSymbol = (symbol: string) => {
    const updated = screenerSymbols.filter((s) => s !== symbol);
    setScreenerSymbols(updated);
    localStorage.setItem('tradepulse_screener_symbols', JSON.stringify(updated));
  };

  const saveHoldings = (newHoldings: PortfolioHolding[]) => {
    setHoldings(newHoldings);
    localStorage.setItem('tradepulse_holdings', JSON.stringify(newHoldings));
  };

  const handleAddHolding = (newHolding: Omit<PortfolioHolding, 'id'>) => {
    const id = `h-${Date.now()}`;
    const updated = [...holdings, { ...newHolding, id }];
    saveHoldings(updated);
  };

  const handleRemoveHolding = (id: string) => {
    const updated = holdings.filter((h) => h.id !== id);
    saveHoldings(updated);
  };

  // Find currently selected stock for analytical charts
  const selectedStock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0] || {
    id: 'RELIANCE',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    sector: 'Energy & Retail',
    exchange: 'NSE' as MarketExchange,
    currentPrice: 2940.50,
    previousClose: 2915.00,
    change: 25.50,
    changePercent: 0.87,
    dayHigh: 2962.00,
    dayLow: 2910.00,
    volume: 8450200,
    avgVolume: 7900000,
    marketCap: '₹19.89 Lakh Cr',
    peRatio: 28.4,
    volatilityIndex: 0.42,
    history: [],
  };

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  const handleOpenTradeForSymbol = (sym: string) => {
    setOrderInitialSymbol(sym);
    setIsNewOrderOpen(true);
  };

  const allScreenerStocks = stocks.filter((s) => screenerSymbols.includes(s.symbol));
  const screenerStocks = selectedMarket === 'ALL'
    ? allScreenerStocks
    : allScreenerStocks.filter((s) => s.exchange === selectedMarket);

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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Application Header */}
      <Header
        indices={indices}
        fps={fps}
        batchCount={batchCount}
        isRunning={isRunning}
        speed={speed}
        unreadAlertsCount={unreadAlertsCount}
        alerts={alerts}
        isAlertsOpen={isAlertsOpen}
        onToggleAlerts={() => setIsAlertsOpen(!isAlertsOpen)}
        onCloseAlerts={() => setIsAlertsOpen(false)}
        onOpenNewTrade={() => handleOpenTradeForSymbol(selectedSymbol)}
        stocks={stocks}
      />

      {/* Real-time Ticker Strip with 3-Market Filter (BSE, NSE, MCX) */}
      <TickerStrip
        stocks={stocks}
        selectedSymbol={selectedSymbol}
        onSelectSymbol={(sym) => setSelectedSymbol(sym)}
        selectedMarket={selectedMarket}
        onSelectMarket={(mkt) => setSelectedMarket(mkt)}
        tickerSymbols={tickerSymbols}
        onUpdateTickerSymbols={handleUpdateTickerSymbols}
      />

      {/* Main App Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 flex-1 flex flex-col space-y-5">
        {/* Navigation Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
            <button
              id="tab-trading"
              onClick={() => setActiveMainTab('TRADING')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeMainTab === 'TRADING'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytical Charts & Intraday</span>
            </button>

            <button
              id="tab-portfolio"
              onClick={() => setActiveMainTab('PORTFOLIO')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeMainTab === 'PORTFOLIO'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Portfolio Tracking</span>
              <span className="px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] font-mono">
                {holdings.length}
              </span>
            </button>

            <button
              id="tab-screener"
              onClick={() => setActiveMainTab('SCREENER')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all ${
                activeMainTab === 'SCREENER'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Table className="w-4 h-4" />
              <span>BSE • NSE • MCX Screener</span>
            </button>
          </div>

          {/* Quick Real-Time Status & Performance Guarantee */}
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-slate-300 font-medium">Auto-Exit Guard:</span>
              <span className="text-emerald-400 font-bold">Active</span>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 font-mono">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              <span>{fps} FPS Execution</span>
            </div>
          </div>
        </div>

        {/* TAB 1: ANALYTICAL CHARTS & INTRADAY TRADING */}
        {activeMainTab === 'TRADING' && (
          <div className="space-y-5">
            {/* Analytical Interactive Chart with Technical Indicators */}
            <AnalyticalChart
              stock={selectedStock}
              onOpenTradeForSymbol={handleOpenTradeForSymbol}
            />

            {/* Intraday Trading Panel with Predefined Profit Auto-Exit Engine */}
            <IntradayTradingPanel
              trades={trades}
              stocks={stocks}
              selectedSymbol={selectedSymbol}
            />
          </div>
        )}

        {/* TAB 2: PORTFOLIO TRACKING */}
        {activeMainTab === 'PORTFOLIO' && (
          <PortfolioPanel
            holdings={holdings}
            stocks={stocks}
            onSelectSymbol={(sym) => {
              setSelectedSymbol(sym);
              setActiveMainTab('TRADING');
            }}
            onOpenTrade={handleOpenTradeForSymbol}
            onAddHolding={handleAddHolding}
            onRemoveHolding={handleRemoveHolding}
          />
        )}

        {/* TAB 3: MARKET SCREENER & ALL ASSETS WATCHLIST (BSE, NSE, MCX) */}
        {activeMainTab === 'SCREENER' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Table className="w-5 h-5 text-indigo-400" />
                  <span>3 Markets Screener & Volatility Heatmap</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time price feeds exclusively for BSE, NSE, and MCX (Commodities)
                </p>
              </div>

              {/* Market Filter Switcher and Add Company inside Screener */}
              <div className="flex items-center gap-3">
                <button
                  id="btn-screener-add-company"
                  onClick={() => setIsAddScreenerModalOpen(true)}
                  className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Company</span>
                </button>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  <span className="text-slate-500 pl-2 pr-1 flex items-center">
                    <Filter className="w-3.5 h-3.5" />
                  </span>
                  {(['ALL', 'BSE', 'NSE', 'MCX'] as const).map((mkt) => {
                    const isActive = selectedMarket === mkt;
                    const count = mkt === 'ALL' ? allScreenerStocks.length : allScreenerStocks.filter((s) => s.exchange === mkt).length;
                    return (
                      <button
                        key={mkt}
                        onClick={() => setSelectedMarket(mkt)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
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
                        {mkt} ({count})
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto p-4 sm:p-5">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase font-bold text-[11px] font-sans">
                    <th className="pb-3 pr-4">Market / Asset</th>
                    <th className="pb-3 px-3">Live Price</th>
                    <th className="pb-3 px-3">Trend</th>
                    <th className="pb-3 px-3">24h Change</th>
                    <th className="pb-3 px-3">Day Range</th>
                    <th className="pb-3 px-3">Volume</th>
                    <th className="pb-3 px-3">Market Cap</th>
                    <th className="pb-3 px-3">Volatility</th>
                    <th className="pb-3 pl-3 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {screenerStocks.map((stock) => {
                    const isPositive = stock.change >= 0;
                    const volPercent = (stock.volatilityIndex * 100).toFixed(0);

                    return (
                      <tr key={stock.symbol} className="hover:bg-slate-950/50 transition-colors">
                        <td className="py-3.5 pr-4 font-sans">
                          <button
                            onClick={() => {
                              setSelectedSymbol(stock.symbol);
                              setActiveMainTab('TRADING');
                            }}
                            className="text-left group"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                                {stock.symbol}
                              </span>
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getExchangeBadgeStyle(stock.exchange)}`}>
                                {stock.exchange}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-400 block mt-0.5">
                              {stock.name} • {stock.sector}
                            </span>
                          </button>
                        </td>

                        <td className="py-3.5 px-3 font-bold text-white text-sm">
                          ₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          {stock.unit && <span className="text-[10px] text-slate-400 font-normal ml-1">{stock.unit}</span>}
                        </td>

                        {/* Mini-Trend Sparkline visualization */}
                        <td className="py-3.5 px-3">
                          <MiniSparkline
                            history={stock.history}
                            width={72}
                            height={26}
                            isPositive={isPositive}
                          />
                        </td>

                        <td className="py-3.5 px-3">
                          <span
                            className={`font-semibold flex items-center gap-1 ${
                              isPositive ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {isPositive ? (
                              <TrendingUp className="w-3.5 h-3.5" />
                            ) : (
                              <TrendingDown className="w-3.5 h-3.5" />
                            )}
                            {isPositive ? '+' : ''}₹{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent}%)
                          </span>
                        </td>

                        <td className="py-3.5 px-3 text-slate-400">
                          <span>₹{stock.dayLow.toFixed(2)} - ₹{stock.dayHigh.toFixed(2)}</span>
                        </td>

                        <td className="py-3.5 px-3 text-slate-300">
                          {(stock.volume / 1000000).toFixed(1)}M
                        </td>

                        <td className="py-3.5 px-3 text-slate-300 font-sans">
                          {stock.marketCap}
                        </td>

                        <td className="py-3.5 px-3 font-sans">
                          <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-bold ${
                              stock.volatilityIndex > 0.7 ? 'text-amber-400' : 'text-slate-400'
                            }`}>
                              {volPercent}%
                            </span>
                            <div className="w-14 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  stock.volatilityIndex > 0.7 ? 'bg-amber-400' : 'bg-indigo-500'
                                }`}
                                style={{ width: `${volPercent}%` }}
                              />
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 pl-3 text-right font-sans">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedSymbol(stock.symbol);
                                setActiveMainTab('TRADING');
                              }}
                              className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-all"
                            >
                              Chart
                            </button>
                            <button
                              onClick={() => handleOpenTradeForSymbol(stock.symbol)}
                              className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs"
                            >
                              Trade
                            </button>
                            {/* Screener company delete button */}
                            <button
                              onClick={() => handleRemoveScreenerSymbol(stock.symbol)}
                              className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800/80 transition-colors"
                              title={`Remove ${stock.symbol} from Screener`}
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
        )}
      </main>

      {/* New Order Modal */}
      <NewOrderModal
        isOpen={isNewOrderOpen}
        onClose={() => setIsNewOrderOpen(false)}
        stocks={stocks}
        initialSymbol={orderInitialSymbol}
        onAddHolding={handleAddHolding}
      />

      {/* Screener Add Company Modal */}
      <ScreenerAddCompanyModal
        isOpen={isAddScreenerModalOpen}
        onClose={() => setIsAddScreenerModalOpen(false)}
        availableStocks={stocks}
        activeSymbols={screenerSymbols}
        onAddSymbol={handleAddScreenerSymbol}
      />
    </div>
  );
}
