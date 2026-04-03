const express = require('express');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Review = require('../models/Review');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/stats/teacher
// @desc    Thống kê tổng quan cho Teacher
// @access  Private (Teacher)
router.get('/teacher', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacherId = req.user.id;

    // Lấy tất cả khóa học của teacher
    const courses = await Course.find({ teacher: teacherId });
    const courseIds = courses.map(c => c._id);

    // Tổng số liệu
    const totalStudents = new Set();
    courses.forEach(c => c.students.forEach(s => totalStudents.add(s.toString())));

    const totalLessons = await Lesson.countDocuments({ course: { $in: courseIds } });
    const totalAssignments = await Assignment.countDocuments({ course: { $in: courseIds } });
    const totalQuizzes = await Quiz.countDocuments({ course: { $in: courseIds } });

    // Bài nộp assignment
    const assignmentIds = (await Assignment.find({ course: { $in: courseIds } }, '_id')).map(a => a._id);
    const totalSubmissions = await Submission.countDocuments({ assignment: { $in: assignmentIds } });
    const pendingSubmissions = await Submission.countDocuments({ assignment: { $in: assignmentIds }, status: 'pending' });

    // Quiz attempts
    const totalQuizAttempts = await QuizAttempt.countDocuments({ quiz: { $in: (await Quiz.find({ course: { $in: courseIds } }, '_id')).map(q => q._id) } });

    // Đánh giá
    const reviews = await Review.find({ course: { $in: courseIds } });
    const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0;

    // Top khóa học theo số học viên
    const topCourses = courses
      .map(c => ({ _id: c._id, title: c.title, students: c.students.length, rating: c.averageRating }))
      .sort((a, b) => b.students - a.students)
      .slice(0, 5);

    // Thống kê điểm quiz trung bình theo khóa
    const courseStats = [];
    for (const course of courses) {
      const quizIds = (await Quiz.find({ course: course._id }, '_id')).map(q => q._id);
      const attempts = await QuizAttempt.find({ quiz: { $in: quizIds } });
      const avgScore = attempts.length > 0 ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length) : 0;
      const passRate = attempts.length > 0 ? Math.round(attempts.filter(a => a.passed).length / attempts.length * 100) : 0;

      const submissions = await Submission.find({ assignment: { $in: (await Assignment.find({ course: course._id }, '_id')).map(a => a._id) } });
      const gradedSubmissions = submissions.filter(s => s.status === 'graded');
      const avgAssignmentScore = gradedSubmissions.length > 0 ? Math.round(gradedSubmissions.reduce((s, sub) => s + sub.score, 0) / gradedSubmissions.length) : 0;

      courseStats.push({
        courseId: course._id,
        title: course.title,
        students: course.students.length,
        lessons: await Lesson.countDocuments({ course: course._id }),
        avgQuizScore: avgScore,
        quizPassRate: passRate,
        quizAttempts: attempts.length,
        submissions: submissions.length,
        avgAssignmentScore,
        rating: course.averageRating,
      });
    }

    res.json({
      success: true,
      stats: {
        totalCourses: courses.length,
        totalStudents: totalStudents.size,
        totalLessons,
        totalAssignments,
        totalQuizzes,
        totalSubmissions,
        pendingSubmissions,
        totalQuizAttempts,
        totalReviews: reviews.length,
        avgRating: parseFloat(avgRating),
        topCourses,
        courseStats,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   GET /api/stats/student
// @desc    Thống kê cho Student
// @access  Private (Student)
router.get('/student', protect, authorize('student'), async (req, res) => {
  try {
    const studentId = req.user.id;

    const enrolledCourses = await Course.find({ students: studentId });
    const courseIds = enrolledCourses.map(c => c._id);

    const totalLessons = await Lesson.countDocuments({ course: { $in: courseIds } });

    // Quiz
    const quizIds = (await Quiz.find({ course: { $in: courseIds } }, '_id')).map(q => q._id);
    const myAttempts = await QuizAttempt.find({ student: studentId, quiz: { $in: quizIds } });
    const avgQuizScore = myAttempts.length > 0 ? Math.round(myAttempts.reduce((s, a) => s + a.score, 0) / myAttempts.length) : 0;

    // Submissions
    const assignmentIds = (await Assignment.find({ course: { $in: courseIds } }, '_id')).map(a => a._id);
    const mySubmissions = await Submission.find({ student: studentId, assignment: { $in: assignmentIds } });

    res.json({
      success: true,
      stats: {
        totalCourses: enrolledCourses.length,
        totalLessons,
        totalQuizAttempts: myAttempts.length,
        avgQuizScore,
        quizPassRate: myAttempts.length > 0 ? Math.round(myAttempts.filter(a => a.passed).length / myAttempts.length * 100) : 0,
        totalSubmissions: mySubmissions.length,
        gradedSubmissions: mySubmissions.filter(s => s.status === 'graded').length,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
