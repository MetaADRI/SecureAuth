/**
 * SecureAuth Database Module (Node.js/Express)
 * SQLite database initialization and helper functions
 * 
 * Author: Bwalya Adrian Mange (106-293)
 * Cavendish University Zambia
 */

const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DATABASE_PATH = process.env.DATABASE_PATH || './secureauth.db';

// Create database connection
const db = new Database(DATABASE_PATH);
db.pragma('journal_mode = WAL');

/**
 * Initialize database with required tables
 */
function initDatabase() {
  // Create users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      totp_secret TEXT NOT NULL,
      totp_enabled INTEGER DEFAULT 1,
      created_at TEXT NOT NULL,
      failed_login_attempts INTEGER DEFAULT 0,
      locked_until TEXT,
      last_failed_login TEXT
    )
  `);

  // Create audit_logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      log_id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      ip_address TEXT,
      user_agent TEXT,
      timestamp TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id)
    )
  `);

  console.log('✓ Database initialized successfully');
  console.log(`✓ Database location: ${path.resolve(DATABASE_PATH)}`);
}

/**
 * Insert audit log entry
 */
function insertAuditLog(userId, action, ipAddress = 'unknown', userAgent = 'unknown') {
  const stmt = db.prepare(`
    INSERT INTO audit_logs (log_id, user_id, action, ip_address, user_agent, timestamp)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const logId = uuidv4();
  const timestamp = new Date().toISOString();

  stmt.run(logId, userId, action, ipAddress, userAgent, timestamp);

  return logId;
}

/**
 * Get database connection
 */
function getDb() {
  return db;
}

module.exports = {
  initDatabase,
  insertAuditLog,
  getDb,
  db
};
