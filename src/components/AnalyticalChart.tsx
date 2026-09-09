import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import { StockSymbol, ChartTimeframe } from '../types';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Zap,
} from 'lucide-react';

interface AnalyticalChartProps {
  stock: StockSymbol;
  onOpenTradeForSymbol: (symbol: string) => void;
}

type ChartMode = 'area' | 'line' | 'ohlc';

export const AnalyticalChart: React.FC<AnalyticalChartProps> = ({
  stock,
  onOpenTradeForSymbol,
}) => {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('5m');
  const [chartMode, setChartMode] = useState<ChartMode>('area');
  const [showSma20, setShowSma20] = useState<boolean>(true);
  const [showEma50, setShowEma50] = useState<boolean>(true);
  const [showVolume, setShowVolume] = useState<boolean>(true);

  // Compute sliced/aggregated history based on timeframe for realistic analytical display
  const chartData = useMemo(() => {
    if (!stock.history || stock.history.length === 0) return [];

    let sliceCount = 45;
    if (timeframe === '1m') sliceCount = 20;
    else if (timeframe === '5m') sliceCount = 35;
    else if (timeframe === '15m') sliceCount = 45;
    else if (timeframe === '1H') sliceCount = 45;
    else if (timeframe === '1D') sliceCount = 45;

    const raw = stock.history.slice(-sliceCount);
    return raw.map((point) => {
      const isUp = point.close >= point.open;
      return {
        ...point,
        candleHigh: point.high,
        candleLow: point.low,
        candleBodyTop: Math.max(point.open, point.close),
        candleBodyBottom: Math.min(point.open, point.close),
        isUp,
      };
    });
  }, [stock.history, timeframe]);

  // Determine YAxis domain with small padding
  const yDomain = useMemo(() => {
    if (chartData.length === 0) return ['auto', 'auto'];
    const min = Math.min(...chartData.map((d) => Math.min(d.low, d.sma20 || d.low, d.ema50 || d.low)));
    const max = Math.max(...chartData.map((d) => Math.max(d.high, d.sma20 || d.high, d.ema50 || d.high)));
    const padding = (max - min) * 0.08 || 1;
    return [
      Number((min - padding).toFixed(2)),
      Number((max + padding).toFixed(2)),
    ];
  }, [chartData]);

  const isPositive = stock.change >= 0;

  // Custom rich Tooltip for financial charts
  const renderTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    const isUp = data.close >= data.open;

    return (
      <div className="bg-slate-900 border border-slate-700/80 rounded-xl p-3 shadow-xl text-xs space-y-1.5 min-w-[190px]">
        <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
          <span className="font-mono text-slate-400">{data.timeLabel}</span>
          <span className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
            isUp ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
          }`}>
            {isUp ? 'BULLISH CANDLE' : 'BEARISH CANDLE'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 font-mono">
          <div className="text-slate-400">Open:</div>
          <div className="text-right font-semibold text-slate-200">₹{data.open.toFixed(2)}</div>
          <div className="text-slate-400">High:</div>
          <div className="text-right font-semibold text-emerald-400">₹{data.high.toFixed(2)}</div>
          <div className="text-slate-400">Low:</div>
          <div className="text-right font-semibold text-rose-400">₹{data.low.toFixed(2)}</div>
          <div className="text-slate-400">Close:</div>
          <div className="text-right font-semibold text-slate-100">₹{data.close.toFixed(2)}</div>
        </div>
        {(data.sma20 || data.ema50) && (
          <div className="border-t border-slate-800 pt-1.5 grid grid-cols-2 gap-x-3 font-mono text-[11px]">
            {data.sma20 && (
              <>
                <span className="text-amber-400">SMA(20):</span>
                <span className="text-right text-amber-300">₹{data.sma20.toFixed(2)}</span>
              </>
            )}
            {data.ema50 && (
              <>
                <span className="text-cyan-400">EMA(50):</span>
                <span className="text-right text-cyan-300">₹{data.ema50.toFixed(2)}</span>
              </>
            )}
          </div>
        )}
        <div className="border-t border-slate-800 pt-1.5 flex items-center justify-between text-slate-400 text-[11px]">
          <span>Volume:</span>
          <span className="font-mono text-slate-200">{data.volume.toLocaleString()}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col">
      {/* Chart Top Title & Real-Time Price Strip */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-4 bg-slate-900/60">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-baseline gap-2">
                <span>{stock.name}</span>
                <span className="text-base sm:text-lg font-bold text-slate-400">({stock.symbol})</span>
              </h2>
              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border shrink-0 ${
                stock.exchange === 'BSE'
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                  : stock.exchange === 'NSE'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {stock.exchange}
              </span>
              <span className="text-xs text-slate-400 hidden sm:inline">• {stock.sector}</span>
            </div>
            <div className="flex items-center gap-3 mt-1 font-mono">
              <span className="text-2xl font-bold text-white">
                ₹{stock.currentPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {stock.unit && <span className="text-sm font-normal text-slate-400 ml-1">{stock.unit}</span>}
              </span>
              <span
                className={`flex items-center text-sm font-semibold px-2 py-0.5 rounded-md ${
                  isPositive
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}
              >
                {isPositive ? '+' : ''}
                ₹{stock.change.toFixed(2)} ({isPositive ? '+' : ''}
                {stock.changePercent}%)
              </span>
            </div>
          </div>
        </div>

        {/* Day Range Gauge & Quick Action */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          {/* Day High / Low Range */}
          <div className="hidden md:block text-right">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider mb-1">
              Day Range
            </div>
            <div className="flex items-center gap-2 font-mono text-xs">
              <span className="text-rose-400">₹{stock.dayLow.toFixed(2)}</span>
              <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className="absolute inset-y-0 bg-indigo-500 rounded-full"
                  style={{
                    left: `${
                      ((stock.currentPrice - stock.dayLow) /
                        Math.max(0.1, stock.dayHigh - stock.dayLow)) *
                      100
                    }%`,
                    width: '6px',
                  }}
                />
              </div>
              <span className="text-emerald-400">₹{stock.dayHigh.toFixed(2)}</span>
            </div>
          </div>

          {/* Key Metrics Pill */}
          <div className="hidden xl:flex items-center gap-4 bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Volume</span>
              <span className="font-mono font-semibold text-slate-200">
                {(stock.volume / 1000000).toFixed(1)}M
              </span>
            </div>
            <div className="border-r border-slate-800 h-6" />
            <div>
              <span className="text-slate-400 block text-[10px]">Mkt Cap</span>
              <span className="font-mono font-semibold text-slate-200">{stock.marketCap}</span>
            </div>
            <div className="border-r border-slate-800 h-6" />
            <div>
              <span className="text-slate-400 block text-[10px]">P/E Ratio</span>
              <span className="font-mono font-semibold text-slate-200">{stock.peRatio || 'N/A'}</span>
            </div>
          </div>

          {/* Quick Trade Intraday button with consistent compact dimensions matching TCS/INFY */}
          <button
            id="btn-chart-trade-action"
            onClick={() => onOpenTradeForSymbol(stock.symbol)}
            className="flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm h-10 min-w-[110px] px-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-[1.02] shrink-0 cursor-pointer"
            title={`Trade ${stock.symbol}`}
          >
            <Zap className="w-4 h-4 fill-current shrink-0" />
            <span>Trade</span>
          </button>
        </div>
      </div>

      {/* Chart Toolbar (Timeframes, Chart Type, Indicator Toggles) */}
      <div className="px-4 sm:px-5 py-2.5 bg-slate-950/70 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Timeframe selector */}
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400 mr-1 hidden sm:block" />
          {(['1m', '5m', '15m', '1H', '1D'] as ChartTimeframe[]).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                timeframe === tf
                  ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>

        {/* Chart View Mode (Area, Line, OHLC Candlestick) */}
        <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setChartMode('area')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              chartMode === 'area' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Area
          </button>
          <button
            onClick={() => setChartMode('line')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              chartMode === 'line' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setChartMode('ohlc')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              chartMode === 'ohlc' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            OHLC
          </button>
        </div>

        {/* Indicator overlays (SMA 20, EMA 50, Volume) */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 text-[11px] hidden sm:inline font-medium">Indicators:</span>
          <button
            onClick={() => setShowSma20(!showSma20)}
            className={`px-2.5 py-1 rounded-lg font-medium text-xs border transition-all ${
              showSma20
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
            }`}
          >
            SMA 20
          </button>
          <button
            onClick={() => setShowEma50(!showEma50)}
            className={`px-2.5 py-1 rounded-lg font-medium text-xs border transition-all ${
              showEma50
                ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
            }`}
          >
            EMA 50
          </button>
          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`px-2.5 py-1 rounded-lg font-medium text-xs border transition-all ${
              showVolume
                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-400'
            }`}
          >
            Volume
          </button>
        </div>
      </div>

      {/* Main Analytical Chart Canvas */}
      <div className="p-4 h-80 sm:h-96 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPriceUp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorPriceDown" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <XAxis
              dataKey="timeLabel"
              stroke="#475569"
              tick={{ fill: '#64748B', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
              interval="preserveStartEnd"
            />

            <YAxis
              yAxisId="price"
              domain={yDomain}
              stroke="#475569"
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
              tickFormatter={(v) => `₹${v}`}
              orientation="right"
            />

            {showVolume && (
              <YAxis
                yAxisId="volume"
                orientation="left"
                domain={[0, 'dataMax * 4']}
                hide
              />
            )}

            <Tooltip content={renderTooltip} />

            {/* Reference Line for Previous Close */}
            <ReferenceLine
              yAxisId="price"
              y={stock.previousClose}
              stroke="#64748B"
              strokeDasharray="3 3"
              label={{
                value: 'Prev Close',
                fill: '#64748B',
                fontSize: 10,
                position: 'insideBottomLeft',
              }}
            />

            {/* Volume Bars */}
            {showVolume && (
              <Bar
                yAxisId="volume"
                dataKey="volume"
                fill="#334155"
                opacity={0.4}
                radius={[2, 2, 0, 0]}
              />
            )}

            {/* Moving Averages */}
            {showSma20 && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="sma20"
                name="SMA (20)"
                stroke="#F59E0B"
                strokeWidth={1.5}
                dot={false}
              />
            )}

            {showEma50 && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="ema50"
                name="EMA (50)"
                stroke="#06B6D4"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
              />
            )}

            {/* Main Price Series based on Chart Mode */}
            {chartMode === 'area' && (
              <Area
                yAxisId="price"
                type="monotone"
                dataKey="close"
                stroke={isPositive ? '#10B981' : '#F43F5E'}
                strokeWidth={2}
                fillOpacity={1}
                fill={`url(#${isPositive ? 'colorPriceUp' : 'colorPriceDown'})`}
              />
            )}

            {chartMode === 'line' && (
              <Line
                yAxisId="price"
                type="monotone"
                dataKey="close"
                stroke={isPositive ? '#10B981' : '#F43F5E'}
                strokeWidth={2.5}
                dot={false}
              />
            )}

            {chartMode === 'ohlc' && (
              <>
                {/* Simulated Candlestick view using High/Low bars + Open/Close body */}
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="high"
                  stroke="#64748B"
                  strokeWidth={1}
                  dot={false}
                />
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="low"
                  stroke="#64748B"
                  strokeWidth={1}
                  dot={false}
                />
                <Area
                  yAxisId="price"
                  type="monotone"
                  dataKey="close"
                  stroke={isPositive ? '#10B981' : '#F43F5E'}
                  strokeWidth={2}
                  fillOpacity={0.2}
                  fill={isPositive ? '#10B981' : '#F43F5E'}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Indicator Guide */}
      <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
            <span>Real-time price feed (1m candle updates)</span>
          </span>
          {showSma20 && (
            <span className="flex items-center gap-1.5 text-amber-400">
              <span className="w-2.5 h-0.5 bg-amber-400" />
              <span>SMA (20)</span>
            </span>
          )}
          {showEma50 && (
            <span className="flex items-center gap-1.5 text-cyan-400">
              <span className="w-2.5 h-0.5 bg-cyan-400" />
              <span>EMA (50)</span>
            </span>
          )}
        </div>

        <span className="text-[11px] text-slate-500 hidden sm:inline">
          High-performance canvas charting
        </span>
      </div>
    </div>
  );
};
