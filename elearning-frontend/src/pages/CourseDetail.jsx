import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseAPI, enrollmentAPI, lessonAPI, assignmentAPI, reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Review form
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewLoading, setReviewLoading] = useState(false);

  useEffect(() => { fetchCourse(); }, [id]);
  useEffect(() => {
    if (course) {
      lessonAPI.getByCourse(id).then(r => setLessons(r.data.lessons)).catch(() => {});
      if (isAuthenticated) {
        assignmentAPI.getByCourse(id).then(r => setAssignments(r.data.assignments)).catch(() => {});
      }
      reviewAPI.getByCourse(id).then(r => setReviews(r.data.reviews)).catch(() => {});
    }
  }, [course]);

  const fetchCourse = async () => {
    try {
      const res = await courseAPI.getById(id);
      setCourse(res.data.course);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const isEnrolled = course?.students?.some((s) => s._id === user?.id);
  const isOwner = course?.teacher?._id === user?.id;
  const myReview = reviews.find(r => r.student?._id === user?.id);

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setActionLoading(true);
    try {
      await enrollmentAPI.enroll(id);
      showMsg('Đăng ký khóa học thành công! 🎉');
      fetchCourse();
    } catch (err) { showMsg(err.response?.data?.message || 'Lỗi', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleUnenroll = async () => {
    setActionLoading(true);
    try {
      await enrollmentAPI.unenroll(id);
      showMsg('Đã hủy đăng ký khóa học');
      fetchCourse();
    } catch (err) { showMsg(err.response?.data?.message || 'Lỗi', 'error'); }
    finally { setActionLoading(false); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewLoading(true);
    try {
      if (myReview) {
        await reviewAPI.update(myReview._id, reviewForm);
        showMsg('Cập nhật đánh giá thành công!');
      } else {
        await reviewAPI.create({ courseId: id, ...reviewForm });
        showMsg('Đánh giá thành công! ⭐');
      }
      reviewAPI.getByCourse(id).then(r => setReviews(r.data.reviews));
      fetchCourse();
    } catch (err) { showMsg(err.response?.data?.message || 'Lỗi', 'error'); }
    finally { setReviewLoading(false); }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Xóa đánh giá này?')) return;
    try {
      await reviewAPI.delete(reviewId);
      showMsg('Đã xóa đánh giá');
      reviewAPI.getByCourse(id).then(r => setReviews(r.data.reviews));
      fetchCourse();
    } catch (err) { showMsg(err.response?.data?.message || 'Lỗi', 'error'); }
  };

  const getFileIcon = (t) => {
    if (t?.startsWith('video/')) return '🎬';
    if (t === 'application/pdf') return '📄';
    if (t?.includes('word') || t?.includes('document')) return '📝';
    if (t?.includes('presentation') || t?.includes('powerpoint')) return '📊';
    if (t?.startsWith('image/')) return '🖼️';
    return '📎';
  };

  const formatSize = (b) => {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  };

  const renderStars = (n) => '★'.repeat(Math.floor(n)) + '☆'.repeat(5 - Math.floor(n));

  if (loading) return <div className="loading">Đang tải chi tiết khóa học...</div>;
  if (!course) return <div className="empty-state"><h3>Không tìm thấy khóa học</h3></div>;

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="btn-back">← Quay lại</button>

      <div className="course-detail">
        <div className="course-detail-header">
          <h1>{course.title}</h1>
          <div className="course-meta">
            <span>👨‍🏫 {course.teacher?.name}</span>
            <span>🎓 {course.students?.length || 0} học viên</span>
            <span>📎 {course.materials?.length || 0} tài liệu</span>
            {course.category && <span>{course.category.icon} {course.category.name}</span>}
            {course.averageRating > 0 && (
              <span className="stars">{renderStars(course.averageRating)} {course.averageRating} ({course.totalReviews})</span>
            )}
          </div>
        </div>

        {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

        {/* Nút hành động*/}
        <div className="course-actions">
          {user?.role === 'student' && !isEnrolled && (
            <button onClick={handleEnroll} className="btn btn-primary btn-lg" disabled={actionLoading}>
              {actionLoading ? 'Đang xử lý...' : '🎓 Đăng ký khóa học'}
            </button>
          )}
          {user?.role === 'student' && isEnrolled && (
            <button onClick={handleUnenroll} className="btn btn-danger btn-lg" disabled={actionLoading}>
              {actionLoading ? 'Đang xử lý...' : '❌ Hủy đăng ký'}
            </button>
          )}
          {!isAuthenticated && (
            <button onClick={() => navigate('/login')} className="btn btn-primary btn-lg">
              Đăng nhập để đăng ký
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {['info', 'lessons', 'assignments', 'reviews'].map(tab => (
            <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}>
              {{info: '📋 Thông tin', lessons: `📖 Bài học (${lessons.length})`,
                assignments: `📝 Bài tập (${assignments.length})`,
                reviews: `⭐ Đánh giá (${reviews.length})`}[tab]}
            </button>
          ))}
        </div>

        {/* Tab Thông tin */}
        {activeTab === 'info' && (
          <div className="tab-content">
            <div className="course-description">
              <h2>Mô tả khóa học</h2>
              <p>{course.description}</p>
            </div>
            <div className="materials-section">
              <h2>📚 Tài liệu chung</h2>
              {!course.materials?.length ? <p className="text-muted">Chưa có tài liệu.</p> : (
                <div className="materials-list">
                  {course.materials.map(m => (
                    <div key={m._id} className="material-item">
                      <span className="material-icon">{getFileIcon(m.fileType)}</span>
                      <div className="material-info">
                        <a href={`http://localhost:5000/uploads/${m.filename}`} target="_blank"
                          rel="noopener noreferrer" className="material-name">{m.originalName}</a>
                        <span className="material-size">{formatSize(m.fileSize)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            {(isOwner || isEnrolled) && course.students?.length > 0 && (
              <div className="students-section">
                <h2>👥 Học viên ({course.students.length})</h2>
                <div className="students-list">
                  {course.students.map(s => (
                    <div key={s._id} className="student-item">
                      <span className="student-avatar">🎓</span><span>{s.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab Bài học */}
        {activeTab === 'lessons' && (
          <div className="tab-content">
            {!lessons.length ? <div className="empty-state"><span className="empty-icon">📖</span><h3>Chưa có bài học</h3></div> : (
              <div className="lesson-list">
                {lessons.map((lesson, i) => (
                  <Link to={`/lessons/${lesson._id}`} key={lesson._id} className="lesson-card">
                    <div className="lesson-order">{i + 1}</div>
                    <div className="lesson-info">
                      <h3>{lesson.title}</h3>
                      <div className="lesson-meta">
                        {lesson.duration > 0 && <span>⏱ {lesson.duration} phút</span>}
                        {lesson.videoUrl && <span>🎬 Có video</span>}
                        <span>📎 {lesson.attachments?.length || 0} tài liệu</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Bài tập */}
        {activeTab === 'assignments' && (
          <div className="tab-content">
            {!isAuthenticated ? (
              <div className="empty-state"><p>Đăng nhập để xem bài tập</p></div>
            ) : !assignments.length ? (
              <div className="empty-state"><span className="empty-icon">📝</span><h3>Chưa có bài tập</h3></div>
            ) : (
              <div className="assignment-list">
                {assignments.map(a => (
                  <Link to={`/assignments/${a._id}`} key={a._id} className="assignment-card">
                    <div className="assignment-info">
                      <h3>{a.title}</h3>
                      <p className="assignment-desc">{a.description?.substring(0, 100)}</p>
                      <div className="assignment-meta">
                        <span>📊 Điển tối đa: {a.maxScore}</span>
                        {a.dueDate && <span>📅 Hạn: {new Date(a.dueDate).toLocaleDateString('vi-VN')}</span>}
                        <span>📎 {a.attachments?.length || 0} đính kèm</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab Đánh giá */}
        {activeTab === 'reviews' && (
          <div className="tab-content">
            {/* Form đánh giá */}
            {user?.role === 'student' && isEnrolled && !myReview && (
              <form onSubmit={handleReviewSubmit} className="review-form">
                <h3>✍️ Viết đánh giá</h3>
                <div className="star-picker">
                  {[1,2,3,4,5].map(n => (
                    <button type="button" key={n}
                      className={`star-btn ${reviewForm.rating >= n ? 'active' : ''}`}
                      onClick={() => setReviewForm({...reviewForm, rating: n})}>★</button>
                  ))}
                </div>
                <textarea placeholder="Nhận xét của bạn..." value={reviewForm.comment}
                  onChange={e => setReviewForm({...reviewForm, comment: e.target.value})} rows={3} />
                <button type="submit" className="btn btn-primary" disabled={reviewLoading}>
                  {reviewLoading ? 'Đang gửi...' : 'Gửi đánh giá'}
                </button>
              </form>
            )}

            {!reviews.length ? <div className="empty-state"><span className="empty-icon">⭐</span><h3>Chưa có đánh giá</h3></div> : (
              <div className="review-list">
                {reviews.map(r => (
                  <div key={r._id} className="review-card">
                    <div className="review-header">
                      <span className="review-author">🎓 {r.student?.name}</span>
                      <span className="review-stars">{renderStars(r.rating)}</span>
                      <span className="review-date">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>
                    {r.comment && <p className="review-comment">{r.comment}</p>}
                    {r.student?._id === user?.id && (
                      <button onClick={() => handleDeleteReview(r._id)} className="btn btn-sm btn-danger">Xóa</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseDetail;
