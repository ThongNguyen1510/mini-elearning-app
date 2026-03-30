const express = require('express');
const Notification = require('../models/Notification');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/notifications
// @desc    Lấy thông báo của user hiện tại
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id })
      .populate('relatedCourse', 'title')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ user: req.user.id, isRead: false });

    res.json({ success: true, count: notifications.length, unreadCount, notifications });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Đánh dấu đã đọc
// @access  Private
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo.' });
    }

    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Không có quyền.' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, message: 'Đã đánh dấu đọc.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   PUT /api/notifications/read-all
// @desc    Đánh dấu tất cả đã đọc
// @access  Private
router.put('/read-all', protect, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ success: true, message: 'Đã đánh dấu tất cả đã đọc.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Xóa thông báo
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo.' });
    }

    if (notification.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Không có quyền.' });
    }

    await Notification.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Xóa thông báo thành công.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server.' });
  }
});

module.exports = router;
