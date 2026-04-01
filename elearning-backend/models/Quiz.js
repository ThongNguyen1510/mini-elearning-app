const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, 'Vui lòng nhập câu hỏi'],
    maxlength: 1000,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return v.length === 4;
      },
      message: 'Mỗi câu hỏi phải có đúng 4 đáp án (A, B, C, D)',
    },
  },
  correctOption: {
    type: Number,
    required: [true, 'Vui lòng chọn đáp án đúng'],
    min: 0,
    max: 3,
  },
  explanation: {
    type: String,
    default: '',
  },
});

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề bài trắc nghiệm'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: '',
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null,
    },
    questions: {
      type: [QuestionSchema],
      validate: {
        validator: function (v) {
          return v.length > 0;
        },
        message: 'Quiz phải có ít nhất 1 câu hỏi',
      },
    },
    timeLimit: {
      type: Number, // phút, 0 = không giới hạn
      default: 0,
      min: 0,
    },
    passingScore: {
      type: Number, // phần trăm để đạt
      default: 50,
      min: 0,
      max: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', QuizSchema);
