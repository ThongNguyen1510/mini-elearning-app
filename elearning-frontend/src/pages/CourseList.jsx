import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI, categoryAPI } from '../services/api';

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = [];
      if (search) params.push(`search=${search}`);
      if (selectedCategory) params.push(`category=${selectedCategory}`);
      const res = await courseAPI.getAll(params.join('&'));
      setCourses(res.data.courses);
    } catch (err) {
      console.error('Lỗi khi tải khóa học:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    categoryAPI.getAll().then(res => setCategories(res.data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchCourses(), 400);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    let stars = '★'.repeat(full);
    if (half) stars += '½';
    stars += '☆'.repeat(5 - full - (half ? 1 : 0));
    return stars;
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📚 Tất cả Khóa học</h1>
        <p>Khám phá và đăng ký các khóa học phù hợp với bạn</p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Tìm kiếm khóa học..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
          id="search-courses"
        />
      </div>

      {categories.length > 0 && (
        <div className="category-filter">
          <button
            className={`category-chip ${!selectedCategory ? 'active' : ''}`}
            onClick={() => setSelectedCategory('')}
          >
            Tất cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat._id}
              className={`category-chip ${selectedCategory === cat._id ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat._id)}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="loading">Đang tải khóa học...</div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>Chưa có khóa học nào</h3>
          <p>Hãy quay lại sau nhé!</p>
        </div>
      ) : (
        <div className="course-grid">
          {courses.map((course) => (
            <Link to={`/courses/${course._id}`} key={course._id} className="course-card">
              <div className="course-card-header">
                {course.category && (
                  <span className="course-category-badge">
                    {course.category.icon} {course.category.name}
                  </span>
                )}
                <span className="course-badge">{course.materials?.length || 0} tài liệu</span>
              </div>
              <div className="course-card-body">
                <h3 className="course-title">{course.title}</h3>
                <p className="course-desc">
                  {course.description?.substring(0, 120)}
                  {course.description?.length > 120 ? '...' : ''}
                </p>
                {course.averageRating > 0 && (
                  <div className="course-rating">
                    <span className="stars">{renderStars(course.averageRating)}</span>
                    <span className="rating-num">{course.averageRating}</span>
                    <span className="rating-count">({course.totalReviews})</span>
                  </div>
                )}
              </div>
              <div className="course-card-footer">
                <span className="course-teacher">👨‍🏫 {course.teacher?.name || 'Ẩn danh'}</span>
                <span className="course-students">🎓 {course.students?.length || 0} học viên</span>
                <span className="course-date">{formatDate(course.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
