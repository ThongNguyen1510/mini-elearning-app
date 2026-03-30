const express = require('express');
const { body, validationResult } = require('express-validator');
const Review = require('../models/Review');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/reviews/course/:courseId
// @desc    Lấy tất cả đánh giá của khóa học
// @access  Public
router.get('/course/:courseId', async (req, res) => {
  try {
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('student', 'name')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: reviews.length, reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   POST /api/reviews
// @desc    Đánh giá khóa học
// @access  Private (Student enrolled only)
router.post(
  '/',
  protect,
  authorize('student'),
  [
    body('courseId', 'Thiếu ID khóa học').notEmpty(),
    body('rating', 'Đánh giá phải từ 1-5 sao').isInt({ min: 1, max: 5 }),
    body('comment').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const course = await Course.findById(req.body.courseId);
      if (!course) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy khóa học.' });
      }

      // Kiểm tra đã enrolled
      if (!course.students.some(s => s.toString() === req.user.id)) {
        return res.status(403).json({ success: false, message: 'Bạn cần đăng ký khóa học trước khi đánh giá.' });
      }

      // Kiểm tra đã đánh giá chưa
      const existing = await Review.findOne({ course: req.body.courseId, student: req.user.id });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Bạn đã đánh giá khóa học này rồi.' });
      }

      const review = await Review.create({
        course: req.body.courseId,
        student: req.user.id,
        rating: req.body.rating,
        comment: req.body.comment || '',
      });

      const populated = await Review.findById(review._id).populate('student', 'name');

      // Thông báo cho teacher
      await require('../models/Notification').create({
        user: course.teacher,
        type: 'review',
        title: 'Đánh giá mới',
        message: `${req.user.name} đã đánh giá ${req.body.rating}⭐ cho khóa học "${course.title}"`,
        relatedCourse: course._id,
        relatedId: review._id,
      });

      res.status(201).json({ success: true, message: 'Đánh giá thành công!', review: populated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }
);

// @route   PUT /api/reviews/:id
// @desc    Cập nhật đánh giá
// @access  Private (Student owner)
router.put(
  '/:id',
  protect,
  authorize('student'),
  [
    body('rating').optional().isInt({ min: 1, max: 5 }),
    body('comment').optional().trim(),
  ],
  async (req, res) => {
    try {
      const review = await Review.findById(req.params.id);
      if (!review) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });
      }

      if (review.student.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền sửa đánh giá này.' });
      }

      if (req.body.rating) review.rating = req.body.rating;
      if (req.body.comment !== undefined) review.comment = req.body.comment;

      await review.save();

      const populated = await Review.findById(review._id).populate('student', 'name');

      res.json({ success: true, message: 'Cập nhật đánh giá thành công!', review: populated });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }
);

// @route   DELETE /api/reviews/:id
// @desc    Xóa đánh giá
// @access  Private (Student owner)
router.delete('/:id', protect, authorize('student'), async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy đánh giá.' });
    }

    if (review.student.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xóa đánh giá này.' });
    }

    await Review.findOneAndDelete({ _id: req.params.id });

    res.json({ success: true, message: 'Xóa đánh giá thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
