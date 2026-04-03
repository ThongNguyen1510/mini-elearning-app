import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI, statsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Profile form
  const [profileForm, setProfileForm] = useState({ name: '' });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name });
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const res = user.role === 'teacher'
        ? await statsAPI.teacher()
        : await statsAPI.student();
      setStats(res.data.stats);
    } catch (err) {}
  };

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 4000);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim()) return;
    setProfileLoading(true);
    try {
      const res = await authAPI.updateProfile({ name: profileForm.name.trim() });
      updateUser(res.data.user);
      showMsg('Cập nhật thông tin thành công!');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Lỗi cập nhật.', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return showMsg('Mật khẩu xác nhận không khớp.', 'error');
    }
    if (passwordForm.newPassword.length < 6) {
      return showMsg('Mật khẩu mới phải có ít nhất 6 ký tự.', 'error');
    }
    setPasswordLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      showMsg('Đổi mật khẩu thành công!');
    } catch (err) {
      showMsg(err.response?.data?.message || 'Lỗi đổi mật khẩu.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

  if (!user) return null;

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="btn-back">← Quay lại</button>

      <div className="profile-page">
        {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar-large">
            {user.role === 'teacher' ? '👨‍🏫' : '🎓'}
          </div>
          <div className="profile-header-info">
            <h1>{user.name}</h1>
            <p className="profile-email">{user.email}</p>
            <span className="profile-role-badge" data-role={user.role}>
              {user.role === 'teacher' ? 'Giảng viên' : 'Học viên'}
            </span>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="profile-stats">
            {user.role === 'teacher' ? (
              <>
                <div className="profile-stat">
                  <span className="profile-stat-value">{stats.totalCourses}</span>
                  <span className="profile-stat-label">Khóa học</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">{stats.totalStudents}</span>
                  <span className="profile-stat-label">Học viên</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">{stats.totalLessons}</span>
                  <span className="profile-stat-label">Bài học</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">{stats.avgRating || 0}</span>
                  <span className="profile-stat-label">Đánh giá ⭐</span>
                </div>
              </>
            ) : (
              <>
                <div className="profile-stat">
                  <span className="profile-stat-value">{stats.totalCourses}</span>
                  <span className="profile-stat-label">Khóa học</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">{stats.totalSubmissions}</span>
                  <span className="profile-stat-label">Bài nộp</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">{stats.totalQuizAttempts}</span>
                  <span className="profile-stat-label">Lượt quiz</span>
                </div>
                <div className="profile-stat">
                  <span className="profile-stat-value">{stats.avgQuizScore}%</span>
                  <span className="profile-stat-label">Điểm TB</span>
                </div>
              </>
            )}
          </div>
        )}

        <div className="profile-forms">
          {/* Update Profile */}
          <div className="profile-card">
            <h2>✏️ Thông tin cá nhân</h2>
            <form onSubmit={handleProfileUpdate}>
              <div className="form-group">
                <label>Họ và tên</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={user.email} disabled className="input-disabled" />
                <small className="form-hint">Email không thể thay đổi</small>
              </div>
              <div className="form-group">
                <label>Vai trò</label>
                <input type="text" value={user.role === 'teacher' ? 'Giảng viên' : 'Học viên'} disabled className="input-disabled" />
              </div>
              <button type="submit" className="btn btn-primary" disabled={profileLoading}>
                {profileLoading ? 'Đang lưu...' : '💾 Lưu thay đổi'}
              </button>
            </form>
          </div>

          {/* Change Password */}
          <div className="profile-card">
            <h2>🔒 Đổi mật khẩu</h2>
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Mật khẩu hiện tại</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu mới</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Xác nhận mật khẩu mới</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  required
                />
              </div>
              <label className="show-password-toggle">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(!showPassword)}
                />
                Hiện mật khẩu
              </label>
              <button type="submit" className="btn btn-primary" disabled={passwordLoading} style={{ marginTop: '12px' }}>
                {passwordLoading ? 'Đang xử lý...' : '🔑 Đổi mật khẩu'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
