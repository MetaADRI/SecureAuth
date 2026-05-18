/**
 * SecureAuth Database Module (Node.js/Express)
 * Postgres database initialization and helper functions
 * 
 * Author: Bwalya Adrian Mange (106-293)
 * Cavendish University Zambia
 */

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');

// Use DATABASE_URL for Supabase connection
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Supabase/Render
  }
});

/**
 * Initialize database with required tables
 */
async function initDatabase() {
  try {
    const client = await pool.connect();
    
    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        totp_secret TEXT NOT NULL,
        totp_enabled BOOLEAN DEFAULT TRUE,
        created_at TEXT NOT NULL,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TEXT,
        last_failed_login TEXT
      )
    `);

    // Create audit_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        log_id TEXT PRIMARY KEY,
        user_id TEXT REFERENCES users(id),
        action TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        timestamp TEXT NOT NULL
      )
    `);

    client.release();
    console.log('✓ Database initialized successfully (Postgres)');
  } catch (err) {
    console.error('❌ Database initialization failed:', err);
  }
}

/**
 * Insert audit log entry
 */
async function insertAuditLog(userId, action, ipAddress = 'unknown', userAgent = 'unknown') {
  const query = `
    INSERT INTO audit_logs (log_id, user_id, action, ip_address, user_agent, timestamp)
    VALUES ($1, $2, $3, $4, $5, $6)
  `;

  const logId = uuidv4();
  const timestamp = new Date().toISOString();

  try {
    await pool.query(query, [logId, userId, action, ipAddress, userAgent, timestamp]);
    return logId;
  } catch (err) {
    console.error('❌ Failed to insert audit log:', err);
    return null;
  }
}

module.exports = {
  initDatabase,
  insertAuditLog,
  pool,
  db: {
    query: (text, params) => pool.query(text, params)
  }
};
