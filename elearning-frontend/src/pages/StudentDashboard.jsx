import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentAPI, progressAPI, statsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [progresses, setProgresses] = useState({});
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, statsRes] = await Promise.all([
        enrollmentAPI.myCourses(),
        statsAPI.student(),
      ]);
      setCourses(coursesRes.data.courses);
      setStats(statsRes.data.stats);

      // Fetch progress for each course
      try {
        const progRes = await progressAPI.getAll();
        setProgresses(progRes.data.progresses);
      } catch (err) {}
    } catch (err) {
      console.error('Lỗi:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getProgressPercent = (courseId) => {
    return progresses[courseId]?.percent || 0;
  };

  const getProgressColor = (percent) => {
    if (percent >= 80) return 'var(--accent-green)';
    if (percent >= 50) return 'var(--accent-yellow)';
    if (percent > 0) return 'var(--accent-primary)';
    return 'var(--text-muted)';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🎓 Khóa học của tôi</h1>
        <p>Xin chào, {user.name}! Đây là tổng quan học tập của bạn.</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-card-icon">📚</div>
            <div className="stat-card-info">
              <span className="stat-card-value">{stats.totalCourses}</span>
              <span className="stat-card-label">Khóa học</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">📝</div>
            <div className="stat-card-info">
              <span className="stat-card-value">{stats.totalSubmissions}</span>
              <span className="stat-card-label">Bài nộp</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-icon">❓</div>
            <div className="stat-card-info">
              <span className="stat-card-value">{stats.totalQuizAttempts}</span>
              <span className="stat-card-label">Lượt quiz</span>
            </div>
          </div>
          <div className="stat-card accent">
            <div className="stat-card-icon">🎯</div>
            <div className="stat-card-info">
              <span className="stat-card-value">{stats.avgQuizScore}%</span>
              <span className="stat-card-label">Điểm TB Quiz</span>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>Bạn chưa đăng ký khóa học nào</h3>
          <p>
            Hãy khám phá{' '}
            <Link to="/courses" className="link-primary">danh sách khóa học</Link>{' '}
            để bắt đầu học!
          </p>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map((course) => {
            const percent = getProgressPercent(course._id);
            return (
              <Link to={`/courses/${course._id}`} key={course._id} className="course-card enrolled">
                <div className="course-card-header">
                  <span className="course-badge enrolled-badge">Đã đăng ký ✓</span>
                  {percent > 0 && (
                    <span className="course-badge progress-badge" style={{ color: getProgressColor(percent) }}>
                      {percent}%
                    </span>
                  )}
                </div>
                <div className="course-card-body">
                  <h3 className="course-title">{course.title}</h3>
                  <p className="course-desc">
                    {course.description?.substring(0, 120)}
                    {course.description?.length > 120 ? '...' : ''}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="course-progress-section">
                  <div className="course-progress-label">
                    <span>Tiến độ</span>
                    <span style={{ color: getProgressColor(percent), fontWeight: 700 }}>{percent}%</span>
                  </div>
                  <div className="course-progress-bar">
                    <div
                      className="course-progress-fill"
                      style={{ width: `${percent}%`, background: getProgressColor(percent) }}
                    />
                  </div>
                </div>

                <div className="course-card-footer">
                  <span className="course-teacher">👨‍🏫 {course.teacher?.name || 'Ẩn danh'}</span>
                  <span className="course-materials">📖 {course.materials?.length || 0} tài liệu</span>
                  <span className="course-date">{formatDate(course.createdAt)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
