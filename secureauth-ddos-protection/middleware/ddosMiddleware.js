/**
 * SecureAuth DDoS Protection Middleware (Node.js/Express)
 * Application-layer DDoS mitigation and attack prevention
 * 
 * Author: Bwalya Adrian Mange (106-293)
 * Cavendish University Zambia
 */

const slowDown = require('express-slow-down');

// Configuration from environment
const MAX_REQUESTS_PER_MINUTE = parseInt(process.env.MAX_REQUESTS_PER_MINUTE) || 60;
const AUTO_BAN_THRESHOLD = parseInt(process.env.AUTO_BAN_THRESHOLD) || 100;
const BAN_DURATION_MINUTES = parseInt(process.env.BAN_DURATION_MINUTES) || 30;
const MAX_CONCURRENT_CONNECTIONS = parseInt(process.env.MAX_CONCURRENT_CONNECTIONS) || 100;

// In-memory tracking (in production, use Redis)
const ipRequestCounts = new Map();
const bannedIPs = new Map();
const activeConnections = new Map();

/**
 * IP-based request tracking and auto-banning
 */
function trackAndBlockIP(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  // Check if IP is banned
  if (bannedIPs.has(clientIP)) {
    const banExpiry = bannedIPs.get(clientIP);
    
    if (now < banExpiry) {
      const minutesLeft = Math.ceil((banExpiry - now) / 60000);
      console.log(`🚫 Blocked banned IP: ${clientIP} (${minutesLeft} min remaining)`);
      
      return res.status(429).json({
        error: 'IP Banned',
        message: `Your IP has been temporarily banned due to suspicious activity. Ban expires in ${minutesLeft} minutes.`,
        banned_until: new Date(banExpiry).toISOString(),
        contact: 'If you believe this is an error, contact support.'
      });
    } else {
      // Ban expired, remove from list
      bannedIPs.delete(clientIP);
    }
  }

  // Track requests per minute
  if (!ipRequestCounts.has(clientIP)) {
    ipRequestCounts.set(clientIP, []);
  }

  const requests = ipRequestCounts.get(clientIP);
  const oneMinuteAgo = now - 60000;

  // Clean old requests
  const recentRequests = requests.filter(timestamp => timestamp > oneMinuteAgo);
  ipRequestCounts.set(clientIP, recentRequests);

  // Add current request
  recentRequests.push(now);

  // Check if threshold exceeded
  if (recentRequests.length > AUTO_BAN_THRESHOLD) {
    const banUntil = now + (BAN_DURATION_MINUTES * 60000);
    bannedIPs.set(clientIP, banUntil);
    
    console.log(`🚨 AUTO-BAN: ${clientIP} - ${recentRequests.length} requests/min (threshold: ${AUTO_BAN_THRESHOLD})`);
    
    return res.status(429).json({
      error: 'Too Many Requests - IP Banned',
      message: `Your IP has been automatically banned for ${BAN_DURATION_MINUTES} minutes due to excessive requests.`,
      requests_detected: recentRequests.length,
      threshold: AUTO_BAN_THRESHOLD
    });
  }

  // Warn if approaching threshold
  if (recentRequests.length > MAX_REQUESTS_PER_MINUTE) {
    res.setHeader('X-RateLimit-Warning', 'Approaching request limit');
    console.log(`⚠️  High request rate from ${clientIP}: ${recentRequests.length}/min`);
  }

  next();
}

/**
 * Progressive slow-down for repeat requests
 * First few requests: instant
 * After threshold: progressively slower
 */
const progressiveSlowDown = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 10, // Allow 10 fast requests per window
  delayMs: (hits) => hits * 100, // Add 100ms delay per request after threshold
  maxDelayMs: 5000, // Maximum 5 second delay
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
  onLimitReached: (req, res, options) => {
    const clientIP = req.ip || 'unknown';
    console.log(`🐌 Slow-down activated for ${clientIP}: ${options.hits} requests`);
  }
});

