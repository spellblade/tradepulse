import React, { useState } from 'react';
import { StockSymbol, PortfolioHolding } from '../types';
import { marketEngine } from '../services/marketEngine';
import { SymbolSearchCombobox } from './SymbolSearchCombobox';
import { 
  X, 
  Zap, 
  ShieldCheck, 
  Briefcase, 
  ArrowUpRight, 
  Calculator,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: StockSymbol[];
  initialSymbol?: string;
  onAddHolding: (holding: Omit<PortfolioHolding, 'id'>) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  stocks,
  initialSymbol,
  onAddHolding,
}) => {
  const [symbol, setSymbol] = useState<string>(initialSymbol || stocks[0]?.symbol || 'RELIANCE');
  const [orderCategory, setOrderCategory] = useState<'INTRADAY' | 'DELIVERY'>('INTRADAY');
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(50);
  const [targetProfitAmount, setTargetProfitAmount] = useState<number>(1000);
  const [stopLossAmount, setStopLossAmount] = useState<number>(500);

  // Sync initialSymbol if changed
  React.useEffect(() => {
    if (initialSymbol) setSymbol(initialSymbol);
  }, [initialSymbol]);

  if (!isOpen) return null;

  const currentStock = stocks.find((s) => s.symbol === symbol) || stocks[0];
  const price = currentStock ? currentStock.currentPrice : 100;
  const totalOrderValue = price * quantity;

  const handleSanitizedChange = (setter: (val: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === '') {
      setter(0);
      return;
    }
    const cleaned = raw.replace(/^0+(?=\d)/, '');
    const num = Number(cleaned);
    if (!isNaN(num)) {
      setter(num);
    }
  };

  // Calculate target exit price based on target profit amount
  // targetProfit = (targetPrice - entryPrice) * qty
  // targetPrice = entryPrice + (targetProfit / qty)
  const priceDeltaNeeded = quantity > 0 ? targetProfitAmount / quantity : 0;
  const targetExitPrice = orderType === 'BUY'
    ? price + priceDeltaNeeded
    : price - priceDeltaNeeded;

  const stopLossDeltaNeeded = quantity > 0 ? stopLossAmount / quantity : 0;
  const stopLossExitPrice = orderType === 'BUY'
    ? price - stopLossDeltaNeeded
    : price + stopLossDeltaNeeded;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const activeStock = stocks.find((s) => s.symbol === symbol) || marketEngine.ensureStockActive(symbol);
    if (!activeStock) return;

    if (orderCategory === 'INTRADAY') {
      marketEngine.addIntradayTrade({
        symbol: activeStock.symbol,
        name: activeStock.name,
        type: orderType,
        quantity: Number(quantity) || 1,
        entryPrice: activeStock.currentPrice,
        currentPrice: activeStock.currentPrice,
        targetProfitAmount: Number(targetProfitAmount) || 100,
        stopLossAmount: Number(stopLossAmount) || 0,
      });
    } else {
      // Long-term delivery added to portfolio
      onAddHolding({
        symbol: activeStock.symbol,
        name: activeStock.name,
        quantity: Number(quantity) || 1,
        avgBuyPrice: activeStock.currentPrice,
        sector: activeStock.sector,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Place New Order
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Intraday with automated profit exit or long-term portfolio delivery
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

        {/* Order Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          {/* Order Category Toggle (Intraday vs Delivery) */}
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setOrderCategory('INTRADAY')}
              className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                orderCategory === 'INTRADAY'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Intraday (Auto-Exit)</span>
            </button>
            <button
              type="button"
              onClick={() => setOrderCategory('DELIVERY')}
              className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                orderCategory === 'DELIVERY'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Delivery (Portfolio)</span>
            </button>
          </div>

          {/* Stock Selection & Live Price */}
          <div className="space-y-1">
            <SymbolSearchCombobox
              label="Stock Asset & Market"
              selectedSymbol={symbol}
              onSelectSymbol={(s) => setSymbol(s)}
              stocks={stocks}
            />
          </div>

          {/* Buy or Sell Toggle */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
              Order Direction
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setOrderType('BUY')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  orderType === 'BUY'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                BUY (Long)
              </button>
              <button
                type="button"
                onClick={() => setOrderType('SELL')}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  orderType === 'SELL'
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/20'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                SELL (Short)
              </button>
            </div>
          </div>

          {/* Quantity & Order Value */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Quantity (Shares / Lots)
              </label>
              <input
                type="number"
                min="1"
                value={quantity === 0 ? '' : quantity}
                onChange={handleSanitizedChange(setQuantity)}
                placeholder="0"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-400 uppercase mb-1">
                Total Order Value
              </label>
              <div className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono font-semibold text-slate-200">
                ₹{totalOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* INTRADAY AUTO-EXIT TARGET PROFIT CONFIGURATION */}
          {orderCategory === 'INTRADAY' && (
            <div className="bg-slate-950/90 border border-emerald-500/30 rounded-xl p-3.5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Automatic Exit on Target Profit</span>
                </span>
                <span className="text-[10px] text-slate-400">Zero latency execution</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase mb-1">
                    Predefined Target Profit (₹)
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="50"
                    value={targetProfitAmount === 0 ? '' : targetProfitAmount}
                    onChange={handleSanitizedChange(setTargetProfitAmount)}
                    placeholder="0"
                    className="w-full bg-slate-900 border border-emerald-500/50 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-slate-400 uppercase mb-1">
                    Stop Loss Amount (₹)
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="0"
                    value={stopLossAmount === 0 ? '' : stopLossAmount}
                    onChange={handleSanitizedChange(setStopLossAmount)}
                    placeholder="0"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-bold text-rose-300 focus:outline-none focus:border-rose-400"
                  />
                </div>
              </div>

              {/* Automatic Exit Trigger Price Preview */}
              <div className="bg-slate-900/90 rounded-lg p-2.5 border border-slate-800 text-[11px] font-mono flex items-center justify-between">
                <span className="text-slate-400">Target Exit Price:</span>
                <span className="text-emerald-400 font-bold">
                  ₹{targetExitPrice.toFixed(2)} (+₹{targetProfitAmount.toFixed(2)})
                </span>
              </div>
            </div>
          )}

          {/* Submit and Cancel Action */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 rounded-xl text-xs sm:text-sm font-semibold bg-rose-950/80 text-rose-300 border border-rose-800/80 hover:bg-rose-900/80 transition-colors cursor-pointer"
            >
              Cancel Order
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 rounded-xl font-bold text-xs sm:text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                orderType === 'BUY'
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/20'
              }`}
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>
                Submit {orderCategory} {orderType} Order (₹{totalOrderValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
