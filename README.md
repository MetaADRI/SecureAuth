# SecureAuth

**Enterprise two-factor authentication (2FA) — TOTP, JWT, DDoS-hardened API, and commercial-grade web UI.**

| | |
|---|---|
| **Stack** | Node.js, Express, PostgreSQL |
| **Author** | Bwalya Adrian Mange (106-293) |
| **Institution** | Cavendish University Zambia |
| **Program** | BSc Computing (Final Year) — Cybersecurity |

---

## Overview

SecureAuth is a full-stack authentication system: users register with email and password, enroll **TOTP** (Google Authenticator–compatible), and sign in with a **two-step** flow (password, then 6-digit code). Sessions use **JWTs** with refresh and **inactivity** checks. The API is wrapped with **Helmet** security headers and a **multi-layer flood-protection** stack (rate limiting, IP tracking, connection limits, request validation, and progressive slow-down).

---

## Features

### Authentication & 2FA

- User registration with validation; **bcrypt** password hashing (configurable cost)
- **TOTP** secret generation (RFC 6238), QR code for authenticator apps
- **Two-step login**: temporary JWT after password → full JWT after TOTP
- **JWT** access and refresh with **inactivity** auto-logout
- **Account lockout** after repeated failed attempts
- **Login history** with IP / user agent audit trail
- Per-endpoint **rate limiting** (login / verify)

### API & Infrastructure Security

- **Helmet** — security headers including CSP tuned for the frontend
- **Flood-oriented middleware** — IP tracking, connection limiting, malformed-request detection, request size limits, slow-down behavior
- **`GET /api/ddos-stats`** — JSON protection statistics snapshot
- CORS enabled for API consumers

### ARIA Academy

- **AI-powered learning platform** for students and developers
- Role-based paths (Student, Developer, Lecturer)
- Interactive lessons, skill trees, and progress tracking
- Dynamic **orb field** background with 3D cursor parallax
- Built with React + Vite

---

## Tech Stack

| Area | Technology |
|------|------------|
| Runtime | Node.js 18+ |
| HTTP | Express 4.x |
| Database | PostgreSQL (Supabase) |
| Crypto / Auth | bcrypt, jsonwebtoken, speakeasy (TOTP), qrcode |
| Limits / Safety | express-rate-limit, express-slow-down |
| Headers | helmet |
| Frontend | Static HTML/CSS/JS + React (ARIA Academy) |

---

## Quick Start

```bash
git clone <your-repo-url>
cd secureauth
npm install
```

Create a **`.env`** in the project root:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=<strong-random-secret>
PORT=3000
```

```bash
npm start
```

Open **http://localhost:3000** — landing page.

Development with auto-restart:

```bash
npm run dev
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing key (required in production) |
| `PORT` | HTTP port (default 3000) |
| `NODE_ENV` | `production` or `development` |
| `BCRYPT_ROUNDS` | Hashing cost (default 12) |
| `MAX_FAILED_ATTEMPTS` | Lockout threshold (default 5) |
| `LOCKOUT_DURATION_MINUTES` | Lockout duration (default 30) |
| `MAX_REQUESTS_PER_MINUTE` | Rate limit (default 60) |
| `TOTP_ISSUER` | Authenticator app issuer name |

---

## API Reference

### Public

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/register` | Register user; returns QR data |
| POST | `/api/login` | Step 1 — password; returns temp token |
| POST | `/api/verify-2fa` | Step 2 — TOTP; returns access token |
| GET | `/api/health` | Liveness / version info |

### Protected (Authorization: `Bearer <accessToken>`)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/dashboard` | Dashboard payload |
| GET | `/api/login-history` | Recent login events |
| POST | `/api/refresh` | Refresh JWT |

### Operations

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/ddos-stats` | Flood-protection statistics |

---

## Project Structure

```
├── server.js
├── package.json
├── .env
├── database/
│   └── db.js
├── controllers/
│   └── authController.js
├── routes/
│   └── authRoutes.js
├── middleware/
│   ├── authMiddleware.js
│   └── ddosMiddleware.js
├── utils/
│   ├── totpUtils.js
│   └── jwtUtils.js
├── phase3-frontend/          # Static web UI
├── ARIA/                     # Academy learning platform (React)
├── public/                   # Legacy static assets
├── test/
│   └── testFullFlow.js
└── secureauth-ddos-protection/
```

---

## Security Notes

- TOTP follows **RFC 6238**; compatible with all authenticator apps.
- Passwords stored as **bcrypt** hashes.
- Use a **strong, unique `JWT_SECRET`** in production.
- Tune rate limits and flood protection for your traffic profile.
- Serve behind **HTTPS** in production.

---

## Author

**Bwalya Adrian Mange** — Student ID: 106-293
Cavendish University Zambia — BSc Computing (Cybersecurity).
