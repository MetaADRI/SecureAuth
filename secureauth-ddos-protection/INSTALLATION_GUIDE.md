# DDoS Protection - Quick Installation Guide

## 🚀 Install in 3 Steps

### Step 1: Install New Dependencies

```bash
npm install helmet express-slow-down
```

### Step 2: Copy Files to Your Project

**Replace these files:**
```
ddos-protection/package.json → your-project/package.json
ddos-protection/server.js → your-project/server.js
ddos-protection/.env → your-project/.env (or merge settings)
```

**Add this NEW file:**
```
ddos-protection/middleware/ddosMiddleware.js → your-project/middleware/ddosMiddleware.js
```

### Step 3: Restart Server

```bash
npm start
```

---

## ✅ Verify It's Working

You should see on startup:
```
🛡️  DDoS Protection:
   ✓ Security Headers (Helmet.js)
   ✓ Request Size Limits (100KB)
   ✓ IP-based Auto-Banning
   ✓ Connection Limiting (100 per IP)
   ✓ Progressive Slow-Down
   ✓ Malformed Request Detection
```

Test the stats endpoint:
```bash
curl http://localhost:3000/api/ddos-stats
```

---

## 🧪 Quick Test

Trigger auto-ban:
```bash
# Make 150 rapid requests
for i in {1..150}; do curl http://localhost:3000/api/health & done
```

After ~100 requests, you'll get:
```json
{
  "error": "Too Many Requests - IP Banned",
  "message": "Your IP has been automatically banned..."
}
```

**Success!** DDoS protection is working.

---

## 📋 Files Changed

| File | Action | Why |
|------|--------|-----|
| `package.json` | Replace | Add helmet + express-slow-down dependencies |
| `server.js` | Replace | Integrate DDoS middleware |
| `.env` | Merge | Add DDoS configuration settings |
| `middleware/ddosMiddleware.js` | Add | New DDoS protection logic |

---

## ⚙️ Configuration

All settings in `.env`:

```env
# DDoS Protection
MAX_REQUEST_SIZE=100000          # 100KB payload limit
AUTO_BAN_THRESHOLD=100           # Ban after 100 req/min
BAN_DURATION_MINUTES=30          # 30 min ban
MAX_CONCURRENT_CONNECTIONS=100   # Max connections per IP
```

Adjust these based on your needs!

---

**That's it! You're protected.** 🛡️
