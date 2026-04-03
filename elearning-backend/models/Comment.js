const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema(
  {
    lesson: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lesson',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Nội dung bình luận không được trống'],
      maxlength: [1000, 'Bình luận không được quá 1000 ký tự'],
      trim: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
  },
  { timestamps: true }
);

CommentSchema.index({ lesson: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', CommentSchema);
