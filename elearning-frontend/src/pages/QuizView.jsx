import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const QuizView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [myAttempts, setMyAttempts] = useState([]);

  useEffect(() => {
    fetchQuiz();
    if (user?.role === 'student') fetchMyResults();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const res = await quizAPI.getById(id);
      setQuiz(res.data.quiz);
      setSelectedAnswers(new Array(res.data.quiz.questions.length).fill(null));
    } catch (err) { setMessage({ text: 'Lỗi tải bài trắc nghiệm', type: 'error' }); }
    finally { setLoading(false); }
  };

  const fetchMyResults = async () => {
    try {
      const res = await quizAPI.getMyResults(id);
      setMyAttempts(res.data.results);
    } catch (err) {}
  };

  const handleOptionSelect = (optionIndex) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestion] = optionIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleSubmitQuiz = async () => {
    if (selectedAnswers.includes(null)) {
      if (!window.confirm('Bạn chưa trả lời hết các câu hỏi. Vẫn muốn nộp chứ?')) return;
    }
    try {
      const res = await quizAPI.submit(id, selectedAnswers);
      setResult(res.data.result);
      setIsFinished(true);
      fetchMyResults();
    } catch (err) { setMessage({ text: 'Lỗi nộp bài', type: 'error' }); }
  };

  if (loading) return <div className="loading">Đang tải...</div>;
  if (!quiz) return <div className="empty-state"><h3>Không tìm thấy bài trắc nghiệm</h3></div>;

  return (
    <div className="page-container">
      <button onClick={() => navigate(-1)} className="btn-back">← Quay lại</button>

      <div className="assignment-detail">
        <div className="course-detail-header">
          <h1>✏️ Trắc nghiệm: {quiz.title}</h1>
          <div className="course-meta">
            <span>❓ {quiz.questions.length} câu hỏi</span>
            {quiz.timeLimit > 0 && <span>⏱ {quiz.timeLimit} phút</span>}
          </div>
        </div>

        {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

        {!isFinished ? (
          <div className="quiz-container">
            <div className="quiz-progress">
              Câu hỏi {currentQuestion + 1} / {quiz.questions.length}
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}></div>
              </div>
            </div>

            <div className="quiz-question-card">
              <h3>{quiz.questions[currentQuestion].question}</h3>
              <div className="options-list">
                {quiz.questions[currentQuestion].options.map((opt, idx) => (
                  <button key={idx}
                    className={`option-btn ${selectedAnswers[currentQuestion] === idx ? 'selected' : ''}`}
                    onClick={() => handleOptionSelect(idx)}>
                    <span className="option-label">{String.fromCharCode(65 + idx)}</span>
                    <span className="option-text">{opt}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="quiz-navigation">
              <button className="btn btn-secondary" disabled={currentQuestion === 0}
                onClick={() => setCurrentQuestion(v => v - 1)}>Câu trước</button>
              
              {currentQuestion < quiz.questions.length - 1 ? (
                <button className="btn btn-primary" onClick={() => setCurrentQuestion(v => v + 1)}>Câu tiếp</button>
              ) : (
                <button className="btn btn-accent" onClick={handleSubmitQuiz}>Nộp bài</button>
              )}
            </div>
          </div>
        ) : (
          <div className="quiz-result-view">
            <div className="result-header">
              <h2>Kết quả của bạn</h2>
              <div className="result-score">
                <span className="score-big">{result.score} / {result.totalQuestions}</span>
                <span className="score-percent">({result.percentage}%)</span>
              </div>
            </div>
            
            <button className="btn btn-primary" onClick={() => { setIsFinished(false); setCurrentQuestion(0); }}>Làm lại</button>
          </div>
        )}

        {/* History for Student */}
        {user?.role === 'student' && myAttempts.length > 0 && (
          <div className="submissions-section" style={{ marginTop: '40px' }}>
            <h2>📊 Lịch sử nộp bài</h2>
            <div className="teacher-course-list">
              {myAttempts.map((att, i) => (
                <div key={att._id} className="teacher-course-card compact">
                  <div className="teacher-course-header">
                    <span>Lần nộp {myAttempts.length - i}</span>
                    <span className={`submission-status status-${att.percentage >= 50 ? 'graded' : 'pending'}`}>
                      {att.score}/{att.totalQuestions} ({att.percentage}%)
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {new Date(att.finishedAt).toLocaleString('vi-VN')}
                    </span>
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

export default QuizView;
