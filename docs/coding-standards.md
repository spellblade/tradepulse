# Coding Standards & Best Practices

This document outlines the coding standards, TypeScript conventions, and design patterns required for **TradePulse**.

---

## 1. TypeScript & Type Safety

- **Strict Type Checking**: Always maintain `strict: true` compliance in `tsconfig.json`.
- **No `any`**: Explicitly declare interfaces or types. Use `unknown` with type guards if dynamic input is received.
- **Single Source of Truth**: All shared domain models must be defined in `src/types.ts`:
  - `StockSymbol`
  - `MarketExchange` (`'BSE' | 'NSE' | 'MCX'`)
  - `MarketIndex`
  - `IntradayTrade`
  - `PortfolioHolding`
  - `VolatilityAlert`
- **Enums & Unions**: Prefer TypeScript string union types (e.g. `'BUY' | 'SELL'`) over numeric enums for clear serializability.

---

## 2. React Patterns & State Management

- **Functional Components**: Use functional components with React hooks.
- **Observer Integration**: When subscribing to `marketEngine`, always return an unsubscription cleanup function inside `useEffect`:
  ```typescript
  useEffect(() => {
    const handleUpdate = () => {
      // update state
    };
    const unsubscribe = marketEngine.subscribe(handleUpdate);
    return () => unsubscribe();
  }, []);
  ```
- **Component Modularity**: Avoid monolithic component files. Extract complex modals, popovers, and tables into separate files inside `src/components/`.
- **Memoization**: Use `useMemo` for computationally expensive data transformations (e.g., technical indicator histories and screener filtering).

---

## 3. Styling & Theming (Tailwind CSS)

- **Utility Classes**: Use Tailwind CSS utility classes exclusively. Avoid raw CSS files or inline `style` attributes.
- **Fintech Dark Palette**:
  - App Canvas: `bg-slate-950`
  - Cards & Containers: `bg-slate-900`
  - Borders: `border-slate-800`
  - Text Primary: `text-white` or `text-slate-100`
  - Text Secondary: `text-slate-400`
  - Market Bull (Positive): `text-emerald-400`, `bg-emerald-600`
  - Market Bear (Negative): `text-rose-400`, `bg-rose-600`
- **Exchange Badges**:
  - BSE: Blue tone (`bg-blue-500/20 text-blue-300 border-blue-500/40`)
  - NSE: Amber tone (`bg-amber-500/20 text-amber-300 border-amber-500/40`)
  - MCX: Emerald tone (`bg-emerald-500/20 text-emerald-300 border-emerald-500/40`)

---

## 4. Accessibility & Interaction

- **Touch Targets**: Buttons and actionable controls must have a minimum interactive height of 36px–44px.
- **Hover & Focus States**: All interactive elements must provide distinct `:hover`, `:active`, and focus indicator styling (`focus:outline-none focus:ring-2 focus:ring-indigo-500`).
- **Meaningful IDs**: Interactive buttons and form inputs should specify unique `id` attributes for testing and automation.

---

## 5. Automated Testing & Tagging Conventions

In accordance with Model D testing topology standards:
- **`Unit`**: Pure deterministic logic tests with zero network or external dependencies (e.g., technical indicator formulas, directory integrity, simulation speed settings).
- **`Integration`**: Tests verifying observer lifecycles, timer throttling, or local storage serialization.
- **Test Command**: All tests are run via `npm test` (`tsx --test --test-force-exit tests/**/*.test.ts`).

---

## 6. Verification Checklist Before Commits

Before submitting a PR or pushing changes:
1. `npm run lint`: Confirm zero TypeScript compiler warnings or errors.
2. `npm test`: Confirm all automated unit and integration tests pass with 0 failures.
3. `npm run build`: Verify the Vite production bundle builds successfully without asset warnings.
4. Test layout responsiveness across both mobile (375px) and desktop (1280px+) widths.
