/**
 * SecureAuth Admin Middleware (Node.js/Express)
 * Verifies if the authenticated user has an 'admin' role
 * 
 * Author: Bwalya Adrian Mange (106-293)
 * Cavendish University Zambia
 */

function isAdmin(req, res, next) {
  // User data should already be attached by authMiddleware
  if (!req.user) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Access denied: Administrator privileges required'
    });
  }

  next();
}

module.exports = { isAdmin };
