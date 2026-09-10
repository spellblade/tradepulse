import React, { useState } from 'react';
import { 
  Activity,
  Zap, 
  Gauge, 
  Play, 
  Pause, 
  Bell, 
  BellRing,
  TrendingUp, 
  TrendingDown, 
  ShieldCheck,
  Landmark,
  BarChart3,
  Flame
} from 'lucide-react';
import { MarketIndex, MarketActivitySpeed, VolatilityAlert, StockSymbol } from '../types';
import { marketEngine } from '../services/marketEngine';
import { NotificationsPopover } from './NotificationsPopover';
import { PriceAlertsModal } from './PriceAlertsModal';
import { useAppVersion } from '../hooks/useAppVersion';

/**
 * Props for the application top Header navigation and telemetry bar.
 */
interface HeaderProps {
  /** Real-time benchmark market indices (SENSEX, NIFTY 50, iCOMDEX, VIX) */
  indices: MarketIndex[];
  /** Current UI rendering frame-rate telemetry */
  fps: number;
  /** Cumulative batch count of processed market ticks */
  batchCount: number;
  /** Whether the background simulation tick loop is running */
  isRunning: boolean;
  /** Current simulation activity speed */
  speed: MarketActivitySpeed;
  /** Number of unread alerts for notification badge */
  unreadAlertsCount: number;
  /** Active volatility and execution notification events */
  alerts: VolatilityAlert[];
  /** Whether notification popover is expanded */
  isAlertsOpen: boolean;
  /** Callback to toggle notification popover visibility */
  onToggleAlerts: () => void;
  /** Callback to close notification popover */
  onCloseAlerts: () => void;
  /** Callback to trigger the new trade modal */
  onOpenNewTrade: () => void;
  /** Active stock entities for price alerts */
  stocks?: StockSymbol[];
}

/**
 * Top application header component containing branding, live indices ribbon, simulation telemetry,
 * activity speed controls, and alert notification triggers.
 *
 * @param {HeaderProps} props - Render properties.
 * @returns {React.ReactElement} Application top bar.
 */
