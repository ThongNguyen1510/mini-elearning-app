const express = require('express');
const Comment = require('../models/Comment');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/comments/lesson/:lessonId
// @desc    Lấy bình luận của bài học
// @access  Public
router.get('/lesson/:lessonId', async (req, res) => {
  try {
    const comments = await Comment.find({ lesson: req.params.lessonId, parentComment: null })
      .populate('user', 'name role')
      .sort({ createdAt: -1 });

    // Lấy replies cho mỗi comment
    const commentsWithReplies = await Promise.all(
      comments.map(async (c) => {
        const replies = await Comment.find({ parentComment: c._id })
          .populate('user', 'name role')
          .sort({ createdAt: 1 });
        return { ...c.toObject(), replies };
      })
    );

    res.json({ success: true, comments: commentsWithReplies });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   POST /api/comments
// @desc    Tạo bình luận
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { lessonId, content, parentComment } = req.body;

    if (!content?.trim()) {
      return res.status(400).json({ success: false, message: 'Nội dung không được trống.' });
    }

    const lesson = await Lesson.findById(lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài học.' });
    }

    const comment = await Comment.create({
      lesson: lessonId,
      user: req.user.id,
      content: content.trim(),
      parentComment: parentComment || null,
    });

    const populated = await Comment.findById(comment._id).populate('user', 'name role');

    // Thông báo cho teacher khi có bình luận mới
    try {
      const course = await Course.findById(lesson.course);
      if (course && course.teacher.toString() !== req.user.id) {
        await Notification.create({
          user: course.teacher,
          type: 'review',
          title: 'Bình luận mới',
          message: `${req.user.name} đã bình luận trong bài "${lesson.title}"`,
          relatedCourse: course._id,
          relatedId: lesson._id,
        });
      }
    } catch (notifErr) {}

    res.status(201).json({ success: true, comment: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   PUT /api/comments/:id
// @desc    Sửa bình luận
// @access  Private (owner)
router.put('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Không tìm thấy.' });
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Không có quyền.' });
    }

    comment.content = req.body.content?.trim() || comment.content;
    await comment.save();

    const populated = await Comment.findById(comment._id).populate('user', 'name role');
    res.json({ success: true, comment: populated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   DELETE /api/comments/:id
// @desc    Xóa bình luận
// @access  Private (owner hoặc teacher)
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Không tìm thấy.' });

    // Owner hoặc teacher
    const isOwner = comment.user.toString() === req.user.id;
    let isTeacher = false;
    if (!isOwner) {
      const lesson = await Lesson.findById(comment.lesson);
      if (lesson) {
        const course = await Course.findById(lesson.course);
        isTeacher = course && course.teacher.toString() === req.user.id;
      }
    }

    if (!isOwner && !isTeacher) {
      return res.status(403).json({ success: false, message: 'Không có quyền.' });
    }

    // Xóa replies
    await Comment.deleteMany({ parentComment: comment._id });
    await Comment.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Đã xóa bình luận.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
