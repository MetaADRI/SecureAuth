/**
 * SecureAuth Admin Controller (Node.js/Express)
 * Admin dashboard and user management logic
 * 
 * Author: Bwalya Adrian Mange (106-293)
 * Cavendish University Zambia
 */

const userModel = require('../models/userModel');
const { db, insertAuditLog } = require('../database/db');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

/**
 * Get system-wide audit logs
 */
async function getSystemLogs(req, res) {
  try {
    const query = `
      SELECT al.log_id, al.action, al.ip_address, al.user_agent, al.timestamp, u.email, u.full_name
      FROM audit_logs al
      LEFT JOIN users u ON al.user_id = u.id
      ORDER BY al.timestamp DESC
      LIMIT 100
    `;

    const result = await db.query(query);
    
    return res.status(200).json({
      logs: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error fetching system logs:', error);
    return res.status(500).json({ error: 'Failed to fetch logs' });
  }
}

/**
 * Get all users
 */
async function getAllUsers(req, res) {
  try {
    const users = await userModel.getAllUsers();

    // Enrich users with progress fields (defaults for non-students)
    const enriched = users.map(u => ({
      id: u.id,
      full_name: u.full_name,
      email: u.email,
      role: u.role,
      created_at: u.created_at,
      enrolled_path: u.enrolled_path || null,
      rank: u.rank || 'Cyber Cadet',
      xp: u.xp || 0,
      lessonsCompleted: u.lessons_completed || 0,
      streak: u.streak || 0
    }));

    const deletionRequests = enriched.filter(u => u.role === 'pending_deletion');

    return res.status(200).json({
      users: enriched,
      count: enriched.length,
      deletionRequests: deletionRequests.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

/**
 * POST /api/admin/users — Create a new user (admin only)
 */
async function createUser(req, res) {
  try {
    const { full_name, email, role } = req.body;

    if (!full_name || !email) {
      return res.status(400).json({ error: 'Full name and email are required' });
    }

    const validRoles = ['student', 'lecturer'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ error: 'Role must be "student" or "lecturer"' });
    }

    // Check if email already exists
    const existing = await userModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'A user with this email already exists' });
    }

    // Generate temp password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjklmnopqrstuvwxyz23456789!@#$';
    let tempPassword = '';
    for (let i = 0; i < 12; i++) {
      tempPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const userData = {
      id: uuidv4(),
      full_name,
      email,
      password_hash: passwordHash,
      totp_secret: '',  // Will be set when user first logs in
      role: role || 'student',
      created_at: new Date().toISOString()
    };

    const created = await userModel.createUser(userData);

    await insertAuditLog(
      req.user.user_id,
      'admin_create_user',
      req.ip || 'unknown',
      req.get('User-Agent') || 'unknown'
    );

    return res.status(201).json({
      message: 'Account created successfully',
      tempPassword,
      user: {
        id: created.id,
        full_name: created.full_name,
        email: created.email,
        role: created.role
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
}

/**
 * Delete a user
 */
async function deleteUser(req, res) {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const deletedUser = await userModel.deleteUser(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({
      message: 'User deleted successfully',
      user: deletedUser
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Failed to delete user' });
  }
}

/**
 * Get system statistics
 */
async function getSystemStats(req, res) {
  try {
    const totalUsers = await userModel.countUsers();
    
    const logsResult = await db.query('SELECT COUNT(*) as count FROM audit_logs');
    const totalLogs = parseInt(logsResult.rows[0].count);
    
    const activeBansResult = await db.query("SELECT COUNT(*) as count FROM audit_logs WHERE action = 'account_locked'");
    
    return res.status(200).json({
      stats: {
        totalUsers,
        totalLogs,
        securityEvents: activeBansResult.rows[0].count,
        systemHealth: 'Optimal'
      }
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return res.status(500).json({ error: 'Failed to fetch stats' });
  }
}

module.exports = {
  getSystemLogs,
  getAllUsers,
  createUser,
  deleteUser,
  getSystemStats
};
