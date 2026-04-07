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
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "https://cdn.jsdelivr.net"],
      imgSrc: ["'self'", "data:", "https:"],
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

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

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

// Root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ═══════════════════════════════════════════════════════════════════
// INITIALIZE & START
// ═══════════════════════════════════════════════════════════════════

// Initialize database
initDatabase();

// Start server
app.listen(PORT, () => {
  console.log('\n' + '='.repeat(70));
  console.log('  🔐  SECUREAUTH SERVER RUNNING (Node.js/Express)  🔐');
  console.log('='.repeat(70));
  console.log(`\n✓ Server:        http://localhost:${PORT}`);
  console.log('✓ Framework:     Express + Node.js');
  console.log('\n📋 Available Endpoints:');
  console.log('   POST /api/register       - Register new user with 2FA');
  console.log('   POST /api/login          - Login Step 1 (Password)');
  console.log('   POST /api/verify-2fa     - Login Step 2 (TOTP)');
  console.log('   GET  /api/dashboard      - Protected route');
  console.log('   GET  /api/login-history  - User login history');
  console.log('   POST /api/refresh        - Refresh JWT token');
  console.log('   GET  /api/health         - System health check');
  console.log('   GET  /api/ddos-stats     - DDoS protection statistics');
  console.log('\n🔐 Security Features:');
  console.log('   ✓ TOTP Two-Factor Authentication');
  console.log('   ✓ JWT Session Management');
  console.log('   ✓ Inactivity Auto-Logout (5 minutes)');
  console.log('   ✓ Account Lockout (5 failed attempts)');
  console.log('   ✓ Login History Tracking');
  console.log('   ✓ Rate Limiting');
  console.log('   ✓ bcrypt Password Hashing');
  console.log('\n🛡️  DDoS Protection:');
  console.log('   ✓ Security Headers (Helmet.js)');
  console.log('   ✓ Request Size Limits (100KB)');
  console.log('   ✓ IP-based Auto-Banning');
  console.log('   ✓ Connection Limiting (100 per IP)');
  console.log('   ✓ Progressive Slow-Down');
  console.log('   ✓ Malformed Request Detection');
  console.log('\n' + '='.repeat(70) + '\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down SecureAuth server...');
  process.exit(0);
});

module.exports = app;
