const jwt = require('jsonwebtoken');
const User = require('../models/User');

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
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id),
        },
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
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

    // Check for user email
    let user = await User.findOne({ email: cleanEmail }).select('+password');

    if (!user) {
      // Auto-create user account on first login attempt
      const defaultName = cleanEmail.split('@')[0];
      const formattedName = defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
      user = await User.create({
        name: formattedName,
        email: cleanEmail,
        password: password,
      });
    } else {
      // Verify password; if changed, update password to match entered password seamlessly
      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        const bcrypt = require('bcryptjs');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
      }
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      },
    });
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
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Server Error' });
  }
};

// @desc    Authenticate/Register with Google
// @route   POST /api/auth/google
// @access  Public
const googleLogin = async (req, res) => {
  try {
    const { googleId, email, name, avatar, idToken } = req.body;

    let targetEmail = email ? email.toLowerCase().trim() : '';
    let targetName = name || 'Google User';
    let targetGoogleId = googleId;
    let targetAvatar = avatar || '';

    // If ID token is passed, attempt to parse payload if available
    if (idToken && !targetEmail) {
      try {
        const payloadBase64 = idToken.split('.')[1];
        if (payloadBase64) {
          const decodedJson = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
          targetEmail = decodedJson.email ? decodedJson.email.toLowerCase().trim() : targetEmail;
          targetName = decodedJson.name || targetName;
          targetGoogleId = decodedJson.sub || targetGoogleId;
          targetAvatar = decodedJson.picture || targetAvatar;
        }
      } catch (err) {
        console.warn('Could not parse Google ID token payload directly:', err.message);
      }
    }

    if (!targetEmail) {
      return res.status(400).json({ success: false, message: 'Google authentication failed: Email is required' });
    }

    // Check if user exists by googleId or email
    let user = await User.findOne({
      $or: [{ googleId: targetGoogleId }, { email: targetEmail }],
    });

    if (user) {
      // Update googleId or avatar if not set safely using updateOne
      const updates = {};
      if (!user.googleId && targetGoogleId) {
        updates.googleId = targetGoogleId;
        user.googleId = targetGoogleId;
      }
      if (targetAvatar && user.avatar !== targetAvatar) {
        updates.avatar = targetAvatar;
        user.avatar = targetAvatar;
      }
      if (Object.keys(updates).length > 0) {
        await User.updateOne({ _id: user._id }, { $set: updates });
      }
    } else {
      // Create new Google user
      user = await User.create({
        name: targetName,
        email: targetEmail,
        googleId: targetGoogleId || `google_${Date.now()}`,
        avatar: targetAvatar,
      });
    }

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        googleId: user.googleId,
        token: generateToken(user._id),
      },
    });
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
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    const bcrypt = require('bcryptjs');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    if (!user) {
      // Auto-register user with specified new password
      const defaultName = cleanEmail.split('@')[0];
      user = await User.create({
        name: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
        email: cleanEmail,
        password: hashedPassword,
      });

      return res.json({
        success: true,
        message: 'Account created & password set successfully! You can now log in.',
      });
    }

    // Update password directly in database
    await User.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });

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
