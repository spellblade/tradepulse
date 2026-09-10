import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, type Plugin} from 'vite';

/**
 * In-memory quote representation stored in Node.js server RAM.
 */
interface CachedQuote {
  price: number;
  previousClose: number;
  change: number;
  changePercent: number;
  dayHigh: number;
  dayLow: number;
  volume: number;
  timestamp: number;
}

/**
 * Vite Dev & Preview In-Memory Market Aggregator Plugin.
 * Caches quotes for all Indian benchmark indices, equities, and MCX commodities in server RAM.
 * Exposes GET /api/market/quotes responding in <5ms, completely replacing 25 individual client HTTP roundtrips.
 */
function marketAggregatorPlugin(): Plugin {
  const quoteCache = new Map<string, CachedQuote>();
  let isUpdating = false;
  let lastUpdateTime = 0;

  const TRACKED_SYMBOLS = [
    '^BSESN', '^NSEI', '^INDIAVIX',
    'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'ICICIBANK.NS',
    'BHARTIARTL.NS', 'SUNPHARMA.NS', 'MARUTI.NS', 'BAJFINANCE.NS', 'WIPRO.NS',
    'ADANIENT.NS', 'AXISBANK.NS', 'KOTAKBANK.NS', 'BOMDYEING.BO', 'TATAMOTORS.NS',
    'ITC.NS', 'LT.NS', 'SBIN.NS',
    'GC=F', 'SI=F', 'CL=F', 'NG=F', 'HG=F',
  ];

  async function fetchTicker(ticker: string): Promise<void> {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(ticker)}?range=1d&interval=1d&includePrePost=false`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'application/json',
        },
      });
      if (!res.ok) return;

      const data = (await res.json()) as any;
      const meta = data?.chart?.result?.[0]?.meta;
      if (!meta) return;

      const price = meta.regularMarketPrice ?? meta.chartPreviousClose ?? 0;
      const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
      const change = Number((price - previousClose).toFixed(2));
      const changePercent = previousClose > 0 ? Number(((change / previousClose) * 100).toFixed(2)) : 0;
      const dayHigh = meta.regularMarketDayHigh ?? price;
      const dayLow = meta.regularMarketDayLow ?? price;
      const volume = meta.regularMarketVolume ?? 0;

      quoteCache.set(ticker, {
        price,
        previousClose,
        change,
        changePercent,
        dayHigh,
        dayLow,
        volume,
        timestamp: meta.regularMarketTime ? meta.regularMarketTime * 1000 : Date.now(),
      });
    } catch {
      // Retain existing cached quote silently on network glitch
    }
  }

  async function updateAllQuotes(): Promise<void> {
    if (isUpdating) return;
    isUpdating = true;
    try {
      const chunkSize = 8;
      for (let i = 0; i < TRACKED_SYMBOLS.length; i += chunkSize) {
        const chunk = TRACKED_SYMBOLS.slice(i, i + chunkSize);
        await Promise.all(chunk.map((s) => fetchTicker(s)));
      }
      lastUpdateTime = Date.now();
    } finally {
      isUpdating = false;
    }
  }

  const handleAggregatorRequest = async (req: any, res: any, next: any) => {
    const url = req.url || '';
    if (url.startsWith('/api/market/quotes')) {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (quoteCache.size === 0) {
        await updateAllQuotes();
      }

      const quotesObj: Record<string, CachedQuote> = {};
      for (const [key, val] of quoteCache.entries()) {
        quotesObj[key] = val;
      }

      res.statusCode = 200;
      res.end(
        JSON.stringify({
          status: 'ok',
          source: 'memory-cache',
          count: quoteCache.size,
          lastUpdateTime,
          quotes: quotesObj,
        })
      );
      return;
    }
    next();
  };

  return {
    name: 'market-aggregator-plugin',
    configureServer(server) {
      updateAllQuotes();
      const interval = setInterval(() => {
        updateAllQuotes();
      }, 3000);
      if (interval && typeof interval.unref === 'function') {
        interval.unref();
      }

      server.middlewares.use(handleAggregatorRequest);
    },
    configurePreviewServer(server) {
      updateAllQuotes();
      server.middlewares.use(handleAggregatorRequest);
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), marketAggregatorPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api/market': {
          target: 'https://query1.finance.yahoo.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/market/, ''),
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        },
      },
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            recharts: ['recharts'],
            lucide: ['lucide-react'],
          },
        },
      },
    },
  };
});
