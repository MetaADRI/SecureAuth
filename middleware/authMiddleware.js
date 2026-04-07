/**
 * SecureAuth Authentication Middleware (Node.js/Express)
 * JWT verification, rate limiting, and inactivity tracking
 * 
 * Author: Bwalya Adrian Mange (106-293)
 * Cavendish University Zambia
 */

const jwtUtils = require('../utils/jwtUtils');
const rateLimit = require('express-rate-limit');

/**
 * Verify JWT Token Middleware
 */
function verifyToken(req, res, next) {
  try {
    const authHeader = req.get('Authorization');
    const token = jwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        error: 'Missing authorization token',
        message: 'Please provide your access token in Authorization: Bearer <token>'
      });
    }

    // Verify token
    let payload;
    try {
      payload = jwtUtils.verifyJWT(token);
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid or expired token',
        message: error.message
      });
    }

    // Check if full access token
    if (payload['2fa_required']) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'Please complete 2FA verification first'
      });
    }

    // Attach user data to request
    req.user = payload;
    next();

  } catch (error) {
    return res.status(500).json({
      error: 'Authentication failed',
      message: 'An error occurred during authentication'
    });
  }
}

/**
 * PHASE 4 - Check and Refresh Token with Inactivity Tracking
 */
function checkAndRefreshToken(req, res, next) {
  try {
    const authHeader = req.get('Authorization');
    const token = jwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        error: 'Missing authorization token',
        message: 'Please log in again'
      });
    }

    // Verify token
    let payload;
    try {
      payload = jwtUtils.verifyJWT(token);
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid or expired token',
        message: error.message,
        logout_required: true
      });
    }

    // Check if full access token
    if (payload['2fa_required']) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: 'Please complete 2FA verification'
      });
    }

    // Check inactivity
    const inactivity = jwtUtils.checkInactivity(token);

    if (inactivity.inactive) {
      return res.status(401).json({
        error: 'Session expired',
        message: 'Your session has expired due to inactivity (5 minutes)',
        logout_required: true
      });
    }

    // Attach user data
    req.user = payload;

    // If approaching timeout (> 4 minutes), add refresh warning
    if (inactivity.seconds_inactive > 240) {
      req.refresh_warning = {
        seconds_until_logout: 300 - inactivity.seconds_inactive,
        message: 'Session will expire soon due to inactivity'
      };
    }

    next();

  } catch (error) {
    return res.status(500).json({
      error: 'Authentication failed',
      message: error.message
    });
  }
}

/**
 * Rate Limiting Middleware Factory
 */
function createRateLimiter(maxRequests = 5, windowMinutes = 15) {
  return rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max: maxRequests,
    message: {
      error: 'Rate limit exceeded',
      message: `Too many requests. Please try again in ${windowMinutes} minutes.`,
      retry_after: windowMinutes * 60
    },
    standardHeaders: true,
    legacyHeaders: false
  });
}

module.exports = {
  verifyToken,
  checkAndRefreshToken,
  createRateLimiter
};
