const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Vui lòng nhập tên bài học'],
      trim: true,
      maxlength: [200, 'Tên bài học không được quá 200 ký tự'],
    },
    content: {
      type: String,
      default: '',
      maxlength: [5000, 'Nội dung không được quá 5000 ký tự'],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Bài học phải thuộc về một khóa học'],
    },
    order: {
      type: Number,
      default: 0,
    },
    duration: {
      type: Number, // tính bằng phút
      default: 0,
    },
    videoUrl: {
      type: String,
      default: '',
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

module.exports = mongoose.model('Lesson', LessonSchema);
