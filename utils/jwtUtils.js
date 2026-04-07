/**
 * SecureAuth JWT Utilities (Node.js/Express)
 * JSON Web Token generation and verification with inactivity tracking
 * 
 * Author: Bwalya Adrian Mange (106-293)
 * Cavendish University Zambia
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret';
const JWT_ALGORITHM = process.env.JWT_ALGORITHM || 'HS256';
const TEMP_JWT_EXPIRY_MINUTES = parseInt(process.env.JWT_TEMP_EXPIRY_MINUTES) || 5;
const FULL_JWT_EXPIRY_HOURS = parseInt(process.env.JWT_FULL_EXPIRY_HOURS) || 24;
const INACTIVITY_TIMEOUT_MINUTES = parseInt(process.env.INACTIVITY_TIMEOUT_MINUTES) || 5;

/**
 * Generate temporary JWT for 2FA flow
 */
function generateTempJWT(userId, email) {
  const payload = {
    user_id: userId,
    email: email,
    '2fa_required': true,
    type: 'temp',
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: `${TEMP_JWT_EXPIRY_MINUTES}m`
  });
}

/**
 * Generate full access JWT with last_activity tracking
 */
function generateFullJWT(userId, email, fullName) {
  const payload = {
    user_id: userId,
    email: email,
    full_name: fullName,
    '2fa_required': false,
    type: 'full',
    last_activity: new Date().toISOString(),
    iat: Math.floor(Date.now() / 1000)
  };

  return jwt.sign(payload, JWT_SECRET, {
    algorithm: JWT_ALGORITHM,
    expiresIn: `${FULL_JWT_EXPIRY_HOURS}h`
  });
}

/**
 * Verify JWT token
 */
function verifyJWT(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: [JWT_ALGORITHM] });
    return decoded;
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else {
      throw error;
    }
  }
}

/**
 * Refresh JWT with updated last_activity
 */
function refreshJWT(token) {
  try {
    const decoded = verifyJWT(token);

    // Check inactivity
    const lastActivity = new Date(decoded.last_activity);
    const timeSinceActivity = Date.now() - lastActivity.getTime();
    const inactivityTimeoutMs = INACTIVITY_TIMEOUT_MINUTES * 60 * 1000;

    if (timeSinceActivity > inactivityTimeoutMs) {
      throw new Error('Session expired due to inactivity');
    }

    // Generate new token with updated last_activity
    const newPayload = {
      user_id: decoded.user_id,
      email: decoded.email,
      full_name: decoded.full_name,
      '2fa_required': false,
      type: 'full',
      last_activity: new Date().toISOString(),
      iat: decoded.iat,
      exp: decoded.exp
    };

    // Sign without adding new exp (keep original)
    return jwt.sign(newPayload, JWT_SECRET, {
      algorithm: JWT_ALGORITHM,
      noTimestamp: true
    });

  } catch (error) {
    throw error;
  }
}

/**
 * Check inactivity status
 */
function checkInactivity(token) {
  try {
    const decoded = verifyJWT(token);
    const lastActivity = new Date(decoded.last_activity);
    const timeSinceActivity = Date.now() - lastActivity.getTime();
    const secondsInactive = Math.floor(timeSinceActivity / 1000);
    const timeoutSeconds = INACTIVITY_TIMEOUT_MINUTES * 60;

    return {
      inactive: secondsInactive > timeoutSeconds,
      seconds_inactive: secondsInactive,
      timeout_seconds: timeoutSeconds
    };
  } catch (error) {
    return {
      inactive: true,
      seconds_inactive: 999999
    };
  }
}

/**
 * Extract token from Authorization header
 */
function extractTokenFromHeader(authHeader) {
  if (!authHeader) return null;

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null;
  }

  return parts[1];
}

module.exports = {
  generateTempJWT,
  generateFullJWT,
  verifyJWT,
  refreshJWT,
  checkInactivity,
  extractTokenFromHeader
};
