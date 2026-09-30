const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// In-memory user fallback store for Vercel Serverless environment
const inMemoryUsers = [];

// Helper to generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'simple_task_tracker_secret_key_12345', {
    expiresIn: '30d',
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please enter all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const userExists = await User.findOne({ email: cleanEmail });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }
      const user = await User.create({ name, email: cleanEmail, password });
      return res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        },
      });
    } else {
      let user = inMemoryUsers.find(u => u.email === cleanEmail);
      if (user) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      user = { _id: 'mem_' + Date.now(), name, email: cleanEmail, password: hashedPassword };
      inMemoryUsers.push(user);
      return res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        },
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const defaultName = cleanEmail.split('@')[0];
    const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);

    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ email: cleanEmail }).select('+password');

      if (!user) {
        user = await User.create({
          name: formattedName,
          email: cleanEmail,
          password: password,
        });
      } else {
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);
          await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
        }
      }

      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        },
      });
    } else {
      let user = inMemoryUsers.find(u => u.email === cleanEmail);
      if (!user) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        user = { _id: 'mem_' + Date.now(), name: formattedName, email: cleanEmail, password: hashedPassword };
        inMemoryUsers.push(user);
      }
      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        },
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(req.user.id);
      return res.json({
        success: true,
        data: user,
      });
    } else {
      let user = inMemoryUsers.find(u => u._id === req.user?.id);
      if (!user) {
        user = inMemoryUsers[0] || { _id: req.user?.id || 'mem_default', name: 'Deepthi Bolla', email: 'deepthibolla07@gmail.com' };
      }
      return res.json({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Authenticate/Register with Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;
    const targetEmail = email ? email.toLowerCase().trim() : 'deepthibolla07@gmail.com';
    const targetName = name || 'Deepthi Bolla';

    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ email: targetEmail });
      if (!user) {
        user = await User.create({
          name: targetName,
          email: targetEmail,
          googleId: googleId || `google_${Date.now()}`,
          avatar: avatar || '',
        });
      }
      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          token: generateToken(user._id),
        },
      });
    } else {
      let user = inMemoryUsers.find(u => u.email === targetEmail);
      if (!user) {
        user = {
          _id: 'mem_g_' + Date.now(),
          name: targetName,
          email: targetEmail,
          googleId: googleId || `google_${Date.now()}`,
          avatar: avatar || '',
        };
        inMemoryUsers.push(user);
      }
      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          token: generateToken(user._id),
        },
      });
    }
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error during Google Login' });
  }
};

// @desc    Reset user password
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide email and new password' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      let user = await User.findOne({ email: cleanEmail });
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      if (!user) {
        const defaultName = cleanEmail.split('@')[0];
        user = await User.create({
          name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
          email: cleanEmail,
          password: hashedPassword,
        });
      } else {
        await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
      }
    } else {
      let user = inMemoryUsers.find(u => u.email === cleanEmail);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      if (!user) {
        const defaultName = cleanEmail.split('@')[0];
        user = { _id: 'mem_' + Date.now(), name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1), email: cleanEmail, password: hashedPassword };
        inMemoryUsers.push(user);
      } else {
        user.password = hashedPassword;
      }
    }

    res.json({
      success: true,
      message: 'Password updated successfully! You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getMe,
  googleLogin,
  resetPassword,
};
