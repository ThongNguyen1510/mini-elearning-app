import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp');
    }

    setLoading(true);

    try {
      const user = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role
      );
      if (user.role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/courses');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Đăng ký</h1>
          <p>Tạo tài khoản mới trên EduLearn</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name">Họ và tên</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="nhập họ và tên"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="nhập email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="reg-password">Mật khẩu</label>
            <input
              id="reg-password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="tối thiểu 6 ký tự"
              required
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="nhập lại mật khẩu"
              required
            />
          </div>

          <div className="form-group">
            <label>Bạn là</label>
            <div className="role-selector">
              <label
                className={`role-option ${formData.role === 'student' ? 'active' : ''}`}
              >
                <input
                  type="radio"
                  name="role"
                  value="student"
                  checked={formData.role === 'student'}
                  onChange={handleChange}
                />
                <span className="role-icon">🎓</span>
                <span className="role-label">Học viên</span>
              </label>
              <label
                className={`role-option ${formData.role === 'teacher' ? 'active' : ''}`}
              >
                <input
                  type="radio"
                  name="role"
                  value="teacher"
                  checked={formData.role === 'teacher'}
                  onChange={handleChange}
                />
                <span className="role-icon">👨‍🏫</span>
                <span className="role-label">Giảng viên</span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
          </button>
        </form>

        <p className="auth-footer">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
