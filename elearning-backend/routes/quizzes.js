const express = require('express');
const Quiz = require('../models/Quiz');
const QuizResult = require('../models/QuizResult');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper: Kiểm tra teacher
const checkCourseOwner = async (courseId, userId) => {
  const course = await Course.findById(courseId);
  if (!course) return { error: 'Không tìm thấy khóa học.', status: 404 };
  if (course.teacher.toString() !== userId) {
    return { error: 'Bạn không có quyền.', status: 403 };
  }
  return { course };
};

// @route   GET /api/quizzes/course/:courseId
// @desc    Lấy tất cả bài trắc nghiệm của khóa học
// @access  Private
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId }).sort({ createdAt: -1 });
    res.json({ success: true, count: quizzes.length, quizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Lấy chi tiết trắc nghiệm (Dấu đáp án nếu là student)
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'title teacher students');
    if (!quiz) return res.status(404).json({ success: false, message: 'Không tìm thấy bài trắc nghiệm.' });

    // Hô biến để không để lộ đáp án đúng cho student khi chưa nộp bài
    let quizData = JSON.parse(JSON.stringify(quiz));
    if (req.user.role === 'student') {
      quizData.questions.forEach(q => delete q.correctOption);
    }

    res.json({ success: true, quiz: quizData });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   POST /api/quizzes
// @desc    Tạo bài trắc nghiệm (Teacher only)
// @access  Private
router.post('/', protect, authorize('teacher'), async (req, res) => {
  try {
    const { title, courseId, questions, timeLimit } = req.body;
    const { course, error, status } = await checkCourseOwner(courseId, req.user.id);
    if (error) return res.status(status).json({ success: false, message: error });

    const quiz = await Quiz.create({ title, course: courseId, questions, timeLimit });

    // Thông báo học viên
    if (course.students.length > 0) {
      await Notification.notifyMany(course.students, {
        type: 'new_assignment',
        title: 'Trắc nghiệm mới',
        message: `Bài trắc nghiệm "${title}" đã được thêm vào khóa học "${course.title}"`,
        relatedCourse: course._id,
        relatedId: quiz._id,
      });
    }

    res.status(201).json({ success: true, message: 'Tạo bài trắc nghiệm thành công!', quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   POST /api/quizzes/:id/submit
// @desc    Nộp bài trắc nghiệm và CHẤM ĐIỂM TỰ ĐỘNG
// @access  Private (Student)
router.post('/:id/submit', protect, authorize('student'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, message: 'Không tìm thấy bài trắc nghiệm.' });

    const userAnswers = req.body.answers; // [0, 1, 3...]
    let correctCount = 0;

    quiz.questions.forEach((q, i) => {
      if (userAnswers[i] === q.correctOption) {
        correctCount += 1;
      }
    });

    const score = correctCount;
    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((correctCount / totalQuestions) * 100);

    const result = await QuizResult.create({
      quiz: quiz._id,
      student: req.user.id,
      answers: userAnswers,
      score,
      totalQuestions,
      percentage,
    });

    res.json({
      success: true,
      message: 'Nộp bài và chấm điểm xong!',
      result: { score, totalQuestions, percentage, resultId: result._id },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   GET /api/quizzes/results/my/:quizId
// @desc    Lấy kết quả trắc nghiệm của chính mình
// @access  Private (Student)
router.get('/results/my/:quizId', protect, authorize('student'), async (req, res) => {
  try {
    const results = await QuizResult.find({ quiz: req.params.quizId, student: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, results });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
