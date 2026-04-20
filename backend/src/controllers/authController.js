const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, password, role, cafeName } = req.body;

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    const user = await User.create({
      username,
      password,
      role,
      cafeName
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        cafeName: user.cafeName
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide username and password'
      });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        cafeName: user.cafeName
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Update Kitchen Availability Status
// @route   PUT /api/auth/status
// @access  Private (Kitchen only)
exports.updateKitchenStatus = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    
    if (req.user.role !== 'kitchen') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { isAvailable },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get Kitchen Availability Status
// @route   GET /api/auth/kitchen-status
// @access  Private
exports.getKitchenStatus = async (req, res) => {
  try {
    const kitchenUsers = await User.find({ role: 'kitchen' }).select('username isAvailable');
    // If any kitchen user is available, consider the kitchen available
    const isKitchenAvailable = kitchenUsers.some(user => user.isAvailable);

    res.status(200).json({
      success: true,
      isAvailable: isKitchenAvailable,
      data: kitchenUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get All Kitchen Users (Owner Only)
// @route   GET /api/auth/kitchen-users
// @access  Private (Owner only)
exports.getKitchenUsers = async (req, res) => {
  try {
    // Check if the user is an owner
    if (req.user.role !== 'owner') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    const kitchenUsers = await User.find({ role: 'kitchen' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: kitchenUsers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};