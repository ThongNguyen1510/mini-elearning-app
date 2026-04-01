const express = require('express');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Course = require('../models/Course');
const Notification = require('../models/Notification');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Helper: Kiểm tra teacher sở hữu khóa học
const checkCourseOwner = async (courseId, userId) => {
  const course = await Course.findById(courseId);
  if (!course) return { error: 'Không tìm thấy khóa học.', status: 404 };
  if (course.teacher.toString() !== userId) {
    return { error: 'Bạn không có quyền.', status: 403 };
  }
  return { course };
};

// @route   GET /api/quizzes/course/:courseId
// @desc    Lấy tất cả quiz của khóa học
// @access  Private
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId, isActive: true })
      .select('-questions.correctOption -questions.explanation')
      .sort({ createdAt: -1 });

    // Nếu là student, thêm thông tin đã làm bài chưa
    if (req.user.role === 'student') {
      const quizzesWithStatus = await Promise.all(
        quizzes.map(async (q) => {
          const attempt = await QuizAttempt.findOne({ quiz: q._id, student: req.user.id })
            .sort({ createdAt: -1 });
          return {
            ...q.toObject(),
            questionCount: q.questions.length,
            attempted: !!attempt,
            lastScore: attempt?.score || null,
            lastPassed: attempt?.passed || null,
          };
        })
      );
      return res.json({ success: true, count: quizzesWithStatus.length, quizzes: quizzesWithStatus });
    }

    // Teacher: trả đầy đủ
    const fullQuizzes = await Quiz.find({ course: req.params.courseId })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: fullQuizzes.length, quizzes: fullQuizzes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   GET /api/quizzes/:id
// @desc    Chi tiết quiz (ẩn đáp án cho student)
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'title teacher students');
    if (!quiz) return res.status(404).json({ success: false, message: 'Không tìm thấy bài quiz.' });

    let quizData = JSON.parse(JSON.stringify(quiz));
    // Ẩn đáp án đúng và giải thích cho student
    if (req.user.role === 'student') {
      quizData.questions.forEach(q => {
        delete q.correctOption;
        delete q.explanation;
      });
    }

    res.json({ success: true, quiz: quizData });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   POST /api/quizzes
