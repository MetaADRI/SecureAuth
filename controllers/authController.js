/**
 * SecureAuth Authentication Controller (Node.js/Express)
 * Complete authentication logic - ALL 4 PHASES
 * 
 * Author: Bwalya Adrian Mange (106-293)
 * Cavendish University Zambia
 */

const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const userModel = require('../models/userModel');
const totpUtils = require('../utils/totpUtils');
const jwtUtils = require('../utils/jwtUtils');
const { insertAuditLog, db } = require('../database/db');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
const MAX_FAILED_ATTEMPTS = parseInt(process.env.MAX_FAILED_ATTEMPTS) || 5;
const LOCKOUT_DURATION_MINUTES = parseInt(process.env.LOCKOUT_DURATION_MINUTES) || 30;

/**
 * PHASE 1 - User Registration with TOTP
 */
async function register(req, res) {
  try {
    const { fullName, email, password } = req.body;

    // Input validation
    if (!fullName || !email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide fullName, email, and password'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address'
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        error: 'Weak password',
        message: 'Password must be at least 8 characters long'
      });
    }

    // Check if email already exists
    const existingUser = await userModel.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'Email already registered',
        message: 'This email address is already associated with an account'
      });
    }

    // Hash password with bcrypt
    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    // Generate TOTP secret
    const secretData = totpUtils.generateSecret();
    const totpSecret = secretData.base32_secret;

    // Generate QR code
    const qrCode = await totpUtils.generateQR(totpSecret, email);

    // Create user in database
    const userId = uuidv4();
    const createdAt = new Date().toISOString();

    await userModel.createUser({
      id: userId,
      full_name: fullName,
      email: email,
      password_hash: passwordHash,
      totp_secret: totpSecret,
      created_at: createdAt
    });

    // Log registration
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    await insertAuditLog(userId, 'register', ipAddress, userAgent);

    console.log(`✓ User registered successfully: ${email}`);

    return res.status(201).json({
      message: 'Registration successful! Scan the QR code with Google Authenticator to complete setup.',
      qrCode: qrCode,
      userId: userId,
      instructions: [
        '1. Open Google Authenticator on your smartphone',
        '2. Tap the "+" button to add a new account',
        '3. Select "Scan a QR code"',
        '4. Scan the QR code displayed above',
        '5. Your SecureAuth account will appear in the app',
        '6. Use the 6-digit code from the app when logging in'
      ]
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      error: 'Registration failed',
      message: 'An error occurred during registration. Please try again.'
    });
  }
}

/**
 * PHASE 2 & 4 - Login Step 1 (Password Verification) with Account Lockout
 */
async function loginStep1_admin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide email and password'
      });
    }

    const user = await userModel.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: Administrator privileges required'
      });
    }

    if (user.locked_until) {
      const lockedUntil = new Date(user.locked_until);
      if (new Date() < lockedUntil) {
        const minutesLeft = Math.ceil((lockedUntil - new Date()) / 60000);
        return res.status(403).json({
          error: 'Account locked',
          message: `Too many failed login attempts. Account is locked for ${minutesLeft} more minutes.`,
          locked_until: user.locked_until,
          minutes_remaining: minutesLeft
        });
      } else {
        await userModel.resetFailedAttempts(user.id);
      }
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      const failedAttempts = await userModel.incrementFailedAttempts(user.id);
      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        await userModel.lockAccount(user.id, LOCKOUT_DURATION_MINUTES);
        return res.status(403).json({
          error: 'Account locked',
          message: `Too many failed login attempts. Your account has been locked for ${LOCKOUT_DURATION_MINUTES} minutes.`,
          attempts_remaining: 0
        });
      }
      const attemptsLeft = MAX_FAILED_ATTEMPTS - failedAttempts;
      return res.status(401).json({
        error: 'Invalid credentials',
        message: `Email or password is incorrect. ${attemptsLeft} attempts remaining before account lockout.`,
        attempts_remaining: attemptsLeft
      });
    }

    await userModel.resetFailedAttempts(user.id);

    const tempToken = jwtUtils.generateTempJWT(user.id, user.email);

    const ipAddress = req.ip || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    await insertAuditLog(user.id, 'login_step1_success', ipAddress, userAgent);

    console.log(`✓ Admin password verified for: ${email}`);

    return res.status(200).json({
      message: 'Password verified. Please enter your 6-digit 2FA code.',
      tempToken: tempToken,
      '2fa_required': true,
      next_step: 'POST /api/verify-2fa with the tempToken in Authorization header'
    });

  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during admin authentication'
    });
  }
}

