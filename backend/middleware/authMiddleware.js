const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');

// In-memory user store reference (shared with authController)
const memoryUsers = require('../controllers/memoryStore').memoryUsers;

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'expense_tracker_jwt_secret_key_2026_wad_adbms'
      );

      if (getIsConnected()) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        const found = memoryUsers.find((u) => u._id === decoded.id);
        if (found) {
          const { password, ...userWithoutPassword } = found;
          req.user = userWithoutPassword;
        } else {
          req.user = { _id: decoded.id, name: decoded.name || 'User', email: decoded.email || 'user@example.com' };
        }
      }

      if (!req.user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      return next();
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

module.exports = { protect };
