import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LessonView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    lessonAPI.getById(id)
      .then(res => setLesson(res.data.lesson))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const getFileIcon = (t) => {
    if (t?.startsWith('video/')) return '🎬';
    if (t === 'application/pdf') return '📄';
    if (t?.includes('word')) return '📝';
    if (t?.includes('presentation')) return '📊';
    if (t?.startsWith('image/')) return '🖼️';
    return '📎';
  };

  const formatSize = (b) => {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  };

  if (loading) return <div className="loading">Đang tải bài học...</div>;
  if (!lesson) return <div className="empty-state"><h3>Không tìm thấy bài học</h3></div>;

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="btn-back">← Quay lại</button>

      <div className="lesson-detail">
        <div className="lesson-detail-header">
          <h1>📖 {lesson.title}</h1>
          <div className="course-meta">
            {lesson.duration > 0 && <span>⏱ {lesson.duration} phút</span>}
            <span>📎 {lesson.attachments?.length || 0} tài liệu</span>
          </div>
        </div>

        {/* Video Player */}
        {lesson.videoUrl && (
          <div className="video-player">
            <h2>🎬 Video bài giảng</h2>
            <div className="video-container">
              {lesson.videoUrl.includes('youtube') || lesson.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={lesson.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  title={lesson.title}
                  allowFullScreen
                  className="video-iframe"
                />
              ) : (
                <video controls className="video-element" src={lesson.videoUrl}>
                  Trình duyệt không hỗ trợ video.
                </video>
              )}
            </div>
          </div>
        )}

        {/* Nội dung bài học */}
        {lesson.content && (
          <div className="course-description">
            <h2>📋 Nội dung</h2>
            <p style={{ whiteSpace: 'pre-wrap' }}>{lesson.content}</p>
          </div>
        )}

        {/* Tài liệu đính kèm */}
        {lesson.attachments?.length > 0 && (
          <div className="materials-section">
            <h2>📚 Tài liệu đính kèm</h2>
            <div className="materials-list">
              {lesson.attachments.map(att => (
                <div key={att._id} className="material-item">
                  <span className="material-icon">{getFileIcon(att.fileType)}</span>
                  <div className="material-info">
                    <a href={`http://localhost:5000/uploads/${att.filename}`} target="_blank"
                      rel="noopener noreferrer" className="material-name">{att.originalName}</a>
                    <span className="material-size">{formatSize(att.fileSize)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonView;
