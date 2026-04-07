# SecureAuth — Short summary

**SecureAuth** (v2.1.0) is a full-stack **two-factor authentication** system for **Node.js**. Users register, scan a **TOTP** QR code (Google Authenticator–compatible), and sign in in two steps: **password**, then **6-digit code**. Sessions use **JWTs** with refresh and configurable **inactivity** logout; failed logins can trigger **account lockout** and **login history** is recorded for auditing.

The **REST API** is hardened with **Helmet** (security headers, CSP) and **DDoS-oriented middleware**: rate limiting, IP tracking, connection limits, request-size checks, malformed-request detection, and slow-down. A **`GET /api/ddos-stats`** endpoint exposes protection statistics.

The **web UI** is static **HTML/CSS/JS** in **`phase3-frontend/`** (landing, register, login, verify, dashboard), served by Express at **`http://localhost:3000`**. Data is stored in **SQLite** via **better-sqlite3**; passwords are hashed with **bcrypt**.

**Author:** Bwalya Adrian Mange (106-293), Cavendish University Zambia — BSc Computing (Final Year), Cybersecurity.

**Quick start:** `npm install` → configure `.env` (especially `JWT_SECRET` in production) → `npm start` → open the app in a browser.

For API tables, folder layout, troubleshooting, and GitHub notes, see **[README.md](./README.md)**.
