import React, { useState, useRef, useEffect } from 'react';
import { VolatilityAlert } from '../types';
import { marketEngine } from '../services/marketEngine';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Trash2, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle 
} from 'lucide-react';

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: VolatilityAlert[];
  unreadCount: number;
}

export const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({
  isOpen,
  onClose,
  alerts,
  unreadCount,
}) => {
  const [filterType, setFilterType] = useState<'ALL' | 'AUTO_EXIT' | 'VOLATILITY'>('ALL');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Handle outside click & escape key to close popover
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      // Don't close if clicking the bell button itself (handled by its toggle)
      const target = e.target as HTMLElement;
      if (target.closest('#btn-notification-bell')) return;

      if (popoverRef.current && !popoverRef.current.contains(target)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    marketEngine.markAllAlertsAsRead();
  };

  const handleClearAll = () => {
    marketEngine.clearAllAlerts();
  };

  const handleMarkRead = (id: string) => {
    marketEngine.markAlertAsRead(id);
  };

  const filteredAlerts = alerts.filter((alert) => {
    if (filterType === 'AUTO_EXIT') return alert.type === 'AUTO_EXIT';
    if (filterType === 'VOLATILITY') return alert.type === 'SURGE' || alert.type === 'DIVE' || alert.type === 'HIGH_VOLATILITY';
    return true;
  });

  const getAlertIcon = (type: VolatilityAlert['type']) => {
    switch (type) {
      case 'AUTO_EXIT':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'SURGE':
        return <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'DIVE':
        return <TrendingDown className="w-4 h-4 text-rose-400 shrink-0" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0" />;
    }
  };

  return (
    <div
      ref={popoverRef}
      id="notifications-popover"
      className="absolute right-0 top-full mt-2 w-[340px] sm:w-[400px] bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl z-50 overflow-hidden"
      style={{
        boxShadow: '0 20px 35px -5px rgba(0, 0, 0, 0.7), 0 10px 15px -5px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Header with ONLY one close 'X' icon */}
      <div className="p-3.5 sm:p-4 border-b border-slate-800 bg-slate-950/90 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">Market Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.2 rounded-full text-[10px] font-bold font-mono bg-rose-500 text-white shadow-xs">
                  {unreadCount} new
                </span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 block">
              Auto-exits, profit target hits & volatility alerts
            </span>
          </div>
        </div>

        {/* Single X Close Icon */}
        <button
          onClick={onClose}
          id="btn-close-notification-popover"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="Close notifications"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Action Controls & Filter bar */}
      <div className="px-3.5 py-2 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between gap-2">
        {/* Filter Pills */}
        <div className="flex items-center gap-1">
          {(['ALL', 'AUTO_EXIT', 'VOLATILITY'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterType(mode)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-semibold transition-all ${
                filterType === mode
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {mode === 'ALL' ? 'All' : mode === 'AUTO_EXIT' ? 'Auto-Exits' : 'Volatility'}
            </button>
          ))}
        </div>

        {/* Read & Clear Actions */}
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              id="btn-mark-all-read"
              className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Mark all alerts as read"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Read all</span>
            </button>
          )}

          {alerts.length > 0 && (
            <button
              onClick={handleClearAll}
              id="btn-clear-all-alerts"
              className="text-[11px] text-slate-400 hover:text-rose-400 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Clear all alerts"
            >
              <Trash2 className="w-3 h-3" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-800/50">
        {filteredAlerts.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-10 h-10 rounded-full bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mx-auto mb-2 text-slate-500">
              <Bell className="w-5 h-5" />
            </div>
            <p className="text-xs text-slate-300 font-medium">No alerts in this category</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Live notifications will appear here as positions execute.
            </p>
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              onClick={() => handleMarkRead(alert.id)}
              className={`p-3 transition-colors cursor-pointer flex items-start gap-2.5 ${
                alert.read
                  ? 'bg-transparent hover:bg-slate-800/40 opacity-75'
                  : 'bg-indigo-950/20 hover:bg-indigo-950/30'
              }`}
            >
              <div className="mt-0.5">{getAlertIcon(alert.type)}</div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-white text-xs">{alert.symbol}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                      {alert.type === 'AUTO_EXIT' ? 'AUTO EXIT' : alert.type}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono shrink-0">
                    {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-snug break-words">
                  {alert.message}
                </p>
              </div>

              {!alert.read && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0 shadow-xs shadow-indigo-500" />
              )}
            </div>
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
        <span>Real-time engine alerts</span>
        <span className="font-mono">{alerts.length} total</span>
      </div>
    </div>
  );
};
