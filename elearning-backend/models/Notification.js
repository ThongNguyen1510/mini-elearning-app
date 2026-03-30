const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['enrollment', 'submission', 'grade', 'new_course', 'new_lesson', 'new_assignment', 'review'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      maxlength: [200, 'Tiêu đề không được quá 200 ký tự'],
    },
    message: {
      type: String,
      required: true,
      maxlength: [500, 'Nội dung không được quá 500 ký tự'],
    },
    relatedCourse: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      default: null,
    },
    relatedId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Tạo thông báo hàng loạt cho nhiều users
NotificationSchema.statics.notifyMany = async function (userIds, data) {
  const notifications = userIds.map((userId) => ({
    user: userId,
    ...data,
  }));
  return this.insertMany(notifications);
};

module.exports = mongoose.model('Notification', NotificationSchema);