export const Header: React.FC<HeaderProps> = ({
  indices,
  fps,
  batchCount,
  isRunning,
  speed,
  unreadAlertsCount,
  alerts,
  isAlertsOpen,
  onToggleAlerts,
  onCloseAlerts,
  onOpenNewTrade,
  stocks = [],
}) => {
  const version = useAppVersion();
  const [isPriceAlertModalOpen, setIsPriceAlertModalOpen] = useState(false);

  const handleSpeedChange = (newSpeed: MarketActivitySpeed) => {
    marketEngine.setSpeed(newSpeed);
  };

  const handleToggleRunning = () => {
    marketEngine.toggleRunning();
  };

  const getIndexVisualIcon = (symbol: string, exchange?: string) => {
    if (symbol.includes('SENSEX') || exchange === 'BSE') {
      return <Landmark className="w-3.5 h-3.5 text-blue-400 shrink-0" />;
    }
    if (symbol.includes('NIFTY') || exchange === 'NSE') {
      return <BarChart3 className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    }
    if (symbol.includes('MCX') || symbol.includes('COMDEX') || exchange === 'MCX') {
      return <Flame className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    }
    return <Activity className="w-3.5 h-3.5 text-purple-400 shrink-0" />;
  };

  const getIndexBadge = (symbol: string, exchange?: string) => {
    const label = exchange || (symbol.includes('SENSEX') ? 'BSE' : symbol.includes('NIFTY') ? 'NSE' : symbol.includes('MCX') ? 'MCX' : 'VIX');
    switch (label) {
      case 'BSE':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/40';
      case 'NSE':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MCX':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'VIX':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 sticky top-0 z-40 shadow-md">
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand & Market Status (TradePulse - Modern real-time pulse emblem) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-[1.5px] shadow-lg shadow-emerald-500/25 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center relative overflow-hidden group">
              {/* Subtle ambient pulse background glow */}
              <div className="absolute inset-0 bg-emerald-500/10 rounded-[10px] pointer-events-none" />
              {/* Modern real-time market activity pulse icon */}
              <Activity className="w-5 h-5 text-emerald-400 stroke-[2.25] relative z-10 transition-transform duration-300 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
              {/* Live telemetry micro-indicator beacon */}
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#22d3ee] animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-white flex items-center gap-2">
                <span className="bg-gradient-to-r from-white via-slate-100 to-slate-200 bg-clip-text text-transparent">TradePulse</span>
                <span 
                  id="header-app-version-badge"
                  className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-slate-800/90 text-slate-300 border border-slate-700/80 tracking-tight select-none shadow-xs"
                  title={`TradePulse Release v${version}`}
                >
                  v{version}
                </span>
                <button
                  onClick={() => marketEngine.toggleLiveFeed()}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 border transition-all cursor-pointer ${
                    marketEngine.isLiveFeed()
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  }`}
                  title={marketEngine.isLiveFeed() ? 'Switch to Offline Practice Simulation' : 'Switch to Real-Time Market Feed'}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${marketEngine.isLiveFeed() ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                  {marketEngine.isLiveFeed() ? 'LIVE MARKET FEED' : 'PRACTICE MODE'}
                </button>
              </h1>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="font-medium text-slate-300">
                {isRunning ? (marketEngine.isLiveFeed() ? 'STREAMING REAL DATA' : 'LIVE TICKS') : 'PAUSED'}
              </span>
              <span className="hidden sm:inline text-slate-600">•</span>
              <span className="hidden sm:inline font-mono text-slate-400">{fps} FPS</span>
              <span className="hidden md:inline text-slate-600">•</span>
              <span className="hidden md:inline text-[10px] font-mono text-slate-400" title="BSE & NSE: 09:15-15:30 IST | MCX: 09:00-23:30 IST">
                IST (UTC+5:30)
              </span>
            </div>
          </div>
        </div>

        {/* Compact Simulation Controls (Clean & slimmed down) */}
        <div className="hidden md:flex items-center gap-2 bg-slate-950/80 border border-slate-800/80 px-2.5 py-1.5 rounded-xl text-xs">
          <span className="text-slate-400 font-medium text-[11px]">Rate:</span>
          {(['normal', 'turbo', 'hyper'] as MarketActivitySpeed[]).map((sp) => (
            <button
              key={sp}
              onClick={() => handleSpeedChange(sp)}
              className={`px-2 py-0.5 rounded-md font-medium text-[11px] transition-all cursor-pointer capitalize ${
                speed === sp
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {sp === 'hyper' ? '150ms' : sp}
            </button>
          ))}

          <div className="h-3.5 w-[1px] bg-slate-800 mx-0.5" />

          {/* Pause / Play */}
          <button
            onClick={handleToggleRunning}
            className="p-1 rounded-md hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title={isRunning ? 'Pause Live Ticks' : 'Resume Live Ticks'}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 text-amber-400" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Target-Profit Auto-Exit ON Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Auto-Exit ON</span>
          </div>

          {/* Price Alert Thresholds Button */}
          <button
            id="btn-price-alerts-config"
            onClick={() => setIsPriceAlertModalOpen(true)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-indigo-400 transition-colors border border-slate-700/60 cursor-pointer"
            title="Configure Custom Price Alerts"
          >
            <BellRing className="w-4 h-4" />
          </button>

          {/* Volatility & Auto-Exit Alerts Bell Attached to Popover */}
          <div className="relative">
            <button
              id="btn-notification-bell"
              onClick={onToggleAlerts}
              className="relative p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors border border-slate-700/60 cursor-pointer"
              title="Volatility & Auto-Exit Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadAlertsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 bg-rose-500 text-white rounded-full text-[9px] font-bold flex items-center justify-center animate-pulse">
                  {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
                </span>
              )}
            </button>

            {/* Anchored Popover Attached to the Bell Icon */}
            <NotificationsPopover
              isOpen={isAlertsOpen}
              onClose={onCloseAlerts}
              alerts={alerts}
              unreadCount={unreadAlertsCount}
            />
          </div>
        </div>
      </div>

      {/* Top Ticker Ribbon with SENSEX, NIFTY 50, MCX, INDIA VIX */}
      <div className="bg-slate-950/90 border-t border-slate-800/60 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-6 shrink-0">
            {indices.map((idx) => {
              const isPositive = idx.change >= 0;
              const exchangeLabel = idx.exchange || (idx.symbol.includes('SENSEX') ? 'BSE' : idx.symbol.includes('NIFTY') ? 'NSE' : idx.symbol.includes('MCX') ? 'MCX' : 'VIX');

              return (
                <div key={idx.symbol} className="flex items-center gap-2 shrink-0">
                  {/* Distinct Visual Icon beside each index */}
                  {getIndexVisualIcon(idx.symbol, idx.exchange)}

                  {/* Clean text badge with market open/closed status indicator */}
                  <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold border uppercase flex items-center gap-1 ${getIndexBadge(idx.symbol, idx.exchange)}`}>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${idx.isOpen !== false ? 'bg-emerald-400' : 'bg-rose-400'}`}
                      title={idx.isOpen !== false ? `${exchangeLabel}: Session Active (Open)` : `${exchangeLabel}: Session Inactive (Closed)`}
                    />
                    {exchangeLabel}
                  </span>

                  <span className="font-semibold text-slate-200">{idx.name}</span>
                  <span className="font-mono text-slate-100 font-bold">
                    {idx.value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`flex items-center gap-0.5 font-mono text-[11px] font-medium ${
                      isPositive ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3 h-3 shrink-0" />
                    ) : (
                      <TrendingDown className="w-3 h-3 shrink-0" />
                    )}
                    <span>
                      {isPositive ? '+' : ''}{idx.change.toFixed(2)} ({isPositive ? '+' : ''}{idx.changePercent}%)
                    </span>
                  </span>
                </div>
              );
            })}
          </div>

          {/* Mobile Speed Toggle (visible only on small screens) */}
          <div className="flex lg:hidden items-center gap-1 text-[11px] shrink-0">
            <span className="text-slate-400">Speed:</span>
            {(['normal', 'turbo', 'hyper'] as MarketActivitySpeed[]).map((sp) => (
              <button
                key={sp}
                onClick={() => handleSpeedChange(sp)}
                className={`px-2 py-0.5 rounded capitalize ${
                  speed === sp
                    ? 'bg-indigo-600 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                {sp}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Price Alerts Threshold Modal */}
      <PriceAlertsModal
        isOpen={isPriceAlertModalOpen}
        onClose={() => setIsPriceAlertModalOpen(false)}
        stocks={stocks}
      />
    </header>
  );
};
