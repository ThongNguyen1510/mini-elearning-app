import { useState, useEffect } from 'react';
import { courseAPI, categoryAPI, lessonAPI, assignmentAPI, submissionAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Course form
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({ title: '', description: '', category: '' });
  const [formLoading, setFormLoading] = useState(false);
  const [uploadingCourseId, setUploadingCourseId] = useState(null);

  // Category form
  const [showCatForm, setShowCatForm] = useState(false);
  const [catForm, setCatForm] = useState({ name: '', description: '', icon: '📂' });

  // Lesson form
  const [showLessonForm, setShowLessonForm] = useState(null);
  const [lessonForm, setLessonForm] = useState({ title: '', content: '', duration: 0, videoUrl: '' });
  const [courseLessons, setCourseLessons] = useState({});

  // Assignment state
  const [showAssignForm, setShowAssignForm] = useState(null);
  const [editingAssign, setEditingAssign] = useState(null);
  const [assignForm, setAssignForm] = useState({ title: '', description: '', maxScore: 100, dueDate: '' });
  const [courseAssignments, setCourseAssignments] = useState({});
  const [uploadingAssignId, setUploadingAssignId] = useState(null);

  // Submissions view
  const [viewingSubmissions, setViewingSubmissions] = useState(null); // assignmentId
  const [submissions, setSubmissions] = useState([]);
  const [gradingId, setGradingId] = useState(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [cRes, catRes] = await Promise.all([
        courseAPI.getByTeacher(user.id),
        categoryAPI.getAll(),
      ]);
      setCourses(cRes.data.courses);
      setCategories(catRes.data.categories);

      const lessonsMap = {};
      const assignmentsMap = {};
      for (const c of cRes.data.courses) {
        const [lRes, aRes] = await Promise.all([
          lessonAPI.getByCourse(c._id),
          assignmentAPI.getByCourse(c._id),
        ]);
        lessonsMap[c._id] = lRes.data.lessons;
        assignmentsMap[c._id] = aRes.data.assignments;
      }
      setCourseLessons(lessonsMap);
      setCourseAssignments(assignmentsMap);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  // === Category CRUD ===
  const handleCatSubmit = async (e) => {
    e.preventDefault();
    try {
      await categoryAPI.create(catForm);
      showMsg('Tạo danh mục thành công! 📂');
      setCatForm({ name: '', description: '', icon: '📂' });
      setShowCatForm(false);
      fetchData();
    } catch (err) { showMsg(err.response?.data?.message || 'Lỗi', 'error'); }
  };

  const handleDeleteCat = async (id) => {
    if (!window.confirm('Xóa danh mục này?')) return;
    try { await categoryAPI.delete(id); showMsg('Đã xóa danh mục'); fetchData(); }
    catch (err) { showMsg(err.response?.data?.message || 'Lỗi', 'error'); }
  };

  // === Course CRUD ===
  const handleCourseSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingCourse) {
        await courseAPI.update(editingCourse._id, courseForm);
        showMsg('Cập nhật khóa học thành công! ✅');
      } else {
        await courseAPI.create(courseForm);
        showMsg('Tạo khóa học mới thành công! 🎉');
      }
      setShowCourseForm(false); setEditingCourse(null);
      setCourseForm({ title: '', description: '', category: '' });
      fetchData();
    } catch (err) { showMsg(err.response?.data?.message || 'Lỗi', 'error'); }
    finally { setFormLoading(false); }
  };

  const handleEditCourse = (c) => {
    setEditingCourse(c);
    setCourseForm({ title: c.title, description: c.description, category: c.category?._id || '' });
    setShowCourseForm(true);
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Xóa khóa học này?')) return;
    try { await courseAPI.delete(id); showMsg('Đã xóa khóa học 🗑️'); fetchData(); }
    catch (err) { showMsg(err.response?.data?.message || 'Lỗi', 'error'); }
  };

  const handleUpload = async (courseId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    setUploadingCourseId(courseId);
    try { await courseAPI.upload(courseId, fd); showMsg(`Upload "${file.name}" thành công! 📎`); fetchData(); }
    catch (err) { showMsg(err.response?.data?.message || 'Lỗi upload', 'error'); }
    finally { setUploadingCourseId(null); e.target.value = ''; }
  };

  const handleDeleteMaterial = async (courseId, matId) => {
    if (!window.confirm('Xóa tài liệu này?')) return;
    try { await courseAPI.deleteMaterial(courseId, matId); showMsg('Đã xóa'); fetchData(); }
    catch (err) { showMsg('Lỗi', 'error'); }
  };

  // === Lesson CRUD ===
  const handleLessonSubmit = async (e, courseId) => {
    e.preventDefault();
    try {
      await lessonAPI.create({ ...lessonForm, courseId });
      showMsg('Tạo bài học thành công! 📖');
      setLessonForm({ title: '', content: '', duration: 0, videoUrl: '' });
      setShowLessonForm(null);
      fetchData();
    } catch (err) { showMsg(err.response?.data?.message || 'Lỗi', 'error'); }
  };

  const handleDeleteLesson = async (id) => {
    if (!window.confirm('Xóa bài học này?')) return;
    try { await lessonAPI.delete(id); showMsg('Đã xóa bài học'); fetchData(); }
    catch (err) { showMsg('Lỗi', 'error'); }
  };

  // === Assignment CRUD ===
  const handleAssignSubmit = async (e, courseId) => {
    e.preventDefault();
    try {
      if (editingAssign) {
        await assignmentAPI.update(editingAssign._id, assignForm);
        showMsg('Cập nhật bài tập thành công! ✅');
      } else {
        await assignmentAPI.create({ ...assignForm, courseId });
        showMsg('Tạo bài tập thành công! 📝');
      }
      setAssignForm({ title: '', description: '', maxScore: 100, dueDate: '' });
      setShowAssignForm(null);
      setEditingAssign(null);
      fetchData();
    } catch (err) { showMsg(err.response?.data?.message || 'Lỗi', 'error'); }
  };

  const handleEditAssign = (a, courseId) => {
    setEditingAssign(a);
    setAssignForm({
      title: a.title,
      description: a.description,
      maxScore: a.maxScore,
      dueDate: a.dueDate ? a.dueDate.substring(0, 10) : '',
    });
    setShowAssignForm(courseId);
  };

  const handleDeleteAssign = async (id) => {
    if (!window.confirm('Xóa bài tập này?')) return;
    try { await assignmentAPI.delete(id); showMsg('Đã xóa bài tập'); fetchData(); }
    catch (err) { showMsg(err.response?.data?.message || 'Lỗi', 'error'); }
  };

  const handleUploadAssignFile = async (assignId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData(); fd.append('file', file);
    setUploadingAssignId(assignId);
    try {
      await assignmentAPI.upload(assignId, fd);
      showMsg(`Đính kèm "${file.name}" thành công! 📎`);
      fetchData();
    } catch (err) { showMsg(err.response?.data?.message || 'Lỗi upload', 'error'); }
    finally { setUploadingAssignId(null); e.target.value = ''; }
  };

  // === Submissions & Grading ===
  const handleViewSubmissions = async (assignId) => {
    if (viewingSubmissions === assignId) {
      setViewingSubmissions(null);
      return;
    }
    try {
      const res = await submissionAPI.getByAssignment(assignId);
      setSubmissions(res.data.submissions);
      setViewingSubmissions(assignId);
    } catch (err) { showMsg('Lỗi tải bài nộp', 'error'); }
  };

  const handleGrade = async (subId, maxScore) => {
    if (!gradeForm.score && gradeForm.score !== 0) { showMsg('Vui lòng nhập điểm', 'error'); return; }
    if (parseFloat(gradeForm.score) > maxScore) { showMsg(`Điểm không được vượt quá ${maxScore}`, 'error'); return; }
    try {
      await submissionAPI.grade(subId, { score: parseFloat(gradeForm.score), feedback: gradeForm.feedback });
      showMsg('Chấm điểm thành công! ✅');
      setGradingId(null);
      setGradeForm({ score: '', feedback: '' });
      handleViewSubmissions(viewingSubmissions);
    } catch (err) { showMsg(err.response?.data?.message || 'Lỗi', 'error'); }
  };

  const getFileIcon = (t) => {
    if (t?.startsWith('video/')) return '🎬';
    if (t === 'application/pdf') return '📄';
    if (t?.includes('word')) return '📝';
    if (t?.startsWith('image/')) return '🖼️';
    if (t?.includes('presentation')) return '📊';
    return '📎';
  };

  const formatSize = (b) => {
    if (b < 1024) return b + ' B';
    if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👨‍🏫 Dashboard Giảng viên</h1>
        <p>Xin chào, {user.name}! Quản lý khóa học, bài học, bài tập tại đây.</p>
      </div>

      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {/* Actions */}
      <div className="dashboard-actions" style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={() => { setShowCourseForm(!showCourseForm); setEditingCourse(null); setCourseForm({ title: '', description: '', category: '' }); }}
          className="btn btn-primary" id="btn-create-course">➕ Tạo khóa học</button>
        <button onClick={() => setShowCatForm(!showCatForm)} className="btn btn-secondary">📂 Tạo danh mục</button>
      </div>

      {/* Category Form */}
      {showCatForm && (
        <div className="form-card">
          <h2>📂 Tạo danh mục mới</h2>
          <form onSubmit={handleCatSubmit}>
            <div className="form-group"><label>Tên danh mục</label>
              <input type="text" value={catForm.name} onChange={e => setCatForm({...catForm, name: e.target.value})} required /></div>
            <div className="form-group"><label>Mô tả</label>
              <input type="text" value={catForm.description} onChange={e => setCatForm({...catForm, description: e.target.value})} /></div>
            <div className="form-group"><label>Icon (emoji)</label>
              <input type="text" value={catForm.icon} onChange={e => setCatForm({...catForm, icon: e.target.value})} /></div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary">Tạo</button>
              <button type="button" onClick={() => setShowCatForm(false)} className="btn btn-secondary">Hủy</button>
            </div>
          </form>
          {categories.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h3 style={{ fontSize: '0.95rem', marginBottom: '8px', color: 'var(--text-secondary)' }}>Danh mục hiện có:</h3>
              <div className="category-filter">
                {categories.map(c => (
                  <span key={c._id} className="category-chip" style={{ cursor: 'default' }}>
                    {c.icon} {c.name}
                    <button onClick={() => handleDeleteCat(c._id)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', marginLeft: '6px', fontSize: '0.75rem' }}>✕</button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Course Form */}
      {showCourseForm && (
        <div className="form-card">
          <h2>{editingCourse ? '✏️ Chỉnh sửa khóa học' : '➕ Tạo khóa học mới'}</h2>
          <form onSubmit={handleCourseSubmit}>
            <div className="form-group"><label>Tên khóa học</label>
              <input type="text" value={courseForm.title} onChange={e => setCourseForm({...courseForm, title: e.target.value})} required /></div>
            <div className="form-group"><label>Mô tả</label>
              <textarea value={courseForm.description} onChange={e => setCourseForm({...courseForm, description: e.target.value})} rows={4} required /></div>
            <div className="form-group"><label>Danh mục</label>
              <select value={courseForm.category} onChange={e => setCourseForm({...courseForm, category: e.target.value})}>
                <option value="">-- Chọn danh mục --</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
              </select></div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={formLoading}>
                {formLoading ? 'Đang lưu...' : editingCourse ? 'Cập nhật' : 'Tạo khóa học'}
              </button>
              <button type="button" onClick={() => { setShowCourseForm(false); setEditingCourse(null); }} className="btn btn-secondary">Hủy</button>
            </div>
          </form>
        </div>
      )}

      {/* Course List */}
      {loading ? <div className="loading">Đang tải...</div> :
      courses.length === 0 ? (
        <div className="empty-state"><span className="empty-icon">📭</span><h3>Chưa có khóa học nào</h3></div>
      ) : (
        <div className="teacher-course-list">
          {courses.map(course => (
            <div key={course._id} className="teacher-course-card">
              <div className="teacher-course-header">
                <h3>{course.title}</h3>
                <div className="teacher-course-actions">
                  <button onClick={() => handleEditCourse(course)} className="btn btn-sm btn-secondary" title="Sửa">✏️</button>
                  <button onClick={() => handleDeleteCourse(course._id)} className="btn btn-sm btn-danger" title="Xóa">🗑️</button>
                </div>
              </div>
              <p className="teacher-course-desc">{course.description}</p>
              <div className="teacher-course-stats">
                <span>🎓 {course.students?.length || 0} học viên</span>
                <span>📎 {course.materials?.length || 0} tài liệu</span>
                <span>📖 {courseLessons[course._id]?.length || 0} bài học</span>
                <span>📝 {courseAssignments[course._id]?.length || 0} bài tập</span>
                {course.averageRating > 0 && <span>⭐ {course.averageRating}</span>}
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                <label className="btn btn-sm btn-accent upload-btn">
                  {uploadingCourseId === course._id ? '⏳ Uploading...' : '📤 Upload tài liệu'}
                  <input type="file" onChange={e => handleUpload(course._id, e)} style={{ display: 'none' }}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.webm,.jpg,.jpeg,.png,.gif,.webp" disabled={uploadingCourseId === course._id} />
                </label>
                <button onClick={() => { setShowLessonForm(showLessonForm === course._id ? null : course._id); setLessonForm({ title: '', content: '', duration: 0, videoUrl: '' }); }}
                  className="btn btn-sm btn-secondary">📖 Thêm bài học</button>
                <button onClick={() => { setShowAssignForm(showAssignForm === course._id ? null : course._id); setEditingAssign(null); setAssignForm({ title: '', description: '', maxScore: 100, dueDate: '' }); }}
                  className="btn btn-sm btn-secondary">📝 Thêm bài tập</button>
                <Link to={`/courses/${course._id}`} className="btn btn-sm btn-secondary">👁 Xem</Link>
              </div>

              {/* Lesson Form */}
              {showLessonForm === course._id && (
                <form onSubmit={e => handleLessonSubmit(e, course._id)} className="nested-form">
                  <h4>📖 Bài học mới</h4>
                  <div className="form-group"><label>Tên bài học</label>
                    <input type="text" value={lessonForm.title} onChange={e => setLessonForm({...lessonForm, title: e.target.value})} required /></div>
                  <div className="form-group"><label>Nội dung</label>
                    <textarea value={lessonForm.content} onChange={e => setLessonForm({...lessonForm, content: e.target.value})} rows={3} /></div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}><label>Thời lượng (phút)</label>
                      <input type="number" min="0" value={lessonForm.duration} onChange={e => setLessonForm({...lessonForm, duration: parseInt(e.target.value) || 0})} /></div>
                    <div className="form-group" style={{ flex: 2 }}><label>URL Video</label>
                      <input type="text" value={lessonForm.videoUrl} onChange={e => setLessonForm({...lessonForm, videoUrl: e.target.value})} placeholder="YouTube URL hoặc link video" /></div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary btn-sm">Tạo bài học</button>
                    <button type="button" onClick={() => setShowLessonForm(null)} className="btn btn-secondary btn-sm">Hủy</button>
                  </div>
                </form>
              )}

              {/* Assignment Form (Create / Edit) */}
              {showAssignForm === course._id && (
                <form onSubmit={e => handleAssignSubmit(e, course._id)} className="nested-form">
                  <h4>{editingAssign ? '✏️ Sửa bài tập' : '📝 Bài tập mới'}</h4>
                  <div className="form-group"><label>Tên bài tập</label>
                    <input type="text" value={assignForm.title} onChange={e => setAssignForm({...assignForm, title: e.target.value})} required /></div>
                  <div className="form-group"><label>Mô tả / Đề bài</label>
                    <textarea value={assignForm.description} onChange={e => setAssignForm({...assignForm, description: e.target.value})} rows={3} required /></div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="form-group" style={{ flex: 1 }}><label>Điểm tối đa</label>
                      <input type="number" min="0" value={assignForm.maxScore} onChange={e => setAssignForm({...assignForm, maxScore: parseInt(e.target.value) || 100})} /></div>
                    <div className="form-group" style={{ flex: 2 }}><label>Hạn nộp</label>
                      <input type="date" value={assignForm.dueDate} onChange={e => setAssignForm({...assignForm, dueDate: e.target.value})} /></div>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary btn-sm">{editingAssign ? 'Cập nhật' : 'Tạo bài tập'}</button>
                    <button type="button" onClick={() => { setShowAssignForm(null); setEditingAssign(null); }} className="btn btn-secondary btn-sm">Hủy</button>
                  </div>
                </form>
              )}

              {/* Materials List */}
              {course.materials?.length > 0 && (
                <div className="materials-list compact" style={{ marginTop: '12px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>📎 Tài liệu:</h4>
                  {course.materials.map(m => (
                    <div key={m._id} className="material-item">
                      <span className="material-icon">{getFileIcon(m.fileType)}</span>
                      <div className="material-info">
                        <a href={`http://localhost:5000/uploads/${m.filename}`} target="_blank" rel="noopener noreferrer" className="material-name">{m.originalName}</a>
                        <span className="material-size">{formatSize(m.fileSize)}</span>
                      </div>
                      <button onClick={() => handleDeleteMaterial(course._id, m._id)} className="btn btn-icon btn-danger" title="Xóa">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* Lessons List */}
              {courseLessons[course._id]?.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>📖 Bài học:</h4>
                  {courseLessons[course._id].map((l, i) => (
                    <div key={l._id} className="material-item">
                      <span className="lesson-order" style={{ width: '28px', textAlign: 'center' }}>{i+1}</span>
                      <div className="material-info">
                        <Link to={`/lessons/${l._id}`} className="material-name">{l.title}</Link>
                        <span className="material-size">{l.duration > 0 ? `${l.duration}p` : ''} {l.videoUrl ? '🎬' : ''}</span>
                      </div>
                      <button onClick={() => handleDeleteLesson(l._id)} className="btn btn-icon btn-danger" title="Xóa">✕</button>
                    </div>
                  ))}
                </div>
              )}

              {/* ========== ASSIGNMENTS LIST ========== */}
              {courseAssignments[course._id]?.length > 0 && (
                <div style={{ marginTop: '16px' }}>
                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>📝 Bài tập:</h4>
                  {courseAssignments[course._id].map(a => (
                    <div key={a._id} className="assignment-manage-card">
                      <div className="assignment-manage-header">
                        <div className="assignment-manage-info">
                          <h5>{a.title}</h5>
                          <div className="assignment-manage-meta">
                            <span>📊 Tối đa: {a.maxScore}đ</span>
                            {a.dueDate && <span>📅 Hạn: {new Date(a.dueDate).toLocaleDateString('vi-VN')}</span>}
                            <span>📎 {a.attachments?.length || 0} đính kèm</span>
                          </div>
                        </div>
                        <div className="assignment-manage-actions">
                          <label className="btn btn-icon btn-accent upload-btn" title="Đính kèm file">
                            {uploadingAssignId === a._id ? '⏳' : '📤'}
                            <input type="file" onChange={e => handleUploadAssignFile(a._id, e)} style={{ display: 'none' }}
                              accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.webm,.jpg,.jpeg,.png,.gif,.webp" disabled={uploadingAssignId === a._id} />
                          </label>
                          <button onClick={() => handleViewSubmissions(a._id)} className="btn btn-icon btn-secondary" title="Xem bài nộp">📋</button>
                          <button onClick={() => handleEditAssign(a, course._id)} className="btn btn-icon btn-secondary" title="Sửa">✏️</button>
                          <button onClick={() => handleDeleteAssign(a._id)} className="btn btn-icon btn-danger" title="Xóa">🗑️</button>
                        </div>
                      </div>

                      {a.description && (
                        <p className="assignment-manage-desc">{a.description.substring(0, 150)}{a.description.length > 150 ? '...' : ''}</p>
                      )}

                      {/* File đính kèm bài tập */}
                      {a.attachments?.length > 0 && (
                        <div className="assignment-attachments">
                          {a.attachments.map(att => (
                            <a key={att._id} href={`http://localhost:5000/uploads/${att.filename}`} target="_blank"
                              rel="noopener noreferrer" className="attachment-chip">
                              {getFileIcon(att.fileType)} {att.originalName}
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Submissions panel */}
                      {viewingSubmissions === a._id && (
                        <div className="submissions-panel">
                          <h5>📋 Bài nộp ({submissions.length})</h5>
                          {submissions.length === 0 ? (
                            <p className="text-muted" style={{ fontSize: '0.85rem' }}>Chưa có bài nộp nào.</p>
                          ) : (
                            <div className="submissions-list">
                              {submissions.map(sub => (
                                <div key={sub._id} className="submission-item">
                                  <div className="submission-item-header">
                                    <span className="submission-student">🎓 {sub.student?.name}</span>
                                    <span className={`submission-status status-${sub.status}`}>
                                      {sub.status === 'pending' ? '⏳ Chờ chấm' : `✅ ${sub.score}/${a.maxScore}đ`}
                                    </span>
                                  </div>
                                  {sub.content && <p className="submission-text">{sub.content}</p>}
                                  {sub.files?.length > 0 && (
                                    <div className="assignment-attachments">
                                      {sub.files.map(f => (
                                        <a key={f._id} href={`http://localhost:5000/uploads/${f.filename}`} target="_blank"
                                          rel="noopener noreferrer" className="attachment-chip">
                                          {getFileIcon(f.fileType)} {f.originalName}
                                        </a>
                                      ))}
                                    </div>
                                  )}

                                  {gradingId === sub._id ? (
                                    <div className="grade-form">
                                      <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                                        <div className="form-group" style={{ flex: '0 0 100px' }}>
                                          <label>Điểm /{a.maxScore}</label>
                                          <input type="number" min="0" max={a.maxScore} value={gradeForm.score}
                                            onChange={e => setGradeForm({...gradeForm, score: e.target.value})} />
                                        </div>
                                        <div className="form-group" style={{ flex: 1 }}>
                                          <label>Nhận xét</label>
                                          <input type="text" value={gradeForm.feedback} placeholder="Nhận xét (tùy chọn)"
                                            onChange={e => setGradeForm({...gradeForm, feedback: e.target.value})} />
                                        </div>
                                      </div>
                                      <div className="form-actions" style={{ marginTop: '8px' }}>
                                        <button className="btn btn-primary btn-sm" onClick={() => handleGrade(sub._id, a.maxScore)}>✅ Chấm</button>
                                        <button className="btn btn-secondary btn-sm" onClick={() => setGradingId(null)}>Hủy</button>
                                      </div>
                                    </div>
                                  ) : sub.status === 'pending' && (
                                    <button className="btn btn-sm btn-accent" style={{ marginTop: '8px' }}
                                      onClick={() => { setGradingId(sub._id); setGradeForm({ score: '', feedback: '' }); }}>
                                      📊 Chấm điểm
                                    </button>
                                  )}

                                  {sub.status === 'graded' && sub.feedback && (
                                    <p className="grade-feedback" style={{ marginTop: '6px' }}>💬 {sub.feedback}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
