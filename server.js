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

// Import routes
const authRoutes = require('./routes/authRoutes');

// Import database initialization
const { initDatabase, seedAdminUser } = require('./database/db');

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
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net", "https://cdn.tailwindcss.com", "https://unpkg.com"],
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

// Request tracing (no secrets): helps prove which frontend is actually served.
app.use((req, res, next) => {
  next();
});

// Serve static frontend files (Phase 3 UI)
const PHASE3_FRONTEND_DIR = path.join(__dirname, 'phase3-frontend');
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
  res.sendFile(path.join(PHASE3_FRONTEND_DIR, 'index.html'));
});

// Initialize database and start server
async function startServer() {
  await initDatabase();
  await seedAdminUser();

  app.listen(PORT, () => {
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
    console.log('   GET  /api/flood-stats     - Protection stats');
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
}

startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down SecureAuth server...');
  process.exit(0);
});

module.exports = app;
