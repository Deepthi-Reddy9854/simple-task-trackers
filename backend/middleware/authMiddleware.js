const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'simple_task_tracker_secret_key_12345');

      if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(decoded.id)) {
        try {
          req.user = await User.findById(decoded.id).select('-password');
        } catch (dbErr) {
          req.user = { id: decoded.id, name: 'Task Explorer', email: 'user@example.com' };
        }
      } else {
        req.user = { id: decoded.id, name: 'Task Explorer', email: 'user@example.com' };
      }

      if (!req.user) {
        req.user = { id: decoded.id, name: 'Task Explorer', email: 'user@example.com' };
      }

      next();
    } catch (error) {
      console.error('Auth middleware error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, invalid token' });
    }
  } else {
    // No Authorization header present — no token at all
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
