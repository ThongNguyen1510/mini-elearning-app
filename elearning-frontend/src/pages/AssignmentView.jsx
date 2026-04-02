import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { assignmentAPI, submissionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const AssignmentView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [mySubmission, setMySubmission] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitContent, setSubmitContent] = useState('');
  const [submitFiles, setSubmitFiles] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Grading form (teacher)
  const [gradingId, setGradingId] = useState(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const aRes = await assignmentAPI.getById(id);
      setAssignment(aRes.data.assignment);

      if (user?.role === 'student') {
        const sRes = await submissionAPI.getMy(id);
        setMySubmission(sRes.data.submission);
      }
      if (user?.role === 'teacher') {
        const sRes = await submissionAPI.getByAssignment(id);
        setSubmissions(sRes.data.submissions);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submitContent.trim() && submitFiles.length === 0) {
      showMsg('Vui lòng nhập nội dung hoặc đính kèm file', 'error');
      return;
    }
    setSubmitLoading(true);
    try {
      const res = await submissionAPI.create({ assignmentId: id, content: submitContent });
      const submissionId = res.data.submission._id;

      // Upload files nếu có
      for (const file of submitFiles) {
        const fd = new FormData();
        fd.append('file', file);
        await submissionAPI.upload(submissionId, fd);
      }

      showMsg(`Nộp bài thành công${submitFiles.length > 0 ? ` (${submitFiles.length} file)` : ''}! 🎉`);
      setSubmitContent('');
      setSubmitFiles([]);
      fetchData();
    } catch (err) { showMsg(err.response?.data?.message || 'Lỗi', 'error'); }
    finally { setSubmitLoading(false); }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSubmitFiles(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removeFile = (index) => {
    setSubmitFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmission = async (submissionId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    try {
      await submissionAPI.upload(submissionId, fd);
      showMsg(`Upload "${file.name}" thành công!`);
      fetchData();
    } catch (err) { showMsg(err.response?.data?.message || 'Lỗi upload', 'error'); }
    e.target.value = '';
  };

  const handleGrade = async (submissionId) => {
    if (!gradeForm.score) { showMsg('Vui lòng nhập điểm', 'error'); return; }
    try {
      await submissionAPI.grade(submissionId, {
        score: parseFloat(gradeForm.score),
        feedback: gradeForm.feedback,
      });
      showMsg('Chấm điểm thành công! ✅');
      setGradingId(null);
      setGradeForm({ score: '', feedback: '' });
      fetchData();
    } catch (err) { showMsg(err.response?.data?.message || 'Lỗi', 'error'); }
  };

  const getFileIcon = (t) => {
    if (t?.startsWith('video/')) return '🎬';
    if (t === 'application/pdf') return '📄';
    return '📎';
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!assignment) return <div className="empty-state"><h3>Không tìm thấy bài tập</h3></div>;

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="btn-back">← Quay lại</button>

      <div className="assignment-detail">
        <div className="course-detail-header">
          <h1>📝 {assignment.title}</h1>
          <div className="course-meta">
            <span>📊 Điểm tối đa: {assignment.maxScore}</span>
            {assignment.dueDate && (
              <span>📅 Hạn nộp: {new Date(assignment.dueDate).toLocaleDateString('vi-VN')}</span>
            )}
            <span>📎 {assignment.attachments?.length || 0} đính kèm</span>
          </div>
        </div>

        {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

        <div className="course-description">
          <h2>Đề bài</h2>
          <p style={{ whiteSpace: 'pre-wrap' }}>{assignment.description}</p>
        </div>

        {/* File đính kèm bài tập */}
        {assignment.attachments?.length > 0 && (
          <div className="materials-section">
            <h2>📎 Đính kèm</h2>
            <div className="materials-list">
              {assignment.attachments.map(att => (
                <div key={att._id} className="material-item">
                  <span className="material-icon">{getFileIcon(att.fileType)}</span>
                  <div className="material-info">
                    <a href={`http://localhost:5000/uploads/${att.filename}`} target="_blank"
                      rel="noopener noreferrer" className="material-name">{att.originalName}</a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Student: Nộp bài */}
        {user?.role === 'student' && (
          <div className="submission-section">
            {mySubmission ? (
              <div className="my-submission">
                <h2>📄 Bài nộp của bạn</h2>
                <div className={`submission-status status-${mySubmission.status}`}>
                  {mySubmission.status === 'pending' ? '⏳ Chờ chấm' : '✅ Đã chấm'}
                </div>
                {mySubmission.content && <p className="submission-content">{mySubmission.content}</p>}
                {mySubmission.files?.length > 0 && (
                  <div className="materials-list compact">
                    {mySubmission.files.map(f => (
                      <div key={f._id} className="material-item">
                        <span className="material-icon">{getFileIcon(f.fileType)}</span>
                        <a href={`http://localhost:5000/uploads/${f.filename}`} target="_blank"
                          rel="noopener noreferrer" className="material-name">{f.originalName}</a>
                      </div>
                    ))}
                  </div>
                )}
                {mySubmission.status === 'pending' && (
                  <label className="btn btn-sm btn-accent upload-btn" style={{ marginTop: '8px' }}>
                    📤 Upload thêm file
                    <input type="file" style={{ display: 'none' }}
                      onChange={e => handleUploadSubmission(mySubmission._id, e)} />
                  </label>
                )}
                {mySubmission.status === 'graded' && (
                  <div className="grade-result">
                    <span className="grade-score">Điểm: {mySubmission.score}/{assignment.maxScore}</span>
                    {mySubmission.feedback && <p className="grade-feedback">💬 {mySubmission.feedback}</p>}
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="submit-form">
                <h2>✍️ Nộp bài</h2>
                <textarea placeholder="Nội dung bài làm..." value={submitContent}
                  onChange={e => setSubmitContent(e.target.value)} rows={5} />

                {/* File picker */}
                <div className="submit-file-section">
                  <label className="btn btn-sm btn-secondary upload-btn">
                    📎 Đính kèm file
                    <input type="file" style={{ display: 'none' }} multiple
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.webm,.zip,.rar" />
                  </label>
                  <span className="text-muted" style={{ fontSize: '0.8rem' }}>PDF, Word, ảnh, video...</span>
                </div>

                {/* Selected files preview */}
                {submitFiles.length > 0 && (
                  <div className="submit-files-preview">
                    {submitFiles.map((f, i) => (
                      <div key={i} className="submit-file-item">
                        <span className="material-icon">{f.type?.startsWith('image/') ? '🖼️' : f.type === 'application/pdf' ? '📄' : '📎'}</span>
                        <span className="submit-file-name">{f.name}</span>
                        <span className="submit-file-size">{(f.size / 1024).toFixed(0)} KB</span>
                        <button type="button" className="btn btn-icon btn-danger" onClick={() => removeFile(i)} title="Xóa">✕</button>
                      </div>
                    ))}
                  </div>
                )}

                <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                  {submitLoading ? '⏳ Đang nộp...' : `📤 Nộp bài${submitFiles.length > 0 ? ` (${submitFiles.length} file)` : ''}`}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Teacher: Xem bài nộp & chấm điểm */}
        {user?.role === 'teacher' && (
          <div className="submissions-section">
            <h2>📋 Bài nộp ({submissions.length})</h2>
            {!submissions.length ? (
              <p className="text-muted">Chưa có bài nộp nào.</p>
            ) : (
              <div className="teacher-course-list">
                {submissions.map(sub => (
                  <div key={sub._id} className="teacher-course-card">
                    <div className="teacher-course-header">
                      <h3>🎓 {sub.student?.name}</h3>
                      <span className={`submission-status status-${sub.status}`}>
                        {sub.status === 'pending' ? '⏳ Chờ chấm' : `✅ ${sub.score}/${assignment.maxScore}`}
                      </span>
                    </div>
                    {sub.content && <p className="teacher-course-desc">{sub.content}</p>}
                    {sub.files?.length > 0 && (
                      <div className="materials-list compact">
                        {sub.files.map(f => (
                          <div key={f._id} className="material-item">
                            <span className="material-icon">{getFileIcon(f.fileType)}</span>
                            <a href={`http://localhost:5000/uploads/${f.filename}`} target="_blank"
                              rel="noopener noreferrer" className="material-name">{f.originalName}</a>
                          </div>
                        ))}
                      </div>
                    )}
                    {gradingId === sub._id ? (
                      <div className="grade-form">
                        <div className="form-group">
                          <label>Điểm (/{assignment.maxScore})</label>
                          <input type="number" min="0" max={assignment.maxScore} value={gradeForm.score}
                            onChange={e => setGradeForm({...gradeForm, score: e.target.value})} />
                        </div>
                        <div className="form-group">
                          <label>Nhận xét</label>
                          <textarea value={gradeForm.feedback} rows={2}
                            onChange={e => setGradeForm({...gradeForm, feedback: e.target.value})} />
                        </div>
                        <div className="form-actions">
                          <button className="btn btn-primary btn-sm" onClick={() => handleGrade(sub._id)}>Chấm</button>
                          <button className="btn btn-secondary btn-sm" onClick={() => setGradingId(null)}>Hủy</button>
                        </div>
                      </div>
                    ) : sub.status === 'pending' ? (
                      <button className="btn btn-sm btn-accent" onClick={() => {
                        setGradingId(sub._id);
                        setGradeForm({ score: '', feedback: '' });
                      }}>📊 Chấm điểm</button>
                    ) : null}
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

export default AssignmentView;
