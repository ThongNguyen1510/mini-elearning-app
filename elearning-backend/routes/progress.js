const express = require('express');
const Progress = require('../models/Progress');
const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/progress/:courseId/complete/:lessonId
// @desc    Đánh dấu bài học đã hoàn thành
// @access  Private (Student)
router.post('/:courseId/complete/:lessonId', protect, authorize('student'), async (req, res) => {
  try {
    const { courseId, lessonId } = req.params;

    const lesson = await Lesson.findOne({ _id: lessonId, course: courseId });
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài học.' });
    }

    let progress = await Progress.findOne({ student: req.user.id, course: courseId });

    if (!progress) {
      progress = await Progress.create({
        student: req.user.id,
        course: courseId,
        completedLessons: [lessonId],
      });
    } else {
      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }
      progress.lastAccessedAt = Date.now();
      await progress.save();
    }

    const totalLessons = await Lesson.countDocuments({ course: courseId });
    const completedCount = progress.completedLessons.length;
    const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    res.json({
      success: true,
      message: 'Đã đánh dấu hoàn thành!',
      progress: {
        completedLessons: progress.completedLessons,
        completedCount,
        totalLessons,
        percent,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   POST /api/progress/:courseId/uncomplete/:lessonId
// @desc    Bỏ đánh dấu hoàn thành
// @access  Private (Student)
router.post('/:courseId/uncomplete/:lessonId', protect, authorize('student'), async (req, res) => {
  try {
    const progress = await Progress.findOne({ student: req.user.id, course: req.params.courseId });
    if (progress) {
      progress.completedLessons = progress.completedLessons.filter(
        (id) => id.toString() !== req.params.lessonId
      );
      await progress.save();
    }

    const totalLessons = await Lesson.countDocuments({ course: req.params.courseId });
    const completedCount = progress ? progress.completedLessons.length : 0;
    const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    res.json({
      success: true,
      progress: { completedLessons: progress?.completedLessons || [], completedCount, totalLessons, percent },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   GET /api/progress/:courseId
// @desc    Lấy tiến độ học tập của student cho khóa học
// @access  Private (Student)
router.get('/:courseId', protect, authorize('student'), async (req, res) => {
  try {
    const progress = await Progress.findOne({ student: req.user.id, course: req.params.courseId });
    const totalLessons = await Lesson.countDocuments({ course: req.params.courseId });
    const completedCount = progress ? progress.completedLessons.length : 0;
    const percent = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    res.json({
      success: true,
      progress: {
        completedLessons: progress?.completedLessons || [],
        completedCount,
        totalLessons,
        percent,
        lastAccessedAt: progress?.lastAccessedAt,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   GET /api/progress/my/all
// @desc    Lấy tiến độ tất cả khóa học của student
// @access  Private (Student)
router.get('/my/all', protect, authorize('student'), async (req, res) => {
  try {
    const progresses = await Progress.find({ student: req.user.id });

    const result = {};
    for (const p of progresses) {
      const totalLessons = await Lesson.countDocuments({ course: p.course });
      result[p.course.toString()] = {
        completedLessons: p.completedLessons,
        completedCount: p.completedLessons.length,
        totalLessons,
        percent: totalLessons > 0 ? Math.round((p.completedLessons.length / totalLessons) * 100) : 0,
        lastAccessedAt: p.lastAccessedAt,
      };
    }

    res.json({ success: true, progresses: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
