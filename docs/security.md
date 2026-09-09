# Security Policy & Operational Boundaries

This document defines the security architecture, local storage boundaries, API credential handling, and private vulnerability disclosure protocols for **TradePulse**.

---

## 1. Security Architecture & Threat Model

TradePulse operates as an ultra-fast, zero-backend, client-side trading terminal and simulated exchange. 

### Security Boundaries
- **No Secret Persistence in Client State**: TradePulse runs entirely in the user's browser runtime. Under no circumstances are sensitive production credentials, API secrets, or broker authentication tokens persisted in unencrypted client storage.
- **Environment Variables**: All external configuration is loaded via environment variables following `.env.example`. Secrets are never exposed directly to browser builds.
- **Local Storage Isolation**: User-configured state (`tradepulse_holdings`, `tradepulse_ticker_symbols`, `tradepulse_screener_symbols`, and `tradepulse_price_alerts`) is stored within standard browser `localStorage` isolated to the hosting origin.

---

## 2. Supported Versions

Only the latest release of TradePulse receives active security updates and patches.

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

---

## 3. Reporting a Vulnerability

We take the security and integrity of TradePulse seriously. If you discover a security vulnerability or potential exploit, please do not open a public GitHub issue. Instead, report it privately via email:

- **Security Contact**: Soham Ray (`sohamray51@gmail.com`)
- **Subject**: `[SECURITY] TradePulse Vulnerability Report - <Brief Summary>`

### What to Include in Your Report
Please provide as much relevant information as possible to help us reproduce and resolve the issue quickly:
1. Description of the vulnerability and its potential impact.
2. Step-by-step instructions to reproduce the issue (including sample payloads or configurations if applicable).
3. Component(s) affected (e.g., market simulation engine, order management, storage, client UI).
4. Any proposed fixes or mitigations.

### Response SLA (Service Level Agreement)
- **Initial Response**: Within 48 hours of report receipt.
- **Triage & Confirmation**: Within 5 business days.
- **Fix & Public Advisory**: Once a verified patch is deployed to production and tagged in accordance with our release management standards.
