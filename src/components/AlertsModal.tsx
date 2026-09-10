import React, { useState } from 'react';
import { VolatilityAlert } from '../types';
import { marketEngine } from '../services/marketEngine';
import { 
  Bell, 
  X, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Check, 
  Trash2,
  Filter,
  ShieldCheck,
  Zap
} from 'lucide-react';

/**
 * Props for the AlertsModal full-screen notification center dialog.
 */
interface AlertsModalProps {
  /** Modal open visibility state */
  isOpen: boolean;
  /** Modal dismiss callback */
  onClose: () => void;
  /** Notification alerts list */
  alerts: VolatilityAlert[];
}

/**
 * Full-screen modal notification manager allowing search, exchange filtering,
 * and bulk acknowledgment of volatility events.
 *
 * @param {AlertsModalProps} props - Render configuration.
 * @returns {React.ReactElement | null} Interactive notification center or null when closed.
 */
export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'AUTO_EXIT' | 'VOLATILITY'>('ALL');

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter((a) => {
    if (filter === 'AUTO_EXIT') return a.type === 'AUTO_EXIT';
    if (filter === 'VOLATILITY') return a.type === 'SURGE' || a.type === 'DIVE' || a.type === 'HIGH_VOLATILITY';
    return true;
  });

  const handleMarkRead = (id: string) => {
    marketEngine.markAlertAsRead(id);
  };

  const handleClearAll = () => {
    marketEngine.clearAllAlerts();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Market Volatility & Auto-Exit Alerts</span>
                {alerts.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-mono font-normal">
                    {alerts.length}
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time rapid movements and target-profit execution notices
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills & Actions */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                filter === 'ALL'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              All Alerts
            </button>
            <button
              onClick={() => setFilter('AUTO_EXIT')}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                filter === 'AUTO_EXIT'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Auto-Exits
            </button>
            <button
              onClick={() => setFilter('VOLATILITY')}
              className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1 ${
                filter === 'VOLATILITY'
                  ? 'bg-amber-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Volatility
            </button>
          </div>

          {alerts.length > 0 && (
            <button
              onClick={handleClearAll}
              className="flex items-center gap-1 text-slate-400 hover:text-rose-400 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Alerts List */}
        <div className="p-4 sm:p-5 overflow-y-auto divide-y divide-slate-800/60 flex-1 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="font-semibold text-slate-300">No active volatility alerts</p>
              <p className="text-slate-500 mt-1">
                Alerts trigger when a stock price fluctuates rapidly or when an intraday trade reaches its predefined target profit.
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => {
              const isAutoExit = alert.type === 'AUTO_EXIT';
              const isSurge = alert.type === 'SURGE';
              const isDive = alert.type === 'DIVE';
              const timeString = new Date(alert.timestamp).toLocaleTimeString();

              return (
                <div
                  key={alert.id}
                  onClick={() => handleMarkRead(alert.id)}
                  className={`pt-3 first:pt-0 flex items-start gap-3 cursor-pointer group transition-all ${
                    alert.read ? 'opacity-65' : 'opacity-100'
                  }`}
                >
                  {/* Icon */}
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isAutoExit
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : isSurge
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : isDive
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30'
                    }`}
                  >
                    {isAutoExit ? (
                      <Sparkles className="w-4 h-4" />
                    ) : isSurge ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : isDive ? (
                      <TrendingDown className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">
                          {alert.symbol}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                            isAutoExit
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : isSurge
                              ? 'bg-amber-500/20 text-amber-300'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {alert.type.replace('_', ' ')}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-slate-500">
                        {timeString}
                      </span>
                    </div>

                    <p className="text-xs text-slate-200 mt-1 font-medium leading-relaxed">
                      {alert.message}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5 font-mono text-[11px] text-slate-400">
                      <span>Trigger Price: ₹{alert.price.toFixed(2)}</span>
                      <span>Change: {alert.changePercent > 0 ? '+' : ''}{alert.changePercent.toFixed(2)}%</span>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  {!alert.read && (
                    <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-2" />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Target Profit Auto-Exit engine active</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
