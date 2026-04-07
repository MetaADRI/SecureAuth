/**
 * SecureAuth Authentication Routes (Node.js/Express)
 * API endpoint definitions - ALL 4 PHASES
 * 
 * Author: Bwalya Adrian Mange (106-293)
 * Cavendish University Zambia
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, checkAndRefreshToken, createRateLimiter } = require('../middleware/authMiddleware');
const jwtUtils = require('../utils/jwtUtils');

// Create rate limiters
const loginLimiter = createRateLimiter(5, 15);  // 5 attempts per 15 minutes

/**
 * POST /api/register - User Registration
 */
router.post('/register', authController.register);

/**
 * POST /api/login - Login Step 1 (Password Verification)
 * PHASE 2 & 4: With account lockout
 */
router.post('/login', loginLimiter, authController.loginStep1);

/**
 * POST /api/verify-2fa - Login Step 2 (TOTP Verification)
 * PHASE 2
 */
router.post('/verify-2fa', loginLimiter, authController.verifyTOTP);

/**
 * GET /api/dashboard - Protected Dashboard
 * PHASE 2 & 4: With inactivity checking
 */
router.get('/dashboard', checkAndRefreshToken, authController.getDashboard);

/**
 * GET /api/login-history - User Login History
 * PHASE 4
 */
router.get('/login-history', checkAndRefreshToken, authController.getLoginHistory);

/**
 * POST /api/refresh - Refresh JWT Token
 * PHASE 4: Inactivity tracking
 */
router.post('/refresh', (req, res) => {
  try {
    const authHeader = req.get('Authorization');
    const token = jwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({ error: 'Missing token' });
    }

    // Check inactivity
    const inactivity = jwtUtils.checkInactivity(token);

    if (inactivity.inactive) {
      return res.status(401).json({
        error: 'Session expired',
        message: 'Your session has expired due to inactivity'
      });
    }

    // Refresh token
    const newToken = jwtUtils.refreshJWT(token);

    return res.status(200).json({
      accessToken: newToken,
      message: 'Token refreshed successfully'
    });

  } catch (error) {
    return res.status(401).json({ error: error.message });
  }
});

/**
 * GET /api/health - Health Check
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'SecureAuth API is running',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    framework: 'Express/Node.js',
    phase: 'All 4 Phases Complete',
    features: [
      'TOTP Two-Factor Authentication',
      'JWT Session Management',
      'Inactivity Auto-Logout (5 minutes)',
      'Account Lockout (5 failed attempts)',
      'Login History Tracking',
      'Rate Limiting',
      'bcrypt Password Hashing'
    ]
  });
});

module.exports = router;
