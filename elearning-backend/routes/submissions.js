const express = require('express');
const { body, validationResult } = require('express-validator');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @route   POST /api/submissions
// @desc    Nộp bài tập
// @access  Private (Student only)
router.post(
  '/',
  protect,
  authorize('student'),
  [
    body('assignmentId', 'Thiếu ID bài tập').notEmpty(),
    body('content').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const assignment = await Assignment.findById(req.body.assignmentId).populate('course', 'title teacher students');
      if (!assignment) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài tập.' });
      }

      // Kiểm tra student đã enrolled
      if (!assignment.course.students.some(s => s.toString() === req.user.id)) {
        return res.status(403).json({ success: false, message: 'Bạn chưa đăng ký khóa học này.' });
      }

      // Kiểm tra đã nộp chưa
      const existing = await Submission.findOne({
        assignment: req.body.assignmentId,
        student: req.user.id,
      });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Bạn đã nộp bài tập này rồi. Hãy cập nhật bài nộp.' });
      }

      const submission = await Submission.create({
        assignment: req.body.assignmentId,
        student: req.user.id,
        content: req.body.content || '',
      });

      // Thông báo cho teacher
      await Notification.create({
        user: assignment.course.teacher,
        type: 'submission',
        title: 'Bài nộp mới',
        message: `${req.user.name} đã nộp bài tập "${assignment.title}" trong khóa học "${assignment.course.title}"`,
        relatedCourse: assignment.course._id,
        relatedId: submission._id,
      });

      res.status(201).json({ success: true, message: 'Nộp bài thành công!', submission });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }
);

// @route   GET /api/submissions/:id
// @desc    Chi tiết bài nộp
// @access  Private (Student owner hoặc Teacher)
router.get('/:id', protect, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('assignment', 'title description maxScore course')
      .populate('student', 'name email');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài nộp.' });
    }

    // Chỉ student sở hữu hoặc teacher mới được xem
    if (req.user.role === 'student' && submission.student._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền xem.' });
    }

    res.json({ success: true, submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   GET /api/submissions/assignment/:assignmentId
// @desc    Tất cả bài nộp của bài tập (Teacher)
// @access  Private (Teacher)
router.get('/assignment/:assignmentId', protect, authorize('teacher'), async (req, res) => {
  try {
    const submissions = await Submission.find({ assignment: req.params.assignmentId })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: submissions.length, submissions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   GET /api/submissions/my/:assignmentId
// @desc    Bài nộp của student cho assignment
// @access  Private (Student)
router.get('/my/:assignmentId', protect, authorize('student'), async (req, res) => {
  try {
    const submission = await Submission.findOne({
      assignment: req.params.assignmentId,
      student: req.user.id,
    }).populate('assignment', 'title description maxScore');

    res.json({ success: true, submission: submission || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   PUT /api/submissions/:id
// @desc    Cập nhật bài nộp (Student cập nhật nội dung)
// @access  Private (Student owner)
router.put('/:id', protect, authorize('student'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài nộp.' });
    }

    if (submission.student.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền.' });
    }

    if (submission.status === 'graded') {
      return res.status(400).json({ success: false, message: 'Bài đã được chấm, không thể sửa.' });
    }

    if (req.body.content !== undefined) submission.content = req.body.content;
    await submission.save();

    res.json({ success: true, message: 'Cập nhật bài nộp thành công!', submission });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   PUT /api/submissions/:id/grade
// @desc    Chấm điểm bài nộp
// @access  Private (Teacher only)
router.put(
  '/:id/grade',
  protect,
  authorize('teacher'),
  [
    body('score', 'Vui lòng nhập điểm').isFloat({ min: 0 }),
    body('feedback').optional().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
      const submission = await Submission.findById(req.params.id)
        .populate('assignment', 'title maxScore course');
      if (!submission) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy bài nộp.' });
      }

      const course = await Course.findById(submission.assignment.course);
      if (!course || course.teacher.toString() !== req.user.id) {
        return res.status(403).json({ success: false, message: 'Bạn không có quyền chấm bài này.' });
      }

      submission.score = req.body.score;
      submission.feedback = req.body.feedback || '';
      submission.status = 'graded';
      await submission.save();

      // Thông báo cho student
      await Notification.create({
        user: submission.student,
        type: 'grade',
        title: 'Bài tập đã được chấm',
        message: `Bài tập "${submission.assignment.title}" đã được chấm: ${req.body.score}/${submission.assignment.maxScore} điểm`,
        relatedCourse: course._id,
        relatedId: submission._id,
      });

      res.json({ success: true, message: 'Chấm điểm thành công!', submission });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Lỗi server.' });
    }
  }
);

// @route   POST /api/submissions/:id/upload
// @desc    Upload file cho bài nộp
// @access  Private (Student owner)
router.post('/:id/upload', protect, authorize('student'), upload.single('file'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id);
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài nộp.' });
    }

    if (submission.student.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền.' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Vui lòng chọn file.' });
    }

    submission.files.push({
      filename: req.file.filename,
      originalName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size,
    });
    await submission.save();

    res.status(201).json({
      success: true,
      message: 'Upload file nộp bài thành công!',
      file: submission.files[submission.files.length - 1],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
