# Setup & Deployment Guide

This guide provides instructions for setting up, running, building, and deploying TradePulse.

---

## 1. Prerequisites

Ensure your development environment meets the following requirements:

- **Node.js**: `v18.0.0` or later (`v20.x` or `v22.x` LTS recommended).
- **npm**: `v9.0.0` or later.
- **Git**: Modern version for version control.

Verify your installed versions:
```bash
node -v
npm -v
git --version
```

---

## 2. Local Development Setup

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/sohamray/tradepulse.git
   cd tradepulse
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` if custom overrides are needed:
   ```bash
   cp .env.example .env
   ```

4. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application dev server starts at `http://localhost:3000`.

---

## 3. Available Scripts

| Command | Purpose |
| ------- | ------- |
| `npm run dev` | Starts Vite development server at `0.0.0.0:3000`. |
| `npm run build` | Compiles production assets into `dist/`. |
| `npm run preview` | Locally serves the production build. |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`). |
| `npm test` | Runs automated unit & integration test suite (`tests/`). |
| `npm run clean` | Deletes build artifacts (`dist/`). |

---

## 4. Production Build

To produce an optimized production bundle:

```bash
npm run build
```

This generates:
- Minified JavaScript and CSS bundles with content hashing inside `dist/`.
- Optimized SVG assets and HTML entry points.

You can preview the built application locally with:
```bash
npm run preview
```

---

## 5. Deployment Options

### Container / Cloud Run Deployment

TradePulse is container-ready. The container binds to port `3000` via Vite or an Express static server:

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

### Static Hosting (Vercel / Netlify / GitHub Pages)

TradePulse compiles to a purely static client-side single-page application (SPA):
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **SPA Routing**: Ensure standard fallback routing rules redirect `/*` to `/index.html`.
