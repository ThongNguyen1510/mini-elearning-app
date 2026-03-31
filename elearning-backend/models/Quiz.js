const mongoose = require('mongoose');

const QuizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tiêu đề bài trắc nghiệm'],
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        correctOption: { type: Number, required: true, min: 0, max: 3 }, // 0 đến 3 ứng với A, B, C, D
      },
    ],
    timeLimit: {
      type: Number,
      default: 0, // 0 là không giới hạn thời gian (phút)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', QuizSchema);
