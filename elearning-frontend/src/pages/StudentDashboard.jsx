import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { enrollmentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEnrolledCourses();
  }, []);

  const fetchEnrolledCourses = async () => {
    try {
      const res = await enrollmentAPI.myCourses();
      setCourses(res.data.courses);
    } catch (err) {
      console.error('Lỗi khi tải khóa học:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🎓 Khóa học của tôi</h1>
        <p>Xin chào, {user.name}! Đây là các khóa học bạn đã đăng ký.</p>
      </div>

      {loading ? (
        <div className="loading">Đang tải...</div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>Bạn chưa đăng ký khóa học nào</h3>
          <p>
            Hãy khám phá{' '}
            <Link to="/courses" className="link-primary">
              danh sách khóa học
            </Link>{' '}
            để bắt đầu học!
          </p>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map((course) => (
            <Link to={`/courses/${course._id}`} key={course._id} className="course-card enrolled">
              <div className="course-card-header">
                <span className="course-badge enrolled-badge">Đã đăng ký ✓</span>
              </div>
              <div className="course-card-body">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-desc">
                  {course.description?.substring(0, 120)}
                  {course.description?.length > 120 ? '...' : ''}
                </p>
              </div>
              <div className="course-card-footer">
                <span className="course-teacher">
                  👨‍🏫 {course.teacher?.name || 'Ẩn danh'}
                </span>
                <span className="course-materials">
                  📎 {course.materials?.length || 0} tài liệu
                </span>
                <span className="course-date">{formatDate(course.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
