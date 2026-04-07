# SecureAuth

**Enterprise two-factor authentication (2FA) for Node.js — TOTP, JWT, DDoS-hardened API, and a commercial-grade web UI.**

| | |
|---|---|
| **Version** | 2.1.0 |
| **Stack** | Node.js, Express, SQLite |
| **Author** | Bwalya Adrian Mange (106-293) |
| **Institution** | Cavendish University Zambia |
| **Program** | BSc Computing (Final Year) — Cybersecurity |

---

## Overview

SecureAuth is a full-stack authentication system: users register with email and password, enroll **TOTP** (Google Authenticator–compatible), and sign in with a **two-step** flow (password, then 6-digit code). Sessions use **JWTs** with refresh and **inactivity** checks. The API is wrapped with **Helmet** security headers and a **multi-layer DDoS protection** stack (rate limiting, IP tracking, connection limits, request validation, and progressive slow-down).

The **default web app** served at `http://localhost:3000` lives in **`phase3-frontend/`** (five HTML pages, shared CSS/JS). A **`public/`** folder may still exist in the repo for reference or alternate layouts; the running server is configured to serve **`phase3-frontend`** so you always see the intended commercial UI.

---

## Features

### Authentication and 2FA

- User registration with validation; **bcrypt** password hashing (configurable cost)
- **TOTP** secret generation (RFC 6238), QR code for authenticator apps
- **Two-step login**: temporary JWT after password → full JWT after TOTP
- **JWT** access and refresh; **inactivity** auto-logout (configurable)
- **Account lockout** after repeated failed attempts (configurable)
- **Login history** (audit trail with IP / user agent where applicable)
- Per-endpoint **rate limiting** (e.g. login / verify)

### API and infrastructure security

- **Helmet** — security headers including Content Security Policy (CSP) tuned for the frontend (CDNs, fonts, inline scripts where required)
- **DDoS-oriented middleware** — IP tracking, connection limiting, malformed-request detection, request size limits, slow-down behavior
- **`GET /api/ddos-stats`** — JSON snapshot of protection statistics (for monitoring or demos)
- CORS enabled for API consumers

### Frontend (Phase 3 — commercial UI)

