const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT is signed with ADMIN_PASSWORD (no separate JWT secret)
const signToken = (user) => jwt.sign({ id: user._id, role: user.role }, process.env.ADMIN_PASSWORD, { expiresIn: '7d' });

const auth = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, process.env.ADMIN_PASSWORD);
    const user = await User.findById(payload.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Not authenticated' });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

const adminOnly = (req, res, next) =>
  req.user.role === 'admin' ? next() : res.status(403).json({ message: 'Staff access only' });

module.exports = { signToken, auth, adminOnly };
