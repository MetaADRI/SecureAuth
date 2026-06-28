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
async function findByEmail(email) {
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

/**
 * Find user by ID
 */
async function findById(userId) {
  const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
  return result.rows[0];
}

/**
 * Create new user
 */
async function createUser(userData) {
  const query = `
    INSERT INTO users (id, full_name, email, password_hash, totp_secret, role, created_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const result = await db.query(query, [
    userData.id,
    userData.full_name,
    userData.email,
    userData.password_hash,
    userData.totp_secret,
    userData.role || 'user',
    userData.created_at
  ]);

  return result.rows[0];
}

/**
 * Get all users
 */
async function getAllUsers() {
  const result = await db.query('SELECT id, full_name, email, role, created_at FROM users ORDER BY created_at DESC');
  return result.rows;
}

/**
 * Delete user
 */
async function deleteUser(userId) {
  // First delete related audit logs
  await db.query('DELETE FROM audit_logs WHERE user_id = $1', [userId]);
  const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING *', [userId]);
  return result.rows[0];
}

/**
 * Count total users
 */
async function countUsers() {
  const result = await db.query('SELECT COUNT(*) as count FROM users');
  return parseInt(result.rows[0].count);
}

/**
 * Increment failed login attempts
 */
async function incrementFailedAttempts(userId) {
  const query = `
    UPDATE users 
    SET failed_login_attempts = failed_login_attempts + 1,
        last_failed_login = $1
    WHERE id = $2
    RETURNING failed_login_attempts
  `;

  const result = await db.query(query, [new Date().toISOString(), userId]);
  return result.rows[0] ? result.rows[0].failed_login_attempts : 0;
}

/**
 * Reset failed login attempts
 */
async function resetFailedAttempts(userId) {
  const query = `
    UPDATE users 
    SET failed_login_attempts = 0,
        locked_until = NULL,
        last_failed_login = NULL
    WHERE id = $1
  `;

  await db.query(query, [userId]);
}

/**
 * Lock user account
 */
async function lockAccount(userId, lockoutDurationMinutes) {
  const lockedUntil = new Date();
  lockedUntil.setMinutes(lockedUntil.getMinutes() + lockoutDurationMinutes);

  const query = `
    UPDATE users 
    SET locked_until = $1
    WHERE id = $2
  `;

  await db.query(query, [lockedUntil.toISOString(), userId]);
}

module.exports = {
  findByEmail,
  findById,
  createUser,
  getAllUsers,
  deleteUser,
  countUsers,
  incrementFailedAttempts,
  resetFailedAttempts,
  lockAccount
};
