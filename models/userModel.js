/**
 * SecureAuth User Model (Node.js/Express)
 * Database operations for user management
 * 
 * Author: Bwalya Adrian Mange (106-293)
 * Cavendish University Zambia
 */

const { db } = require('../database/db');

/**
 * Find user by email
 */
function findByEmail(email) {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
}

/**
 * Find user by ID
 */
function findById(userId) {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(userId);
}

/**
 * Create new user
 */
function createUser(userData) {
  const stmt = db.prepare(`
    INSERT INTO users (id, full_name, email, password_hash, totp_secret, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    userData.id,
    userData.full_name,
    userData.email,
    userData.password_hash,
    userData.totp_secret,
    userData.created_at
  );

  return findById(userData.id);
}

/**
 * Count total users
 */
function countUsers() {
  const stmt = db.prepare('SELECT COUNT(*) as count FROM users');
  const result = stmt.get();
  return result.count;
}

/**
 * Increment failed login attempts
 */
function incrementFailedAttempts(userId) {
  const stmt = db.prepare(`
    UPDATE users 
    SET failed_login_attempts = failed_login_attempts + 1,
        last_failed_login = ?
    WHERE id = ?
  `);

  stmt.run(new Date().toISOString(), userId);

  const user = findById(userId);
  return user ? user.failed_login_attempts : 0;
}

/**
 * Reset failed login attempts
 */
function resetFailedAttempts(userId) {
  const stmt = db.prepare(`
    UPDATE users 
    SET failed_login_attempts = 0,
        locked_until = NULL,
        last_failed_login = NULL
    WHERE id = ?
  `);

  stmt.run(userId);
}

/**
 * Lock user account
 */
function lockAccount(userId, lockoutDurationMinutes) {
  const lockedUntil = new Date();
  lockedUntil.setMinutes(lockedUntil.getMinutes() + lockoutDurationMinutes);

  const stmt = db.prepare(`
    UPDATE users 
    SET locked_until = ?
    WHERE id = ?
  `);

  stmt.run(lockedUntil.toISOString(), userId);
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  countUsers,
  incrementFailedAttempts,
  resetFailedAttempts,
  lockAccount
};
