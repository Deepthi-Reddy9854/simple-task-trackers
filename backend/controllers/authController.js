const jwt = require('jsonwebtoken');
const User = require('../models/User');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const os = require('os');

// File path for persistent user storage in serverless / fallback environment
const USER_FILE = path.join(os.tmpdir(), 'tasktracker_users.json');

// Helper to load persistent users
function loadUsers() {
  try {
    if (fs.existsSync(USER_FILE)) {
      const content = fs.readFileSync(USER_FILE, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Failed to read users file:', e);
  }
  // Default seeded users if file does not exist yet
  const defaultPassHash = bcrypt.hashSync('password123', 10);
  const initial = [
    {
      _id: 'usr_default_1',
      name: 'Deepthi Bolla',
      email: 'deepthibolla07@gmail.com',
      password: defaultPassHash,
    },
    {
      _id: 'usr_default_2',
      name: 'Bolla Deepthi',
      email: 'bolladeepthi07@gmail.com',
      password: defaultPassHash,
    }
  ];
  saveUsers(initial);
  return initial;
}

// Helper to save persistent users
function saveUsers(usersList) {
  try {
    fs.writeFileSync(USER_FILE, JSON.stringify(usersList, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to write users file:', e);
  }
}

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
      const currentUsers = loadUsers();
      let user = currentUsers.find(u => u.email === cleanEmail);
      if (user) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      user = {
        _id: 'usr_' + Date.now(),
        name,
        email: cleanEmail,
        password: hashedPassword,
      };
      currentUsers.push(user);
      saveUsers(currentUsers);

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

    const cleanEmail = email.toLowerCase().trim();

    if (mongoose.connection.readyState === 1) {
      const user = await User.findOne({ email: cleanEmail }).select('+password');

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No account found with this email. Please click "Create one" below to register.'
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password. Please verify your password or click "Forgot password?".'
        });
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
      const currentUsers = loadUsers();
      let user = currentUsers.find(u => u.email === cleanEmail);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'No account found with this email. Please click "Create one" below to register.'
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Incorrect password. Please verify your password or click "Forgot password?".'
        });
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
      const currentUsers = loadUsers();
      let user = currentUsers.find(u => u._id === req.user?.id);
      if (!user) {
        user = currentUsers[0] || { _id: req.user?.id || 'usr_default_1', name: 'Deepthi Bolla', email: 'deepthibolla07@gmail.com' };
      }
      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || '',
        },
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
      const currentUsers = loadUsers();
      let user = currentUsers.find(u => u.email === targetEmail);
      if (!user) {
        const defaultPassHash = await bcrypt.hash('password123', 10);
        user = {
          _id: 'usr_g_' + Date.now(),
          name: targetName,
          email: targetEmail,
          password: defaultPassHash,
          googleId: googleId || `google_${Date.now()}`,
          avatar: avatar || '',
        };
        currentUsers.push(user);
        saveUsers(currentUsers);
      }
      return res.json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar || '',
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
      const hashedPassword = await bcrypt.hash(newPassword, 10);

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
      const currentUsers = loadUsers();
      let user = currentUsers.find(u => u.email === cleanEmail);
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      if (!user) {
        const defaultName = cleanEmail.split('@')[0];
        user = {
          _id: 'usr_' + Date.now(),
          name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
          email: cleanEmail,
          password: hashedPassword,
        };
        currentUsers.push(user);
      } else {
        user.password = hashedPassword;
      }
      saveUsers(currentUsers);
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
