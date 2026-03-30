const mongoose = require('mongoose');

const AssignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tên bài tập'],
      trim: true,
      maxlength: [200, 'Tên bài tập không được quá 200 ký tự'],
    },
    description: {
      type: String,
      required: [true, 'Vui lòng nhập mô tả bài tập'],
      maxlength: [3000, 'Mô tả không được quá 3000 ký tự'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Bài tập phải thuộc về một khóa học'],
    },
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    maxScore: {
      type: Number,
      default: 100,
      min: [0, 'Điểm tối đa không được âm'],
    },
    attachments: [
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
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', AssignmentSchema);
