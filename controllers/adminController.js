/**
 * SecureAuth Admin Controller (Node.js/Express)
 * Admin dashboard and user management logic
 * 
 * Author: Bwalya Adrian Mange (106-293)
 * Cavendish University Zambia
 */

const userModel = require('../models/userModel');
const { db } = require('../database/db');

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
    
    // Count deletion requests (mocked for this phase or based on specific logs)
    const deletionRequests = users.filter(u => u.role === 'pending_deletion');

    return res.status(200).json({
      users: users,
      count: users.length,
      deletionRequests: deletionRequests.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
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
  deleteUser,
  getSystemStats
};
