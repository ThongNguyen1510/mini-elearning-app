import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Bảo vệ route - yêu cầu đăng nhập
export const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="loading-screen">Đang tải...</div>;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// Bảo vệ route theo role
export const RoleRoute = ({ children, role }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) return <div className="loading-screen">Đang tải...</div>;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (user.role !== role) return <Navigate to="/" />;
  
  return children;
};
