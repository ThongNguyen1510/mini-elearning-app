import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationAPI } from '../services/api';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getAll();
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (err) {}
  };

  const handleMarkAllRead = async () => {
    try { await notificationAPI.markAllRead(); fetchNotifications(); } catch (err) {}
  };

  const handleMarkRead = async (id) => {
    try { await notificationAPI.markRead(id); fetchNotifications(); } catch (err) {}
  };

  const handleDeleteNotif = async (id) => {
    try { await notificationAPI.delete(id); fetchNotifications(); } catch (err) {}
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">📚</span>
          <span className="brand-text">EduLearn</span>
        </Link>

        <div className="navbar-links">
          <Link to="/courses" className="nav-link">Khóa học</Link>

          {isAuthenticated ? (
            <>
              {user.role === 'teacher' && (
                <Link to="/teacher/dashboard" className="nav-link">Dashboard</Link>
              )}
              {user.role === 'student' && (
                <Link to="/student/dashboard" className="nav-link">Khóa học của tôi</Link>
              )}

              {/* Notification Bell */}
              <div className="notif-wrapper" ref={notifRef}>
                <button className="notif-bell" onClick={() => setShowNotif(!showNotif)}>
                  🔔
                  {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                </button>
                {showNotif && (
                  <div className="notif-dropdown">
                    <div className="notif-header">
                      <span>Thông báo</span>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className="notif-mark-all">Đọc tất cả</button>
                      )}
                    </div>
                    {notifications.length === 0 ? (
                      <div className="notif-empty">Không có thông báo</div>
                    ) : (
                      <div className="notif-list">
                        {notifications.slice(0, 10).map(n => (
                          <div key={n._id}
                            className={`notif-item ${!n.isRead ? 'unread' : ''}`}>
                            <div className="notif-content-wrapper" onClick={() => { handleMarkRead(n._id); setShowNotif(false); }}>
                              <div className="notif-title">{n.title}</div>
                              <div className="notif-message">{n.message}</div>
                              <div className="notif-time">
                                {new Date(n.createdAt).toLocaleString('vi-VN')}
                              </div>
                            </div>
                            <button className="notif-delete" onClick={(e) => { e.stopPropagation(); handleDeleteNotif(n._id); }} title="Xóa thông báo">✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="nav-user">
                <Link to="/profile" className="user-badge" data-role={user.role}>
                  {user.role === 'teacher' ? '👨‍🏫' : '🎓'} {user.name}
                </Link>
                <button onClick={handleLogout} className="btn-logout">Đăng xuất</button>
              </div>
            </>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn-nav btn-login">Đăng nhập</Link>
              <Link to="/register" className="btn-nav btn-register">Đăng ký</Link>
            </div>
          )}

          {/* Theme Toggle — ngoài cùng bên phải */}
          <button className="theme-toggle" onClick={toggleTheme} title={theme === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}>
            <span className={`theme-icon ${theme === 'dark' ? 'active' : ''}`}>🌙</span>
            <span className={`theme-icon ${theme === 'light' ? 'active' : ''}`}>☀️</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
