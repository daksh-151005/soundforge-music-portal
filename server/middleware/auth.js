const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../routes/auth');
const db = require('../db');

function authenticateOptional(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = db.users.findById(decoded.id) || null;
  } catch (err) {
    req.user = null;
  }
  next();
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = db.users.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User does not exist' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
}

function requireArtist(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'artist') {
      return res.status(403).json({ error: 'Forbidden: Artist credentials required to perform this action' });
    }
    next();
  });
}

module.exports = { authenticateOptional, requireAuth, requireArtist };
