const express = require('express');
const { body, validationResult } = require('express-validator');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// @route   GET /api/courses
// @desc    Lấy danh sách tất cả khóa học
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, teacher, category, sort, page = 1, limit = 9 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (teacher) query.teacher = teacher;
    if (category) query.category = category;

    // Sorting
    let sortOption = { createdAt: -1 };
    if (sort === 'oldest') sortOption = { createdAt: 1 };
    else if (sort === 'rating') sortOption = { averageRating: -1, createdAt: -1 };
    else if (sort === 'popular') sortOption = { 'students.length': -1, createdAt: -1 };
    else if (sort === 'az') sortOption = { title: 1 };
    else if (sort === 'za') sortOption = { title: -1 };

    // Pagination
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const total = await Course.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    const courses = await Course.find(query)
      .populate('teacher', 'name email')
      .populate('students', 'name email')
      .populate('category', 'name icon')
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum);

    res.json({
      success: true,
      count: courses.length,
      total,
      page: pageNum,
      totalPages,
      courses,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   GET /api/courses/:id
// @desc    Lấy chi tiết khóa học
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('teacher', 'name email')
      .populate('students', 'name email')
      .populate('category', 'name icon');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học.',
      });
    }

    res.json({ success: true, course });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   POST /api/courses
// @desc    Tạo khóa học mới
// @access  Private (Teacher only)
router.post(
  '/',
  protect,
  authorize('teacher'),
  [
    body('title', 'Vui lòng nhập tên khóa học').notEmpty().trim(),
    body('description', 'Vui lòng nhập mô tả khóa học').notEmpty().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const course = await Course.create({
        title: req.body.title,
        description: req.body.description,
        teacher: req.user.id,
        category: req.body.category || null,
      });

      const populated = await Course.findById(course._id).populate(
        'teacher',
        'name email'
      );

      res.status(201).json({
        success: true,
        message: 'Tạo khóa học thành công!',
        course: populated,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }
);

// @route   PUT /api/courses/:id
// @desc    Cập nhật khóa học
// @access  Private (Teacher owner only)
router.put(
  '/:id',
  protect,
  authorize('teacher'),
  [
    body('title', 'Tên khóa học không được trống').optional().notEmpty().trim(),
    body('description', 'Mô tả không được trống').optional().notEmpty().trim(),
  ],
  async (req, res) => {
    try {
      let course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khóa học.',
        });
      }

      // Kiểm tra quyền sở hữu
      if (course.teacher.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền chỉnh sửa khóa học này.',
        });
      }

      const { title, description } = req.body;
      if (title) course.title = title;
      if (description) course.description = description;

      await course.save();

      const updated = await Course.findById(course._id)
        .populate('teacher', 'name email')
        .populate('students', 'name email');

      res.json({
        success: true,
        message: 'Cập nhật khóa học thành công!',
        course: updated,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }
);

// @route   DELETE /api/courses/:id
// @desc    Xóa khóa học
// @access  Private (Teacher owner only)
router.delete('/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học.',
      });
    }

    if (course.teacher.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền xóa khóa học này.',
      });
    }

    // Xóa các file tài liệu
    for (const material of course.materials) {
      const filePath = path.join(__dirname, '..', 'uploads', material.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Xóa khóa học thành công!',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   POST /api/courses/:id/upload
// @desc    Upload tài liệu/video cho khóa học
// @access  Private (Teacher owner only)
router.post(
  '/:id/upload',
  protect,
  authorize('teacher'),
  upload.single('file'),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khóa học.',
        });
      }

      if (course.teacher.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền upload tài liệu cho khóa học này.',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng chọn file để upload.',
        });
      }

      const material = {
        filename: req.file.filename,
        originalName: req.file.originalname,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
      };

      course.materials.push(material);
      await course.save();

      res.status(201).json({
        success: true,
        message: 'Upload tài liệu thành công!',
        material: course.materials[course.materials.length - 1],
      });
    } catch (err) {
      console.error(err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File quá lớn. Giới hạn tối đa 50MB.',
        });
      }
      res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }
);

// @route   DELETE /api/courses/:id/materials/:materialId
// @desc    Xóa tài liệu khỏi khóa học
// @access  Private (Teacher owner only)
router.delete(
  '/:id/materials/:materialId',
  protect,
  authorize('teacher'),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khóa học.',
        });
      }

      if (course.teacher.toString() !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Bạn không có quyền xóa tài liệu khóa học này.',
        });
      }

      const material = course.materials.id(req.params.materialId);
      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy tài liệu.',
        });
      }

      // Xóa file vật lý
      const filePath = path.join(__dirname, '..', 'uploads', material.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      course.materials.pull({ _id: req.params.materialId });
      await course.save();

      res.json({
        success: true,
        message: 'Xóa tài liệu thành công!',
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }
);

module.exports = router;
