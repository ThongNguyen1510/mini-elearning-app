const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Vui lòng nhập tên danh mục'],
      unique: true,
      trim: true,
      maxlength: [100, 'Tên danh mục không được quá 100 ký tự'],
    },
    description: {
      type: String,
      maxlength: [500, 'Mô tả không được quá 500 ký tự'],
      default: '',
    },
    icon: {
      type: String,
      default: '📂',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Virtual: đếm số khóa học trong danh mục
CategorySchema.virtual('courseCount', {
  ref: 'Course',
  localField: '_id',
  foreignField: 'category',
  count: true,
});

module.exports = mongoose.model('Category', CategorySchema);