/**
 * Connection tracking and limiting
 */
function connectionLimiter(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';

  // Track active connections per IP
  if (!activeConnections.has(clientIP)) {
    activeConnections.set(clientIP, 0);
  }

  const currentConnections = activeConnections.get(clientIP);

  if (currentConnections >= MAX_CONCURRENT_CONNECTIONS) {
    console.log(`🔌 Connection limit exceeded for ${clientIP}: ${currentConnections}/${MAX_CONCURRENT_CONNECTIONS}`);
    
    return res.status(429).json({
      error: 'Too Many Concurrent Connections',
      message: `Maximum ${MAX_CONCURRENT_CONNECTIONS} concurrent connections per IP allowed.`,
      current_connections: currentConnections
    });
  }

  // Increment connection count
  activeConnections.set(clientIP, currentConnections + 1);

  // Decrement on response finish
  res.on('finish', () => {
    const count = activeConnections.get(clientIP) || 0;
    if (count > 0) {
      activeConnections.set(clientIP, count - 1);
    }
  });

  next();
}

/**
 * Request size validator
 * Prevents large payload attacks
 */
function validateRequestSize(req, res, next) {
  const contentLength = req.headers['content-length'];
  const MAX_SIZE = parseInt(process.env.MAX_REQUEST_SIZE) || 100000; // 100KB default

  if (contentLength && parseInt(contentLength) > MAX_SIZE) {
    const clientIP = req.ip || 'unknown';
    console.log(`📦 Large payload rejected from ${clientIP}: ${contentLength} bytes (max: ${MAX_SIZE})`);
    
    return res.status(413).json({
      error: 'Payload Too Large',
      message: `Request body must be less than ${MAX_SIZE / 1000}KB`,
      received: `${(contentLength / 1000).toFixed(2)}KB`
    });
  }

  next();
}

/**
 * Malformed request detector
 * Rejects suspicious requests
 */
function malformedRequestDetector(req, res, next) {
  // Check for common attack patterns
  const userAgent = req.get('User-Agent') || '';
  const clientIP = req.ip || 'unknown';

  // Suspicious patterns
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /<script>/i,
    /\.\.\/\.\.\//,  // Path traversal
    /union.*select/i, // SQL injection
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(userAgent) || pattern.test(req.url)) {
      console.log(`🚨 ATTACK DETECTED from ${clientIP}: Pattern match in ${pattern}`);
      
      // Auto-ban suspicious IPs
      const banUntil = Date.now() + (60 * 60000); // 1 hour ban
      bannedIPs.set(clientIP, banUntil);
      
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Suspicious request detected. Your IP has been logged and banned.'
      });
    }
  }

  next();
}

/**
 * Get DDoS protection statistics
 */
function getProtectionStats() {
  const now = Date.now();
  const activeBans = Array.from(bannedIPs.entries())
    .filter(([ip, expiry]) => expiry > now)
    .length;

  const totalActiveConnections = Array.from(activeConnections.values())
    .reduce((sum, count) => sum + count, 0);

  return {
    banned_ips: activeBans,
    active_connections: totalActiveConnections,
    max_connections_per_ip: MAX_CONCURRENT_CONNECTIONS,
    auto_ban_threshold: AUTO_BAN_THRESHOLD,
    ban_duration_minutes: BAN_DURATION_MINUTES,
    tracked_ips: ipRequestCounts.size
  };
}

/**
 * Clear expired bans (cleanup task)
 */
function cleanupExpiredBans() {
  const now = Date.now();
  let cleaned = 0;

  for (const [ip, expiry] of bannedIPs.entries()) {
    if (expiry < now) {
      bannedIPs.delete(ip);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired IP bans`);
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredBans, 5 * 60 * 1000);

module.exports = {
  trackAndBlockIP,
  progressiveSlowDown,
  connectionLimiter,
  validateRequestSize,
  malformedRequestDetector,
  getProtectionStats
};
