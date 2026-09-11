# TradePulse Documentation

Welcome to the comprehensive technical documentation for **TradePulse** — the real-time share market simulator and intraday trading platform for Indian equity markets (BSE, NSE) and commodities (MCX).

---

## Documentation Directory

| Document | Description |
| -------- | ----------- |
| [Architecture](architecture.md) | High-level system design, 60 FPS simulation engine, state management, and real-time event pipeline. |
| [Setup & Deployment](setup.md) | Local environment setup, dependencies, environment configuration, build steps, and production deployment. |
| [Usage & Workflows](usage.md) | Detailed walkthrough of the platform features: Ticker Ribbon, Charts, Intraday Trading, Screener, and Portfolio. |
| [Coding Standards](coding-standards.md) | TypeScript guidelines, component patterns, Tailwind CSS rules, and accessibility standards. |
| [Security Policy](security.md) | Local token handling, security boundaries, private disclosure SLA, & vulnerability disclosure protocols. |
| [Architecture Decisions (ADRs)](adr/0001-record-architecture-decisions.md) | Records of major architectural selections and technology trade-offs. |
| [Project Master Template](project-master-template.md) | Canonical repository master template, release checklists, and file manifest for TradePulse. |
| [Universal Master Template](universal-master-template.md) | Generic repository master template for any software project (Java, Kotlin, TypeScript, Python, C++, HTML static). |

---

## Core Technologies

- **Frontend Framework**: [React 19](https://react.dev/) + [Vite 6](https://vite.dev/)
- **Programming Language**: [TypeScript 5.8](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Data Visualization**: [Recharts 3](https://recharts.org/)
- **Iconography**: [Lucide React](https://lucide.dev/)
- **State & Real-time Engine**: Custom high-frequency in-memory observer engine with local persistence.
