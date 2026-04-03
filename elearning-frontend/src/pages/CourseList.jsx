import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { courseAPI, categoryAPI } from '../services/api';

const SORT_OPTIONS = [
  { value: 'newest', label: '🕐 Mới nhất' },
  { value: 'oldest', label: '📅 Cũ nhất' },
  { value: 'rating', label: '⭐ Đánh giá cao' },
  { value: 'popular', label: '🔥 Phổ biến' },
  { value: 'az', label: '🔤 A → Z' },
  { value: 'za', label: '🔤 Z → A' },
];

const CourseList = () => {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = [`page=${page}`, `limit=9`, `sort=${sortBy}`];
      if (search) params.push(`search=${encodeURIComponent(search)}`);
      if (selectedCategory) params.push(`category=${selectedCategory}`);
      const res = await courseAPI.getAll(params.join('&'));
      setCourses(res.data.courses);
      setTotalPages(res.data.totalPages);
      setTotal(res.data.total);
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
    setPage(1);
  }, [search, selectedCategory, sortBy]);

  useEffect(() => {
    const timer = setTimeout(() => fetchCourses(), 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory, sortBy, page]);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5;
    let stars = '★'.repeat(full);
    if (half) stars += '½';
    stars += '☆'.repeat(5 - full - (half ? 1 : 0));
    return stars;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);

    if (start > 1) {
      pages.push(<button key={1} className="pagination-btn" onClick={() => setPage(1)}>1</button>);
      if (start > 2) pages.push(<span key="dots1" className="pagination-dots">...</span>);
    }
    for (let i = start; i <= end; i++) {
      pages.push(
        <button key={i} className={`pagination-btn ${page === i ? 'active' : ''}`} onClick={() => setPage(i)}>{i}</button>
      );
    }
    if (end < totalPages) {
      if (end < totalPages - 1) pages.push(<span key="dots2" className="pagination-dots">...</span>);
      pages.push(<button key={totalPages} className="pagination-btn" onClick={() => setPage(totalPages)}>{totalPages}</button>);
    }

    return (
      <div className="pagination">
        <button className="pagination-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Trước</button>
        {pages}
        <button className="pagination-btn" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Sau →</button>
      </div>
    );
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📚 Tất cả Khóa học</h1>
        <p>Khám phá và đăng ký các khóa học phù hợp với bạn</p>
      </div>

      {/* Search + Sort */}
      <div className="search-filter-bar">
        <div className="search-bar" style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="🔍 Tìm kiếm khóa học..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
            id="search-courses"
          />
        </div>
        <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          {SORT_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Category Filter */}
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

      {/* Result count */}
      {!loading && (
        <div className="result-count">
          Hiển thị {courses.length} / {total} khóa học
        </div>
      )}

      {loading ? (
        <div className="loading">Đang tải khóa học...</div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">📭</span>
          <h3>Không tìm thấy khóa học</h3>
          <p>{search ? `Không có kết quả cho "${search}"` : 'Chưa có khóa học nào'}</p>
        </div>
      ) : (
        <>
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

          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default CourseList;