// @desc    Tạo quiz (Teacher)
// @access  Private
router.post('/', protect, authorize('teacher'), async (req, res) => {
  try {
    const { title, description, courseId, questions, timeLimit, passingScore, lesson } = req.body;
    const { course, error, status } = await checkCourseOwner(courseId, req.user.id);
    if (error) return res.status(status).json({ success: false, message: error });

    // Validate questions
    if (!questions || questions.length === 0) {
      return res.status(400).json({ success: false, message: 'Quiz phải có ít nhất 1 câu hỏi.' });
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question || !q.options || q.options.length !== 4) {
        return res.status(400).json({ success: false, message: `Câu ${i + 1}: phải có câu hỏi và 4 đáp án.` });
      }
      if (q.correctOption === undefined || q.correctOption < 0 || q.correctOption > 3) {
        return res.status(400).json({ success: false, message: `Câu ${i + 1}: đáp án đúng phải từ 0-3 (A-D).` });
      }
    }

    const quiz = await Quiz.create({
      title,
      description: description || '',
      course: courseId,
      lesson: lesson || null,
      questions,
      timeLimit: timeLimit || 0,
      passingScore: passingScore || 50,
    });

    // Thông báo học viên
    if (course.students.length > 0) {
      await Notification.notifyMany(course.students, {
        type: 'new_assignment',
        title: 'Quiz mới',
        message: `Bài trắc nghiệm "${title}" đã được thêm vào khóa học "${course.title}"`,
        relatedCourse: course._id,
        relatedId: quiz._id,
      });
    }

    res.status(201).json({ success: true, message: 'Tạo quiz thành công!', quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   PUT /api/quizzes/:id
// @desc    Cập nhật quiz (Teacher)
// @access  Private
router.put('/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'teacher');
    if (!quiz) return res.status(404).json({ success: false, message: 'Không tìm thấy quiz.' });
    if (quiz.course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền.' });
    }

    const { title, description, questions, timeLimit, passingScore, isActive } = req.body;
    if (title) quiz.title = title;
    if (description !== undefined) quiz.description = description;
    if (questions) quiz.questions = questions;
    if (timeLimit !== undefined) quiz.timeLimit = timeLimit;
    if (passingScore !== undefined) quiz.passingScore = passingScore;
    if (isActive !== undefined) quiz.isActive = isActive;

    await quiz.save();
    res.json({ success: true, message: 'Cập nhật quiz thành công!', quiz });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   DELETE /api/quizzes/:id
// @desc    Xóa quiz (Teacher)
// @access  Private
router.delete('/:id', protect, authorize('teacher'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'teacher');
    if (!quiz) return res.status(404).json({ success: false, message: 'Không tìm thấy quiz.' });
    if (quiz.course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền.' });
    }

    await QuizAttempt.deleteMany({ quiz: quiz._id });
    await quiz.deleteOne();
    res.json({ success: true, message: 'Đã xóa quiz và kết quả liên quan.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   POST /api/quizzes/:id/submit
// @desc    Nộp bài quiz → chấm điểm tự động
// @access  Private (Student)
router.post('/:id/submit', protect, authorize('student'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'title teacher students');
    if (!quiz) return res.status(404).json({ success: false, message: 'Không tìm thấy quiz.' });
    if (!quiz.isActive) return res.status(400).json({ success: false, message: 'Quiz đã bị đóng.' });

    // Kiểm tra student đã đăng ký khóa học
    const isEnrolled = quiz.course.students.some(s => s.toString() === req.user.id);
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: 'Bạn chưa đăng ký khóa học này.' });
    }

    const userAnswers = req.body.answers; // [{questionId, selectedOption}]

    if (!userAnswers || !Array.isArray(userAnswers)) {
      return res.status(400).json({ success: false, message: 'Vui lòng gửi danh sách câu trả lời.' });
    }

    // Chấm điểm
    let correctCount = 0;
    const processedAnswers = quiz.questions.map((q) => {
      const userAns = userAnswers.find(a => a.questionId === q._id.toString());
      const selected = userAns ? userAns.selectedOption : -1;
      const isCorrect = selected === q.correctOption;
      if (isCorrect) correctCount++;

      return {
        questionId: q._id,
        selectedOption: selected,
        isCorrect,
      };
    });

    const totalQuestions = quiz.questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      student: req.user.id,
      answers: processedAnswers,
      score,
      correctCount,
      totalQuestions,
      passed,
      startedAt: req.body.startedAt || Date.now(),
      completedAt: Date.now(),
    });

    // Trả về kết quả + đáp án đúng + giải thích
    const results = quiz.questions.map((q, i) => ({
      question: q.question,
      options: q.options,
      correctOption: q.correctOption,
      explanation: q.explanation,
      selectedOption: processedAnswers[i].selectedOption,
      isCorrect: processedAnswers[i].isCorrect,
    }));

    // Thông báo teacher
    try {
      await Notification.create({
        user: quiz.course.teacher,
        type: 'submission',
        title: 'Bài quiz mới được nộp',
        message: `Học viên đã hoàn thành quiz "${quiz.title}" - Điểm: ${score}%`,
        relatedCourse: quiz.course._id,
        relatedId: attempt._id,
      });
    } catch (notifErr) { console.error('Notification error:', notifErr.message); }

    res.json({
      success: true,
      message: passed ? '🎉 Chúc mừng! Bạn đã đạt!' : '😔 Chưa đạt, hãy thử lại!',
      attempt: {
        id: attempt._id,
        score,
        correctCount,
        totalQuestions,
        passed,
        passingScore: quiz.passingScore,
      },
      results,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   GET /api/quizzes/:id/my-attempts
// @desc    Lịch sử làm bài của student
// @access  Private (Student)
router.get('/:id/my-attempts', protect, authorize('student'), async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({ quiz: req.params.id, student: req.user.id })
      .sort({ createdAt: -1 });
    res.json({ success: true, count: attempts.length, attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   GET /api/quizzes/:id/all-attempts
// @desc    Tất cả lượt làm bài của quiz (Teacher)
// @access  Private (Teacher)
router.get('/:id/all-attempts', protect, authorize('teacher'), async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'teacher');
    if (!quiz) return res.status(404).json({ success: false, message: 'Không tìm thấy quiz.' });
    if (quiz.course.teacher.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Bạn không có quyền.' });
    }

    const attempts = await QuizAttempt.find({ quiz: req.params.id })
      .populate('student', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: attempts.length, attempts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
