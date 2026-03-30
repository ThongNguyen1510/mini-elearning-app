const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assignment',
      required: [true, 'Bài nộp phải thuộc về một bài tập'],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      default: '',
      maxlength: [5000, 'Nội dung nộp bài không được quá 5000 ký tự'],
    },
    files: [
      {
        filename: String,
        originalName: String,
        fileType: String,
        fileSize: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    score: {
      type: Number,
      default: null,
      min: [0, 'Điểm không được âm'],
    },
    feedback: {
      type: String,
      default: '',
      maxlength: [2000, 'Nhận xét không được quá 2000 ký tự'],
    },
    status: {
      type: String,
      enum: ['pending', 'graded'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Mỗi student chỉ nộp 1 lần cho mỗi assignment
SubmissionSchema.index({ assignment: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);
