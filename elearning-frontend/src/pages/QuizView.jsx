import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LABELS = ['A', 'B', 'C', 'D'];

const QuizView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [submitting, setSubmitting] = useState(false);
  const [myAttempts, setMyAttempts] = useState([]);
  const [startedAt] = useState(Date.now());

  useEffect(() => {
    fetchQuiz();
    if (user?.role === 'student') fetchMyAttempts();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await quizAPI.getById(id);
      setQuiz(res.data.quiz);
    } catch (err) { setMessage({ text: 'Lỗi tải quiz', type: 'error' }); }
    finally { setLoading(false); }
  };

  const fetchMyAttempts = async () => {
    try {
      const res = await quizAPI.myAttempts(id);
      setMyAttempts(res.data.attempts);
    } catch (err) {}
  };

  const handleSelect = (qId, optIdx) => {
    if (submitted) return;
    setAnswers({ ...answers, [qId]: optIdx });
  };

  const handleSubmit = async () => {
    const answered = Object.keys(answers).length;
    const total = quiz.questions.length;
    if (answered < total) {
      if (!window.confirm(`Bạn mới trả lời ${answered}/${total} câu. Vẫn nộp bài?`)) return;
    }
    setSubmitting(true);
    try {
      const submitData = {
        answers: quiz.questions.map(q => ({
          questionId: q._id,
          selectedOption: answers[q._id] !== undefined ? answers[q._id] : -1,
        })),
        startedAt,
      };
      const res = await quizAPI.submit(id, submitData);
      setResult(res.data.attempt);
      setResults(res.data.results);
      setSubmitted(true);
      setCurrentQ(0);
      fetchMyAttempts();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || 'Lỗi nộp bài', type: 'error' });
    }
    finally { setSubmitting(false); }
  };

  const handleRetry = () => {
    setSubmitted(false);
    setResult(null);
    setResults([]);
    setAnswers({});
    setCurrentQ(0);
    fetchQuiz();
  };

  if (loading) return <div className="loading">Đang tải quiz...</div>;
  if (!quiz) return <div className="empty-state"><h3>Không tìm thấy quiz</h3></div>;

  const q = quiz.questions[currentQ];
  const totalQ = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="btn-back">← Quay lại</button>

      <div className="quiz-page">
        {/* Header */}
        <div className="quiz-header">
          <h1>📝 {quiz.title}</h1>
          {quiz.description && <p className="quiz-desc">{quiz.description}</p>}
          <div className="quiz-info">
            <span>❓ {totalQ} câu hỏi</span>
            {quiz.timeLimit > 0 && <span>⏱ {quiz.timeLimit} phút</span>}
            {quiz.passingScore && <span>🎯 Đạt: {quiz.passingScore}%</span>}
            {!submitted && <span>✅ Đã trả lời: {answeredCount}/{totalQ}</span>}
          </div>
        </div>

        {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

        {/* === CHƯA NỘP BÀI === */}
        {!submitted && (
          <>
            {/* Progress bar */}
            <div className="quiz-progress">
              <div className="quiz-progress-text">Câu {currentQ + 1} / {totalQ}</div>
              <div className="quiz-progress-bar">
                <div className="quiz-progress-fill" style={{ width: `${((currentQ + 1) / totalQ) * 100}%` }}></div>
              </div>
            </div>

            {/* Question dots */}
            <div className="quiz-dots">
              {quiz.questions.map((qq, i) => (
                <button key={i}
                  className={`quiz-dot ${i === currentQ ? 'current' : ''} ${answers[qq._id] !== undefined ? 'answered' : ''}`}
                  onClick={() => setCurrentQ(i)}>
                  {i + 1}
                </button>
              ))}
            </div>

            {/* Question Card */}
            <div className="quiz-question-card">
              <div className="quiz-question-number">Câu {currentQ + 1}</div>
              <h3 className="quiz-question-text">{q.question}</h3>

              <div className="quiz-options">
                {q.options.map((opt, idx) => (
                  <button key={idx}
                    className={`quiz-option ${answers[q._id] === idx ? 'selected' : ''}`}
                    onClick={() => handleSelect(q._id, idx)}>
                    <span className="quiz-option-label">{LABELS[idx]}</span>
                    <span className="quiz-option-text">{opt}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="quiz-nav">
              <button className="btn btn-secondary" disabled={currentQ === 0}
                onClick={() => setCurrentQ(v => v - 1)}>
                ← Câu trước
              </button>
              <div className="quiz-nav-center">
                {currentQ < totalQ - 1 ? (
                  <button className="btn btn-primary" onClick={() => setCurrentQ(v => v + 1)}>
                    Câu tiếp →
                  </button>
                ) : (
                  <button className="btn btn-accent btn-lg" onClick={handleSubmit} disabled={submitting}>
                    {submitting ? '⏳ Đang chấm...' : '📤 Nộp bài'}
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        {/* === KẾT QUẢ === */}
        {submitted && result && (
          <>
            <div className={`quiz-result-banner ${result.passed ? 'passed' : 'failed'}`}>
              <div className="quiz-result-icon">{result.passed ? '🎉' : '😔'}</div>
              <h2>{result.passed ? 'Chúc mừng! Bạn đã ĐẠT!' : 'Chưa đạt, hãy cố gắng!'}</h2>
              <div className="quiz-result-stats">
                <div className="quiz-stat">
                  <span className="quiz-stat-value">{result.score}%</span>
                  <span className="quiz-stat-label">Điểm số</span>
                </div>
                <div className="quiz-stat">
                  <span className="quiz-stat-value">{result.correctCount}/{result.totalQuestions}</span>
                  <span className="quiz-stat-label">Câu đúng</span>
                </div>
                <div className="quiz-stat">
                  <span className="quiz-stat-value">{result.passingScore}%</span>
                  <span className="quiz-stat-label">Yêu cầu</span>
                </div>
              </div>
              <button className="btn btn-primary" onClick={handleRetry} style={{ marginTop: '16px' }}>
                🔄 Làm lại
              </button>
            </div>

            {/* Chi tiết đáp án */}
            <div className="quiz-answers-review">
              <h3>📋 Chi tiết đáp án</h3>
              {results.map((r, i) => (
                <div key={i} className={`quiz-answer-card ${r.isCorrect ? 'correct' : 'wrong'}`}>
                  <div className="quiz-answer-header">
                    <span className="quiz-answer-num">Câu {i + 1}</span>
                    <span className={`quiz-answer-badge ${r.isCorrect ? 'correct' : 'wrong'}`}>
                      {r.isCorrect ? '✅ Đúng' : '❌ Sai'}
                    </span>
                  </div>
                  <p className="quiz-answer-question">{r.question}</p>
                  <div className="quiz-answer-options">
                    {r.options.map((opt, idx) => (
                      <div key={idx} className={`quiz-answer-option 
                        ${idx === r.correctOption ? 'is-correct' : ''} 
                        ${idx === r.selectedOption && idx !== r.correctOption ? 'is-wrong' : ''}
                        ${idx === r.selectedOption ? 'is-selected' : ''}`}>
                        <span className="quiz-option-label">{LABELS[idx]}</span>
                        <span>{opt}</span>
                        {idx === r.correctOption && <span className="quiz-correct-mark">✓</span>}
                        {idx === r.selectedOption && idx !== r.correctOption && <span className="quiz-wrong-mark">✗</span>}
                      </div>
                    ))}
                  </div>
                  {r.explanation && (
                    <div className="quiz-explanation">
                      💡 <strong>Giải thích:</strong> {r.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Lịch sử */}
        {user?.role === 'student' && myAttempts.length > 0 && (
          <div className="quiz-history">
            <h3>📊 Lịch sử làm bài</h3>
            <div className="quiz-history-list">
              {myAttempts.map((att, i) => (
                <div key={att._id} className="quiz-history-item">
                  <span className="quiz-history-num">Lần {myAttempts.length - i}</span>
                  <span className={`submission-status ${att.passed ? 'status-graded' : 'status-pending'}`}>
                    {att.correctCount}/{att.totalQuestions} ({att.score}%)
                  </span>
                  <span className="quiz-history-badge">{att.passed ? '✅ Đạt' : '❌ Chưa đạt'}</span>
                  <span className="text-muted" style={{ fontSize: '0.78rem' }}>
                    {new Date(att.completedAt || att.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizView;
