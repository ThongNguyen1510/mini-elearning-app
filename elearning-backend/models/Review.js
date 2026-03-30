const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: [true, 'Đánh giá phải thuộc về một khóa học'],
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Vui lòng chọn số sao đánh giá'],
      min: [1, 'Đánh giá tối thiểu 1 sao'],
      max: [5, 'Đánh giá tối đa 5 sao'],
    },
    comment: {
      type: String,
      default: '',
      maxlength: [1000, 'Nhận xét không được quá 1000 ký tự'],
    },
  },
  { timestamps: true }
);

// Mỗi student chỉ đánh giá 1 lần cho mỗi khóa học
ReviewSchema.index({ course: 1, student: 1 }, { unique: true });

// Cập nhật averageRating khi đánh giá thay đổi
ReviewSchema.statics.calcAverageRating = async function (courseId) {
  const result = await this.aggregate([
    { $match: { course: courseId } },
    {
      $group: {
        _id: '$course',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  const Course = mongoose.model('Course');
  if (result.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      averageRating: Math.round(result[0].averageRating * 10) / 10,
      totalReviews: result[0].totalReviews,
    });
  } else {
    await Course.findByIdAndUpdate(courseId, {
      averageRating: 0,
      totalReviews: 0,
    });
  }
};

ReviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.course);
});

ReviewSchema.post('findOneAndDelete', function (doc) {
  if (doc) {
    doc.constructor.calcAverageRating(doc.course);
  }
});

module.exports = mongoose.model('Review', ReviewSchema);