async function demoLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing fields',
        message: 'Please provide email and password'
      });
    }

    let user = await userModel.findByEmail(email);

    if (!user) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Demo account not found. Contact the administrator.'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Access denied: Administrator privileges required'
      });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect. Try Demo@123'
      });
    }

    await userModel.resetFailedAttempts(user.id);

    const fullToken = jwtUtils.generateFullJWT(user.id, user.email, user.full_name, user.role);
    const accessToken = jwtUtils.generateTempJWT(user.id, user.email);

    const ipAddress = req.ip || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    await insertAuditLog(user.id, 'demo_login', ipAddress, userAgent);

    console.log(`✓ Demo sandbox login: ${email}`);

    return res.status(200).json({
      message: 'Demo sandbox activated. Welcome!',
      tempToken: accessToken,
      accessToken: fullToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role
      },
      '2fa_required': false,
      'demo_mode': true
    });

  } catch (error) {
    console.error('Demo login error:', error);
    return res.status(500).json({
      error: 'Internal server error',
      message: 'An unexpected error occurred during demo login'
    });
  }
}

async function loginStep1(req, res) {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Please provide email and password'
      });
    }

    // Find user
    const user = await userModel.findByEmail(email);

    if (!user) {
      const ipAddress = req.ip || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      await insertAuditLog(null, 'login_attempt_failed', ipAddress, userAgent);

      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Email or password is incorrect'
      });
    }

    // Check if account is locked
    if (user.locked_until) {
      const lockedUntil = new Date(user.locked_until);
      if (new Date() < lockedUntil) {
        const minutesLeft = Math.ceil((lockedUntil - new Date()) / 60000);

        const ipAddress = req.ip || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';
        await insertAuditLog(user.id, 'login_attempt_locked', ipAddress, userAgent);

        return res.status(403).json({
          error: 'Account locked',
          message: `Too many failed login attempts. Account is locked for ${minutesLeft} more minutes.`,
          locked_until: user.locked_until,
          minutes_remaining: minutesLeft
        });
      } else {
        // Lock expired, reset attempts
        await userModel.resetFailedAttempts(user.id);
      }
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      // Increment failed attempts
      const failedAttempts = await userModel.incrementFailedAttempts(user.id);

      const ipAddress = req.ip || 'unknown';
      const userAgent = req.get('User-Agent') || 'unknown';
      await insertAuditLog(user.id, 'login_attempt_failed', ipAddress, userAgent);

      // Lock account if max attempts reached
      if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
        await userModel.lockAccount(user.id, LOCKOUT_DURATION_MINUTES);
        await insertAuditLog(user.id, 'account_locked', ipAddress, userAgent);

        return res.status(403).json({
          error: 'Account locked',
          message: `Too many failed login attempts. Your account has been locked for ${LOCKOUT_DURATION_MINUTES} minutes.`,
          attempts_remaining: 0
        });
      }

      const attemptsLeft = MAX_FAILED_ATTEMPTS - failedAttempts;

      return res.status(401).json({
        error: 'Invalid credentials',
        message: `Email or password is incorrect. ${attemptsLeft} attempts remaining before account lockout.`,
        attempts_remaining: attemptsLeft
      });
    }

    // Password correct - reset failed attempts
    await userModel.resetFailedAttempts(user.id);

    // Generate temporary JWT
    const tempToken = jwtUtils.generateTempJWT(user.id, user.email);

    // Log successful password verification
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';
    await insertAuditLog(user.id, 'login_step1_success', ipAddress, userAgent);

    console.log(`✓ Password verified for: ${email}`);

    return res.status(200).json({
      message: 'Password verified. Please enter your 6-digit 2FA code.',
      tempToken: tempToken,
      '2fa_required': true,
      next_step: 'POST /api/verify-2fa with the tempToken in Authorization header'
    });

  } catch (error) {
    console.error('Login Step 1 error:', error);
    return res.status(500).json({
      error: 'Login failed',
      message: 'An error occurred during login. Please try again.'
    });
  }
}

/**
 * PHASE 2 - TOTP Verification and Full JWT Issuance
 */
