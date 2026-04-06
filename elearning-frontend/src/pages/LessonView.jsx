import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { lessonAPI, commentAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LessonView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  // Comments
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    lessonAPI.getById(id)
      .then(res => setLesson(res.data.lesson))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (id) fetchComments();
  }, [id]);

  const fetchComments = async () => {
    try {
      const res = await commentAPI.getByLesson(id);
      setComments(res.data.comments);
    } catch (err) {}
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentLoading(true);
    try {
      await commentAPI.create({ lessonId: id, content: commentText });
      setCommentText('');
      fetchComments();
    } catch (err) {
      console.error(err);
    } finally {
      setCommentLoading(false);
    }
  };

  const handleReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await commentAPI.create({ lessonId: id, content: replyText, parentComment: parentId });
      setReplyText('');
      setReplyingTo(null);
      fetchComments();
    } catch (err) { console.error(err); }
  };

  const handleEdit = async (commentId) => {
    if (!editText.trim()) return;
    try {
      await commentAPI.update(commentId, { content: editText });
      setEditingId(null);
      setEditText('');
      fetchComments();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (commentId) => {
    if (!confirm('Xóa bình luận này?')) return;
    try {
      await commentAPI.delete(commentId);
      fetchComments();
    } catch (err) { console.error(err); }
  };

  const timeAgo = (date) => {
    const diff = (Date.now() - new Date(date).getTime()) / 1000;
    if (diff < 60) return 'Vừa xong';
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} ngày trước`;
    return new Date(date).toLocaleDateString('vi-VN');
  };

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

  const renderComment = (c, isReply = false) => {
    const isOwner = user && c.user?._id === user.id;
    const isEditing = editingId === c._id;

    return (
      <div key={c._id} className={`comment-item ${isReply ? 'reply' : ''}`}>
        <div className="comment-header">
          <div className="comment-user">
            <span className="comment-avatar">
              {c.user?.role === 'teacher' ? '👨‍🏫' : '🎓'}
            </span>
            <span className="comment-name">{c.user?.name || 'Ẩn danh'}</span>
            {c.user?.role === 'teacher' && <span className="comment-role-badge">Giảng viên</span>}
          </div>
          <span className="comment-time">{timeAgo(c.createdAt)}</span>
        </div>

        {isEditing ? (
          <div className="comment-edit-form">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="comment-input"
              rows={2}
            />
            <div className="comment-edit-actions">
              <button onClick={() => handleEdit(c._id)} className="btn btn-primary btn-sm">Lưu</button>
              <button onClick={() => { setEditingId(null); setEditText(''); }} className="btn btn-secondary btn-sm">Hủy</button>
            </div>
          </div>
        ) : (
          <p className="comment-content">{c.content}</p>
        )}

        {isAuthenticated && !isEditing && (
          <div className="comment-actions">
            {!isReply && (
              <button className="comment-action-btn" onClick={() => { setReplyingTo(replyingTo === c._id ? null : c._id); setReplyText(''); }}>
                💬 Trả lời
              </button>
            )}
            {isOwner && (
              <>
                <button className="comment-action-btn" onClick={() => { setEditingId(c._id); setEditText(c.content); }}>
                  ✏️ Sửa
                </button>
                <button className="comment-action-btn delete" onClick={() => handleDelete(c._id)}>
                  🗑️ Xóa
                </button>
              </>
            )}
          </div>
        )}

        {/* Reply form */}
        {replyingTo === c._id && (
          <form onSubmit={(e) => handleReply(e, c._id)} className="reply-form">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Trả lời ${c.user?.name}...`}
              className="comment-input"
              rows={2}
            />
            <div className="comment-edit-actions">
              <button type="submit" className="btn btn-primary btn-sm" disabled={!replyText.trim()}>Gửi</button>
              <button type="button" onClick={() => setReplyingTo(null)} className="btn btn-secondary btn-sm">Hủy</button>
            </div>
          </form>
        )}

        {/* Replies */}
        {c.replies?.length > 0 && (
          <div className="replies-list">
            {c.replies.map((r) => renderComment(r, true))}
          </div>
        )}
      </div>
    );
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

        {/* Bình luận / Forum */}
        <div className="comments-section">
          <h2>💬 Thảo luận ({comments.length})</h2>

          {/* Form viết bình luận */}
          {isAuthenticated ? (
            <form onSubmit={handlePostComment} className="comment-form">
              <div className="comment-form-header">
                <span className="comment-avatar">{user?.role === 'teacher' ? '👨‍🏫' : '🎓'}</span>
                <span className="comment-form-name">{user?.name}</span>
              </div>
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Viết bình luận, đặt câu hỏi..."
                className="comment-input"
                rows={3}
                maxLength={1000}
              />
              <div className="comment-form-footer">
                <span className="comment-char-count">{commentText.length}/1000</span>
                <button type="submit" className="btn btn-primary" disabled={!commentText.trim() || commentLoading}>
                  {commentLoading ? 'Đang gửi...' : '📤 Gửi bình luận'}
                </button>
              </div>
            </form>
          ) : (
            <div className="comment-login-prompt">
              <p>🔒 Đăng nhập để tham gia thảo luận</p>
            </div>
          )}

          {/* Danh sách bình luận */}
          {comments.length === 0 ? (
            <div className="comments-empty">
              <span>💭</span>
              <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
            </div>
          ) : (
            <div className="comments-list">
              {comments.map((c) => renderComment(c))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LessonView;
