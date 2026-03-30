const express = require('express');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/courses/:id/enroll
// @desc    Đăng ký khóa học
// @access  Private (Student only)
router.post('/:id/enroll', protect, authorize('student'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy khóa học.',
      });
    }

    // Kiểm tra đã đăng ký chưa
    if (course.students.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Bạn đã đăng ký khóa học này rồi.',
      });
    }

    course.students.push(req.user.id);
    await course.save();

    res.json({
      success: true,
      message: 'Đăng ký khóa học thành công!',
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   POST /api/courses/:id/unenroll
// @desc    Hủy đăng ký khóa học
// @access  Private (Student only)
router.post(
  '/:id/unenroll',
  protect,
  authorize('student'),
  async (req, res) => {
    try {
      const course = await Course.findById(req.params.id);

      if (!course) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy khóa học.',
        });
      }

      // Kiểm tra có đang đăng ký không
      if (!course.students.includes(req.user.id)) {
        return res.status(400).json({
          success: false,
          message: 'Bạn chưa đăng ký khóa học này.',
        });
      }

      course.students.pull(req.user.id);
      await course.save();

      res.json({
        success: true,
        message: 'Hủy đăng ký khóa học thành công!',
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }
);

// @route   GET /api/enrollments/my-courses
// @desc    Lấy danh sách khóa học đã đăng ký
// @access  Private (Student only)
router.get(
  '/my-courses',
  protect,
  authorize('student'),
  async (req, res) => {
    try {
      const courses = await Course.find({ students: req.user.id })
        .populate('teacher', 'name email')
        .sort({ createdAt: -1 });

      res.json({
        success: true,
        count: courses.length,
        courses,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }
);

module.exports = router;