async function verifyTOTP(req, res) {
  try {
    const { token: totpCode, code } = req.body;
    const finalCode = totpCode || code;

    if (!finalCode) {
      return res.status(400).json({
        error: 'Missing TOTP code',
        message: 'Please provide the 6-digit code from your authenticator app'
      });
    }

    // Extract and verify temporary JWT
    const authHeader = req.get('Authorization');
    const token = jwtUtils.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        error: 'Missing authorization token',
        message: 'Please provide the tempToken from login step 1 in Authorization header'
      });
    }

    let payload;
    try {
      payload = jwtUtils.verifyJWT(token);
    } catch (error) {
      return res.status(401).json({
        error: 'Invalid or expired token',
        message: error.message
      });
    }

    // Check if temporary token
    if (!payload['2fa_required']) {
      return res.status(401).json({
        error: 'Invalid token type',
        message: 'This endpoint requires a temporary token from login step 1'
      });
    }

    // Get user
    const userId = payload.user_id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'Invalid token'
      });
    }

    // Verify TOTP code
    const isValid = totpUtils.verifyCode(user.totp_secret, finalCode);

    const ipAddress = req.ip || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    if (!isValid) {
      await insertAuditLog(userId, '2fa_fail', ipAddress, userAgent);

      return res.status(401).json({
        error: 'Invalid TOTP code',
        message: 'The code you entered is invalid or has expired. Please try again with a new code from your authenticator app.'
      });
    }

    // TOTP valid - generate full access JWT
    const fullToken = jwtUtils.generateFullJWT(user.id, user.email, user.full_name, user.role);

    // Log successful 2FA and login
    await insertAuditLog(userId, '2fa_success', ipAddress, userAgent);
    await insertAuditLog(userId, 'login_success', ipAddress, userAgent);

    console.log(`✓ 2FA successful for: ${user.email} (Role: ${user.role || 'user'})`);

    return res.status(200).json({
      message: '2FA verification successful. You are now logged in.',
      accessToken: fullToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role || 'user',
        createdAt: user.created_at
      }
    });

  } catch (error) {
    console.error('TOTP verification error:', error);
    return res.status(500).json({
      error: '2FA verification failed',
      message: 'An error occurred during 2FA verification. Please try again.'
    });
  }
}

/**
 * PHASE 2 - Protected Dashboard Route
 */
async function getDashboard(req, res) {
  try {
    // User data attached by middleware
    const userId = req.user.user_id;
    const user = await userModel.findById(userId);

    if (!user) {
      return res.status(401).json({
        error: 'User not found',
        message: 'Invalid token'
      });
    }

    const totalUsers = await userModel.countUsers();

    return res.status(200).json({
      message: 'Welcome to your secure dashboard!',
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        totpEnabled: Boolean(user.totp_enabled),
        createdAt: user.created_at
      },
      stats: {
        totalUsers: totalUsers,
        loginTime: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({
      error: 'Dashboard access failed',
      message: 'An error occurred. Please try again.'
    });
  }
}

/**
 * PHASE 4 - Get Login History
 */
async function getLoginHistory(req, res) {
  try {
    const userId = req.user.user_id;

    const query = `
      SELECT action, ip_address, user_agent, timestamp
      FROM audit_logs
      WHERE user_id = $1 
      AND action IN ('login_success', 'login_attempt_failed', 'login_attempt_locked', '2fa_success', '2fa_fail')
      ORDER BY timestamp DESC
      LIMIT 10
    `;

    const result = await db.query(query, [userId]);
    const rows = result.rows;

    const history = rows.map(row => ({
      action: row.action,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      timestamp: row.timestamp
    }));

    return res.status(200).json({
      loginHistory: history,
      count: history.length
    });

  } catch (error) {
    console.error('Login history error:', error);
    return res.status(500).json({
      error: 'Failed to fetch login history'
    });
  }
}

/**
 * Request account deletion
 */
async function requestDeletion(req, res) {
  try {
    const userId = req.user.user_id;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.get('User-Agent') || 'unknown';

    await insertAuditLog(userId, 'deletion_request', ipAddress, userAgent);

    return res.status(200).json({
      message: 'Deletion request sent successfully'
    });
  } catch (error) {
    console.error('Deletion request error:', error);
    return res.status(500).json({ error: 'Failed to request deletion' });
  }
}

module.exports = {
  register,
  loginStep1,
  loginStep1_admin,
  demoLogin,
  verifyTOTP,
  getDashboard,
  getLoginHistory,
  requestDeletion
};
