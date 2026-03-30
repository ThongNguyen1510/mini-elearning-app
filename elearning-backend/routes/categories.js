const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/categories
// @desc    Lấy tất cả danh mục
// @access  Public
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('courseCount')
      .sort({ name: 1 });

    res.json({ success: true, count: categories.length, categories });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   GET /api/categories/:id
// @desc    Lấy chi tiết danh mục
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('courseCount');
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục.' });
    }
    res.json({ success: true, category });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   POST /api/categories
// @desc    Tạo danh mục mới
// @access  Private (Teacher only)
router.post(
  '/',
  protect,
  authorize('teacher'),
  [
    body('name', 'Vui lòng nhập tên danh mục').notEmpty().trim(),
    body('description').optional().trim(),
    body('icon').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const existing = await Category.findOne({ name: req.body.name });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Danh mục này đã tồn tại.' });
      }

      const category = await Category.create({
        name: req.body.name,
        description: req.body.description || '',
        icon: req.body.icon || '📂',
        createdBy: req.user.id,
      });

      res.status(201).json({ success: true, message: 'Tạo danh mục thành công!', category });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }
);

// @route   PUT /api/categories/:id
// @desc    Cập nhật danh mục
// @access  Private (Teacher only)
router.put(
  '/:id',
  protect,
  authorize('teacher'),
  [
    body('name').optional().notEmpty().trim(),
    body('description').optional().trim(),
    body('icon').optional().trim(),
  ],
  async (req, res) => {
    try {
      let category = await Category.findById(req.params.id);
      if (!category) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục.' });
      }

      const { name, description, icon } = req.body;
      if (name) category.name = name;
      if (description !== undefined) category.description = description;
      if (icon) category.icon = icon;

      await category.save();

      res.json({ success: true, message: 'Cập nhật danh mục thành công!', category });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }
);

// @route   DELETE /api/categories/:id
// @desc    Xóa danh mục
// @access  Private (Teacher only)
router.delete('/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy danh mục.' });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Xóa danh mục thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
