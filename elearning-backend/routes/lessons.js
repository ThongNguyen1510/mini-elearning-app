const express = require('express');
const { body, validationResult } = require('express-validator');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Helper: kiểm tra teacher có sở hữu course
const checkCourseOwner = async (courseId, userId) => {
  const course = await Course.findById(courseId);
  if (!course) return { error: 'Không tìm thấy khóa học.', status: 404 };
  if (course.teacher.toString() !== userId) {
    return { error: 'Bạn không có quyền thao tác với khóa học này.', status: 403 };
  }
  return { course };
};

// @route   GET /api/lessons/course/:courseId
// @desc    Lấy tất cả bài học của khóa học
// @access  Public
router.get('/course/:courseId', async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.courseId })
      .sort({ order: 1, createdAt: 1 });

    res.json({ success: true, count: lessons.length, lessons });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   GET /api/lessons/:id
// @desc    Lấy chi tiết bài học
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id).populate('course', 'title teacher');
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài học.' });
    }
    res.json({ success: true, lesson });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   POST /api/lessons
// @desc    Tạo bài học mới
// @access  Private (Teacher owner)
router.post(
  '/',
  protect,
  authorize('teacher'),
  [
    body('title', 'Vui lòng nhập tên bài học').notEmpty().trim(),
    body('courseId', 'Thiếu ID khóa học').notEmpty(),
    body('content').optional().trim(),
    body('order').optional().isInt({ min: 0 }),
    body('duration').optional().isInt({ min: 0 }),
    body('videoUrl').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { course: courseDoc, error, status } = await checkCourseOwner(req.body.courseId, req.user.id);
      if (error) return res.status(status).json({ success: false, message: error });

      const lessonCount = await Lesson.countDocuments({ course: req.body.courseId });

      const lesson = await Lesson.create({
        title: req.body.title,
        content: req.body.content || '',
        course: req.body.courseId,
        order: req.body.order ?? lessonCount,
        duration: req.body.duration || 0,
        videoUrl: req.body.videoUrl || '',
      });

      // Thông báo cho students enrolled
      if (courseDoc.students.length > 0) {
        await Notification.notifyMany(courseDoc.students, {
          type: 'new_lesson',
          title: 'Bài học mới',
          message: `Bài học "${lesson.title}" đã được thêm vào khóa học "${courseDoc.title}"`,
          relatedCourse: courseDoc._id,
          relatedId: lesson._id,
        });
      }

      res.status(201).json({ success: true, message: 'Tạo bài học thành công!', lesson });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }
);

// @route   PUT /api/lessons/:id
// @desc    Cập nhật bài học
// @access  Private (Teacher owner)
router.put(
  '/:id',
  protect,
  authorize('teacher'),
  async (req, res) => {
    try {
      const lesson = await Lesson.findById(req.params.id);
      if (!lesson) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài học.' });
      }

      const { error, status } = await checkCourseOwner(lesson.course, req.user.id);
      if (error) return res.status(status).json({ success: false, message: error });

      const { title, content, order, duration, videoUrl } = req.body;
      if (title) lesson.title = title;
      if (content !== undefined) lesson.content = content;
      if (order !== undefined) lesson.order = order;
      if (duration !== undefined) lesson.duration = duration;
      if (videoUrl !== undefined) lesson.videoUrl = videoUrl;

      await lesson.save();

      res.json({ success: true, message: 'Cập nhật bài học thành công!', lesson });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }
);

// @route   DELETE /api/lessons/:id
// @desc    Xóa bài học
// @access  Private (Teacher owner)
router.delete('/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài học.' });
    }

    const { error, status } = await checkCourseOwner(lesson.course, req.user.id);
    if (error) return res.status(status).json({ success: false, message: error });

    // Xóa file đính kèm
    for (const att of lesson.attachments) {
      const filePath = path.join(__dirname, '..', 'uploads', att.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Lesson.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Xóa bài học thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   POST /api/lessons/:id/upload
// @desc    Upload tài liệu cho bài học
// @access  Private (Teacher owner)
router.post('/:id/upload', protect, authorize('teacher'), upload.single('file'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài học.' });
    }

    const { error, status } = await checkCourseOwner(lesson.course, req.user.id);
    if (error) return res.status(status).json({ success: false, message: error });

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file.' });
    }

    lesson.attachments.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });
    await lesson.save();

    res.status(201).json({
      success: true,
      message: 'Upload tài liệu bài học thành công!',
      attachment: lesson.attachments[lesson.attachments.length - 1],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   DELETE /api/lessons/:id/attachments/:attachmentId
// @desc    Xóa tài liệu bài học
// @access  Private (Teacher owner)
router.delete('/:id/attachments/:attachmentId', protect, authorize('teacher'), async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài học.' });
    }

    const { error, status } = await checkCourseOwner(lesson.course, req.user.id);
    if (error) return res.status(status).json({ success: false, message: error });

    const att = lesson.attachments.id(req.params.attachmentId);
    if (!att) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài liệu.' });
    }

    const filePath = path.join(__dirname, '..', 'uploads', att.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    lesson.attachments.pull({ _id: req.params.attachmentId });
    await lesson.save();

    res.json({ success: true, message: 'Xóa tài liệu bài học thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
