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
const adminController = require('../controllers/adminController');
const { verifyToken, checkAndRefreshToken, createRateLimiter } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/adminMiddleware');
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
 * POST /api/admin/login - Admin Login Step 1 (Password Verification + Role Check)
 * Only allows users with role 'admin' to proceed
 */
router.post('/admin/login', loginLimiter, authController.loginStep1_admin);

/**
 * POST /api/demo/login - Demo Sandbox Login
 * Bypasses 2FA for instant exploration. Admin credentials only.
 */
router.post('/demo/login', authController.demoLogin);

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
 * POST /api/request-deletion - Request account deletion
 */
router.post('/request-deletion', checkAndRefreshToken, authController.requestDeletion);

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

// ═══════════════════════════════════════════════════════════════════
// ADMIN ROUTES
// ═══════════════════════════════════════════════════════════════════


/**
 * GET /api/admin/stats - System stats
 */
router.get('/admin/stats', checkAndRefreshToken, isAdmin, adminController.getSystemStats);

/**
 * GET /api/admin/logs - System-wide audit logs
 */
router.get('/admin/logs', checkAndRefreshToken, isAdmin, adminController.getSystemLogs);

/**
 * GET /api/admin/users - All users list
 */
router.get('/admin/users', checkAndRefreshToken, isAdmin, adminController.getAllUsers);

/**
 * DELETE /api/admin/users/:userId - Delete a user
 */
router.delete('/admin/users/:userId', checkAndRefreshToken, isAdmin, adminController.deleteUser);

module.exports = router;
