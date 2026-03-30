const express = require('express');
const { body, validationResult } = require('express-validator');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const checkCourseOwner = async (courseId, userId) => {
  const course = await Course.findById(courseId);
  if (!course) return { error: 'Không tìm thấy khóa học.', status: 404 };
  if (course.teacher.toString() !== userId) {
    return { error: 'Bạn không có quyền thao tác.', status: 403 };
  }
  return { course };
};

// @route   GET /api/assignments/course/:courseId
// @desc    Lấy tất cả bài tập của khóa học
// @access  Private
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId })
      .populate('lesson', 'title')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: assignments.length, assignments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   GET /api/assignments/:id
// @desc    Chi tiết bài tập
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id)
      .populate('course', 'title teacher')
      .populate('lesson', 'title');
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập.' });
    }
    res.json({ success: true, assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   POST /api/assignments
// @desc    Tạo bài tập
// @access  Private (Teacher owner)
router.post(
  '/',
  protect,
  authorize('teacher'),
  [
    body('title', 'Vui lòng nhập tên bài tập').notEmpty().trim(),
    body('description', 'Vui lòng nhập mô tả bài tập').notEmpty().trim(),
    body('courseId', 'Thiếu ID khóa học').notEmpty(),
    body('lessonId').optional(),
    body('dueDate').optional(),
    body('maxScore').optional().isInt({ min: 0 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const { course: courseDoc, error, status } = await checkCourseOwner(req.body.courseId, req.user.id);
      if (error) return res.status(status).json({ success: false, message: error });

      const assignment = await Assignment.create({
        title: req.body.title,
        description: req.body.description,
        course: req.body.courseId,
        lesson: req.body.lessonId || null,
        dueDate: req.body.dueDate || null,
        maxScore: req.body.maxScore || 100,
      });

      // Thông báo cho enrolled students
      if (courseDoc.students.length > 0) {
        await Notification.notifyMany(courseDoc.students, {
          type: 'new_assignment',
          title: 'Bài tập mới',
          message: `Bài tập "${assignment.title}" đã được giao trong khóa học "${courseDoc.title}"`,
          relatedCourse: courseDoc._id,
          relatedId: assignment._id,
        });
      }

      res.status(201).json({ success: true, message: 'Tạo bài tập thành công!', assignment });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }
);

// @route   PUT /api/assignments/:id
// @desc    Cập nhật bài tập
// @access  Private (Teacher owner)
router.put('/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập.' });
    }

    const { error, status } = await checkCourseOwner(assignment.course, req.user.id);
    if (error) return res.status(status).json({ success: false, message: error });

    const { title, description, dueDate, maxScore, lessonId } = req.body;
    if (title) assignment.title = title;
    if (description) assignment.description = description;
    if (dueDate !== undefined) assignment.dueDate = dueDate;
    if (maxScore !== undefined) assignment.maxScore = maxScore;
    if (lessonId !== undefined) assignment.lesson = lessonId;

    await assignment.save();

    res.json({ success: true, message: 'Cập nhật bài tập thành công!', assignment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   DELETE /api/assignments/:id
// @desc    Xóa bài tập
// @access  Private (Teacher owner)
router.delete('/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập.' });
    }

    const { error, status } = await checkCourseOwner(assignment.course, req.user.id);
    if (error) return res.status(status).json({ success: false, message: error });

    for (const att of assignment.attachments) {
      const filePath = path.join(__dirname, '..', 'uploads', att.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await Assignment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Xóa bài tập thành công!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   POST /api/assignments/:id/upload
// @desc    Upload đính kèm cho bài tập
// @access  Private (Teacher owner)
router.post('/:id/upload', protect, authorize('teacher'), upload.single('file'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập.' });
    }

    const { error, status } = await checkCourseOwner(assignment.course, req.user.id);
    if (error) return res.status(status).json({ success: false, message: error });

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file.' });
    }

    assignment.attachments.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });
    await assignment.save();

    res.status(201).json({
      success: true,
      message: 'Upload đính kèm thành công!',
      attachment: assignment.attachments[assignment.attachments.length - 1],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
