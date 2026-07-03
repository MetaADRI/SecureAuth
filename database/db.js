/**
 * SecureAuth Database Module (Node.js/Express)
 * Postgres database initialization and helper functions
 * 
 * Author: Bwalya Adrian Mange (106-293)
 * Cavendish University Zambia
 */

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Use DATABASE_URL for Supabase connection
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false // Required for Supabase/Render
  },
  connectionTimeoutMillis: 5000, // 5s timeout — Vercel cold starts can't wait long
  idleTimeoutMillis: 10000,
  max: 3 // Minimal connections for serverless
});

/**
 * Initialize database with required tables
 */
async function initDatabase() {
  try {
    const client = await pool.connect();
    
    // Create users table with role
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        totp_secret TEXT NOT NULL,
        totp_enabled BOOLEAN DEFAULT TRUE,
        role TEXT DEFAULT 'user',
        created_at TEXT NOT NULL,
        failed_login_attempts INTEGER DEFAULT 0,
        locked_until TEXT,
        last_failed_login TEXT
      )
    `);

    // Ensure role column exists (for existing databases)
    try {
      await client.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT \'user\'');
    } catch (e) {
      // Column might already exist
    }

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
    console.error('❌ Database initialization failed:', err.message || err);

    // On Vercel, log the exact issue so it shows up in function logs
    if (process.env.VERCEL === '1') {
      console.error('[VERCEL COLD START] DB init failed — check DATABASE_URL env var in Vercel dashboard');
    }
  }
}

/**
 * Seed demo sandbox user
 */
async function seedDemoUser() {
  const demoEmail = 'demo@secureauth.com';
  const query = 'SELECT * FROM users WHERE email = $1';

  try {
    const result = await pool.query(query, [demoEmail]);

    if (result.rows.length === 0) {
      const userId = uuidv4();
      const passwordHash = await bcrypt.hash('Demo@123', 12);
      const totpSecret = 'JBSWY3DPEHPK3PXP'; // Standard test secret
      const createdAt = new Date().toISOString();

      await pool.query(`
        INSERT INTO users (id, full_name, email, password_hash, totp_secret, role, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [userId, 'Demo User', demoEmail, passwordHash, totpSecret, 'admin', createdAt]);

      console.log('✓ Demo sandbox user created: demo@secureauth.com / Demo@123');
    }
  } catch (err) {
    console.error('❌ Failed to seed demo user:', err);
  }
}

/**
 * Seed default admin user
 */
async function seedAdminUser() {
  const adminEmail = 'admin@secureauth.com';
  const query = 'SELECT * FROM users WHERE email = $1';
  
  try {
    const result = await pool.query(query, [adminEmail]);

    if (result.rows.length === 0) {
      const userId = uuidv4();
      const passwordHash = await bcrypt.hash('AdminPassword123!', 12);
      const totpSecret = 'KVKFKRCPNZQUYMLXOVZGUYLTKVKFKRCP'; // Fixed secret for demo admin
      const createdAt = new Date().toISOString();

      await pool.query(`
        INSERT INTO users (id, full_name, email, password_hash, totp_secret, role, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `, [userId, 'System Administrator', adminEmail, passwordHash, totpSecret, 'admin', createdAt]);

      console.log('✓ Default admin user created: admin@secureauth.com / AdminPassword123!');
      console.log('  Admin TOTP Secret: ' + totpSecret);
    }
  } catch (err) {
    console.error('❌ Failed to seed admin user:', err);
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

// Prevent silent pool crashes on Vercel serverless
pool.on('error', (err) => {
  console.error('❌ Unexpected Postgres pool error:', err.message);
});

module.exports = {
  initDatabase,
  seedAdminUser,
  seedDemoUser,
  insertAuditLog,
  pool,
  db: {
    query: (text, params) => pool.query(text, params)
  }
};
