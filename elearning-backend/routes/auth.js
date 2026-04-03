const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Đăng ký tài khoản mới
// @access  Public
router.post(
  '/register',
  [
    body('name', 'Vui lòng nhập tên').notEmpty().trim(),
    body('email', 'Email không hợp lệ').isEmail().normalizeEmail(),
    body('password', 'Mật khẩu phải có ít nhất 6 ký tự').isLength({ min: 6 }),
    body('role', 'Role phải là teacher hoặc student').isIn([
      'teacher',
      'student',
    ]),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { name, email, password, role } = req.body;

      // Kiểm tra email đã tồn tại
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email này đã được sử dụng.',
        });
      }

      const user = await User.create({ name, email, password, role });
      const token = user.getSignedJwtToken();

      res.status(201).json({
        success: true,
        message: 'Đăng ký thành công!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi đăng ký.',
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Đăng nhập
// @access  Public
router.post(
  '/login',
  [
    body('email', 'Email không hợp lệ').isEmail().normalizeEmail(),
    body('password', 'Vui lòng nhập mật khẩu').notEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      const user = await User.findOne({ email }).select('+password');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng.',
        });
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Email hoặc mật khẩu không đúng.',
        });
      }

      const token = user.getSignedJwtToken();

      res.json({
        success: true,
        message: 'Đăng nhập thành công!',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        success: false,
        message: 'Lỗi server khi đăng nhập.',
      });
    }
  }
);

// @route   GET /api/auth/me
// @desc    Lấy thông tin user hiện tại
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Lỗi server.',
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Cập nhật thông tin cá nhân
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ success: false, message: 'Tên không được trống.' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    const userData = { id: user._id, name: user.name, email: user.email, role: user.role };

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công!',
      user: userData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   PUT /api/auth/password
// @desc    Đổi mật khẩu
// @access  Private
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
    }

    const user = await User.findById(req.user.id).select('+password');
    const isMatch = await user.matchPassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mật khẩu hiện tại không đúng.' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