- **`index.html`** — Landing / marketing: hero, features, how-it-works, stats, footer (Cavendish blue palette **#003366** / **#0066CC**)
- **`register.html`** — Registration, QR setup after success
- **`login.html`** — Password step (step 1 of 2FA)
- **`verify.html`** — TOTP entry (step 2)
- **`dashboard.html`** — Protected dashboard (profile, stats, login history when wired to API)
- Shared **`css/style.css`** and **`js/auth.js`** (client helpers, token handling patterns)
- Responsive layout; scroll/fade-style enhancements where implemented in markup

---

## Tech stack

| Area | Technology |
|------|------------|
| Runtime | Node.js 18+ |
| HTTP | Express 4.x |
| Database | SQLite via **better-sqlite3** |
| Crypto / auth | bcrypt, jsonwebtoken, speakeasy (TOTP), qrcode |
| Limits / safety | express-rate-limit, express-slow-down |
| Headers | helmet |
| Frontend | Static HTML/CSS/JS (`phase3-frontend`) |

---

## Prerequisites

- **Node.js** ≥ 18 and **npm**
- No separate database server (SQLite file is created locally)

---

## Quick start

```bash
git clone <your-repo-url>
cd <project-folder>
npm install
```

Create a **`.env`** in the project root (see below). Defaults are often enough for local development.

```bash
npm start
```

Open **http://localhost:3000** — you should get the landing page from **`phase3-frontend/index.html`**.

Development with auto-restart:

```bash
npm run dev
```

End-to-end API flow (optional):

```bash
npm test
```

---

## Environment variables

Copy from `.env.example` if you add one, or set at least:

| Variable | Purpose |
|----------|---------|
| `PORT` | HTTP port (default `3000`) |
| `JWT_SECRET` | **Required in production** — signing key for JWTs |
| `INACTIVITY_TIMEOUT_MINUTES` | Session inactivity window |
| `MAX_FAILED_ATTEMPTS` / `LOCKOUT_DURATION_MINUTES` | Lockout policy |
| `MAX_REQUEST_SIZE` | Body size cap (e.g. `100kb`) |

**Never commit real secrets.** This repo’s `.gitignore` excludes `.env` and `*.db` files.

---

## API reference

### Public

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/register` | Register user; returns QR data as designed by controller |
| POST | `/api/login` | Step 1 — password; returns temp token for 2FA |
| POST | `/api/verify-2fa` | Step 2 — TOTP; returns access token |
| GET | `/api/health` | Liveness / version info |

### Protected (Authorization: `Bearer <accessToken>`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard` | Dashboard payload |
| GET | `/api/login-history` | Recent login events |
| POST | `/api/refresh` | Refresh JWT (respects inactivity rules) |

### Operations / monitoring

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ddos-stats` | DDoS protection statistics JSON |

---

## Project structure

```
├── server.js                 # Express app: static UI, API, Helmet, DDoS middleware
├── package.json
├── .env                      # Local secrets (gitignored)
├── .gitignore
│
├── database/
│   └── db.js                 # SQLite init & helpers
├── models/
├── controllers/
│   └── authController.js
├── routes/
│   └── authRoutes.js
├── middleware/
│   ├── authMiddleware.js     # JWT, rate limits, refresh
│   └── ddosMiddleware.js     # DDoS protection layers
├── utils/
│   ├── totpUtils.js
│   └── jwtUtils.js
│
├── phase3-frontend/          # Default UI served at /
│   ├── index.html
│   ├── register.html
│   ├── login.html
│   ├── verify.html
│   ├── dashboard.html
│   ├── css/style.css
│   └── js/auth.js
│
├── public/                   # Optional / legacy static assets (not served by default)
├── test/
│   └── testFullFlow.js
└── secureauth-ddos-protection/  # Related DDoS package / docs (if present)
```

---

## Database

SQLite files (`secureauth.db` and related `-shm`/`-wal`) are created at runtime. They are **gitignored** by default. Schema includes users (credentials, TOTP, lockout fields) and audit/login history as implemented in `database/db.js` and models.

---

## Security notes (for defense or production)

- TOTP follows **RFC 6238**; compatible with common authenticator apps.
- Passwords stored as **bcrypt** hashes — not plaintext.
- Use a **strong, unique `JWT_SECRET`** in any shared or production environment.
- Tune **rate limits** and DDoS settings in middleware for your traffic profile.
- Serve behind **HTTPS** in production; configure CSP and CORS for your real origin.

---

## Troubleshooting

| Issue | What to try |
|-------|-------------|
| **Port 3000 in use** | Set `PORT` in `.env` or stop the other process |
| **UI looks like an old/simple page** | Confirm you are hitting the same server that serves `phase3-frontend`; hard-refresh the browser; avoid opening HTML via `file://` |
| **Styles/scripts blocked** | Check browser devtools console; CSP is set in Helmet — CDNs and inline scripts must match policy |
| **`better-sqlite3` install errors** | Use a supported Node version; run `npm install` again; on Windows, ensure build tools if native compile is required |
| **QR code missing** | Verify `/api/register` response and network tab; ensure server logs show no errors |

---

## License

MIT — see repository license file if included.

---

## Author

**Bwalya Adrian Mange** — Student ID: 106-293 — Cavendish University Zambia — BSc Computing (Cybersecurity).

---

## Pushing to GitHub

1. Create the repo on GitHub (empty or with README is fine).
2. Locally: `git init`, `git add .`, `git commit -m "Initial commit"`.
3. `git remote add origin https://github.com/<user>/<repo>.git`
4. `git branch -M main` and `git push -u origin main`

Ensure `.env` and `*.db` are **not** committed (already in `.gitignore`). Consider adding a **`.env.example`** with dummy values for collaborators.
