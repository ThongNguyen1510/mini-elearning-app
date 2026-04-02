const mongoose = require('mongoose');

const QuizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
        },
        selectedOption: {
          type: Number, // 0-3 = A-D, -1 = chưa trả lời
          required: true,
          min: -1,
          max: 3,
        },
        isCorrect: {
          type: Boolean,
          default: false,
        },
      },
    ],
    score: {
      type: Number, // phần trăm
      default: 0,
      min: 0,
      max: 100,
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    passed: {
      type: Boolean,
      default: false,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Mỗi student chỉ được làm quiz tối đa N lần (không unique, cho phép làm lại)
QuizAttemptSchema.index({ quiz: 1, student: 1 });

module.exports = mongoose.model('QuizAttempt', QuizAttemptSchema);
