/**
 * SecureAuth Server (Node.js/Express) - WITH DDOS PROTECTION
 * Enterprise Two-Factor Authentication System
 * 
 * Author: Bwalya Adrian Mange (106-293)
 * Institution: Cavendish University Zambia
 * Project: BSc Computing Final Year - Cybersecurity
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');

// #region agent log
function agentLog({ runId, hypothesisId, message, data }) {
  fetch('http://127.0.0.1:7570/ingest/a233dc04-66d7-477f-97c4-8eefdbf15188', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'eb757f' },
    body: JSON.stringify({
      sessionId: 'eb757f',
      runId,
      hypothesisId,
      location: 'server.js:agentLog',
      message,
      data,
      timestamp: Date.now(),
    }),
  }).catch(() => {});
}
// #endregion

// Import routes
const authRoutes = require('./routes/authRoutes');

// Import database initialization
const { initDatabase } = require('./database/db');

// Import DDoS protection middleware
const ddos = require('./middleware/ddosMiddleware');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ═══════════════════════════════════════════════════════════════════
// DDOS PROTECTION LAYER
// ═══════════════════════════════════════════════════════════════════

// 1. Security headers (helmet.js)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdn.tailwindcss.com"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "http://localhost:*", "https://localhost:*"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// 2. IP tracking and auto-banning
app.use(ddos.trackAndBlockIP);

// 3. Connection limiting
app.use(ddos.connectionLimiter);

// 4. Malformed request detection
app.use(ddos.malformedRequestDetector);

// 5. Request size validation
app.use(ddos.validateRequestSize);

// ═══════════════════════════════════════════════════════════════════
// STANDARD MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════

app.use(cors());
app.use(express.json({ limit: process.env.MAX_REQUEST_SIZE || '100kb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.MAX_REQUEST_SIZE || '100kb' }));

// #region agent log
// Request tracing (no secrets): helps prove which frontend is actually served.
app.use((req, res, next) => {
  const url = req.originalUrl || req.url;

  // Only log likely-frontend requests to keep noise low
  const isFrontendish =
    url === '/' ||
    url.endsWith('.html') ||
    url.endsWith('.css') ||
    url.endsWith('.js') ||
    url.startsWith('/css/') ||
    url.startsWith('/js/');

  if (isFrontendish) {
    agentLog({
      runId: 'pre-fix',
      hypothesisId: 'H1',
      message: 'Incoming request (frontendish)',
      data: { method: req.method, url },
    });
  }

  res.on('finish', () => {
    if (isFrontendish) {
      agentLog({
        runId: 'pre-fix',
        hypothesisId: 'H1',
        message: 'Response finished (frontendish)',
        data: {
          method: req.method,
          url,
          statusCode: res.statusCode,
          contentType: res.getHeader('content-type') || null,
          contentLength: res.getHeader('content-length') || null,
          cacheControl: res.getHeader('cache-control') || null,
        },
      });
    }
  });

  next();
});
// #endregion

// Serve static frontend files (Phase 3 UI)
const PHASE3_FRONTEND_DIR = path.join(__dirname, 'phase3-frontend');
// #region agent log
agentLog({
  runId: 'pre-fix',
  hypothesisId: 'H2',
  message: 'Configured static frontend directory',
  data: { PHASE3_FRONTEND_DIR },
});
// #endregion
app.use(express.static(PHASE3_FRONTEND_DIR));

// Note: we intentionally do NOT serve the legacy `public/` UI to avoid
// accidentally showing a different frontend than `phase3-frontend`.

// ═══════════════════════════════════════════════════════════════════
// API ROUTES
// ═══════════════════════════════════════════════════════════════════

app.use('/api', authRoutes);

// DDoS Protection Stats Endpoint
app.get('/api/ddos-stats', (req, res) => {
  const stats = ddos.getProtectionStats();
  res.json({
    message: 'DDoS Protection Statistics',
    ...stats,
    timestamp: new Date().toISOString()
  });
});

// Root route - serve index.html
app.get('/', (req, res) => {
  // #region agent log
  agentLog({
    runId: 'pre-fix',
    hypothesisId: 'H2',
    message: 'Root route sendFile',
    data: { file: path.join(PHASE3_FRONTEND_DIR, 'index.html') },
  });
  // #endregion
  res.sendFile(path.join(PHASE3_FRONTEND_DIR, 'index.html'));
});

// Initialize database
initDatabase();

// Start server
app.listen(PORT, () => {
  // #region agent log
  agentLog({
    runId: 'pre-fix',
    hypothesisId: 'H3',
    message: 'Server started',
    data: { port: PORT, pid: process.pid, node: process.version },
  });
  // #endregion
  console.log('\n' + '='.repeat(70));
  console.log('  🔐  SECUREAUTH SERVER RUNNING (Node.js/Express)  🔐');
  console.log('='.repeat(70));
  console.log(`\n✓ Server:        http://localhost:${PORT}`);
  console.log('✓ Framework:     Express + Node.js');
  console.log('✓ Version:       2.1.0 (With DDoS Protection)');
  console.log('\n📋 Available Endpoints:');
  console.log('   POST /api/register       - Register new user with 2FA');
  console.log('   POST /api/login          - Login Step 1 (Password)');
  console.log('   POST /api/verify-2fa     - Login Step 2 (TOTP)');
  console.log('   GET  /api/dashboard      - Protected route');
  console.log('   GET  /api/login-history  - User login history');
  console.log('   POST /api/refresh        - Refresh JWT token');
  console.log('   GET  /api/health         - System health check');
  console.log('   GET  /api/ddos-stats     - DDoS protection stats');
  console.log('\n🔐 Security Features:');
  console.log('   ✓ TOTP Two-Factor Authentication');
  console.log('   ✓ JWT Session Management');
  console.log('   ✓ Inactivity Auto-Logout (5 minutes)');
  console.log('   ✓ Account Lockout (5 failed attempts)');
  console.log('   ✓ Login History Tracking');
  console.log('   ✓ Rate Limiting');
  console.log('   ✓ bcrypt Password Hashing');
  console.log('\n🛡️  DDoS Protection (6 Layers):');
  console.log('   ✓ Security Headers (Helmet.js)');
  console.log('   ✓ Request Size Limits (100KB max)');
  console.log('   ✓ IP-Based Auto-Banning (100 req/min limit)');
  console.log('   ✓ Connection Limiting (100 per IP)');
  console.log('   ✓ Malformed Request Detection');
  console.log('   ✓ Progressive Slow-Down');
  console.log('\n' + '='.repeat(70) + '\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down SecureAuth server...');
  process.exit(0);
});

module.exports = app;
