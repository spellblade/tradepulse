import React, { useState, useEffect } from 'react';
import { CustomPriceAlert, StockSymbol } from '../types';
import { marketEngine } from '../services/marketEngine';
import { 
  X, 
  BellRing, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { SymbolSearchCombobox } from './SymbolSearchCombobox';

/**
 * Props for the PriceAlertsModal threshold management dialog.
 */
interface PriceAlertsModalProps {
  /** Modal open visibility state */
  isOpen: boolean;
  /** Modal dismiss callback */
  onClose: () => void;
  /** Active stock entities available for alert creation */
  stocks: StockSymbol[];
}

/**
 * Custom price alert management modal allowing users to configure target price boundaries (ABOVE/BELOW)
 * across BSE, NSE, and MCX assets with real-time threshold notifications.
 *
 * @param {PriceAlertsModalProps} props - Render configuration.
 * @returns {React.ReactElement | null} Modal configuration dialog or null when closed.
 */
export const PriceAlertsModal: React.FC<PriceAlertsModalProps> = ({
  isOpen,
  onClose,
  stocks,
}) => {
  const [alerts, setAlerts] = useState<CustomPriceAlert[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(stocks[0]?.symbol || 'TCS');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetPrice, setTargetPrice] = useState<string>('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Sync alerts from market engine
  useEffect(() => {
    if (!isOpen) return;

    const updateAlerts = () => {
      setAlerts(marketEngine.getCustomAlerts());
    };

    updateAlerts();
    const unsub = marketEngine.subscribe(updateAlerts);
    return () => unsub();
  }, [isOpen]);

  // Set default target price to current price when selectedSymbol changes
  useEffect(() => {
    const currentStock = stocks.find((s) => s.symbol === selectedSymbol);
    if (currentStock) {
      setTargetPrice(currentStock.currentPrice.toFixed(2));
    }
  }, [selectedSymbol, stocks]);

  if (!isOpen) return null;

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedPrice = parseFloat(targetPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setFeedbackMsg('Please enter a valid price greater than 0');
      return;
    }

    marketEngine.addCustomPriceAlert(selectedSymbol, condition, parsedPrice);
    setFeedbackMsg(`Alert set: ${selectedSymbol} ${condition === 'ABOVE' ? '≥' : '≤'} ₹${parsedPrice.toFixed(2)}`);
    setTimeout(() => setFeedbackMsg(null), 3000);
  };

  const handleRemove = (id: string) => {
    marketEngine.removeCustomPriceAlert(id);
  };

  const handleToggle = (id: string) => {
    marketEngine.toggleCustomPriceAlert(id);
  };

  const currentStock = stocks.find((s) => s.symbol === selectedSymbol);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fadeIn">
      <div 
        className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Price Alert Thresholds</h2>
              <p className="text-xs text-slate-400">
                Trigger real-time notifications when a stock crosses your target level
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

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
          {/* Create Alert Form */}
          <form onSubmit={handleAddAlert} className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80 space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-indigo-400" />
              Set New Alert
            </h3>

            {/* Dynamic Symbol Search */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Asset / Symbol
              </label>
              <SymbolSearchCombobox
                stocks={stocks}
                selectedSymbol={selectedSymbol}
                onSelectSymbol={setSelectedSymbol}
              />
            </div>

            {/* Current Price Preview */}
            {currentStock && (
              <div className="flex items-center justify-between text-xs bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-slate-400">Current Market Price:</span>
                <span className="font-mono font-bold text-white">
                  ₹{currentStock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {/* Condition & Price Input */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Trigger Condition
                </label>
                <div className="flex gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCondition('ABOVE')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                      condition === 'ABOVE'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <TrendingUp className="w-3.5 h-3.5" />
                    Rises Above (≥)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCondition('BELOW')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-all ${
                      condition === 'BELOW'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <TrendingDown className="w-3.5 h-3.5" />
                    Falls Below (≤)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Target Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">₹</span>
                  <input
                    type="number"
                    step="0.05"
                    min="0.05"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-7 pr-3 py-2 text-xs font-mono text-white focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {feedbackMsg && (
              <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-lg flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <BellRing className="w-4 h-4" />
              Activate Alert
            </button>
          </form>

          {/* Active Alerts List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Configured Alerts ({alerts.length})
              </h3>
              <span className="text-[11px] text-slate-500">Real-time matching active</span>
            </div>

            {alerts.length === 0 ? (
              <div className="p-6 text-center bg-slate-950/40 rounded-xl border border-slate-800/60">
                <AlertCircle className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
                <p className="text-xs text-slate-400 font-medium">No custom price alerts configured</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Set a threshold above to be notified instantly when ticks cross your target.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {alerts.map((al) => {
                  const s = stocks.find((st) => st.symbol === al.symbol);
                  return (
                    <div
                      key={al.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        al.active
                          ? 'bg-slate-950/90 border-slate-800'
                          : 'bg-slate-950/40 border-slate-800/50 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`p-2 rounded-lg border ${
                            al.condition === 'ABOVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {al.condition === 'ABOVE' ? (
                            <TrendingUp className="w-4 h-4" />
                          ) : (
                            <TrendingDown className="w-4 h-4" />
                          )}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{al.symbol}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {al.condition === 'ABOVE' ? '≥' : '≤'} ₹{al.targetPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                            {al.triggeredAt && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                                Triggered
                              </span>
                            )}
                          </div>
                          {s && (
                            <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                              Live: ₹{s.currentPrice.toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(al.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all cursor-pointer ${
                            al.active
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 hover:text-white'
                          }`}
                        >
                          {al.active ? 'Active' : 'Disabled'}
                        </button>
                        <button
                          onClick={() => handleRemove(al.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Delete Alert"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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
