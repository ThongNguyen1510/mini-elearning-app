import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PrivateRoute, RoleRoute } from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseList from './pages/CourseList';
import CourseDetail from './pages/CourseDetail';
import TeacherDashboard from './pages/TeacherDashboard';
import StudentDashboard from './pages/StudentDashboard';
import LessonView from './pages/LessonView';
import AssignmentView from './pages/AssignmentView';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/courses" />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/courses" element={<CourseList />} />
              <Route path="/courses/:id" element={<CourseDetail />} />
              <Route path="/lessons/:id" element={<LessonView />} />
              <Route path="/assignments/:id" element={
                <PrivateRoute><AssignmentView /></PrivateRoute>
              } />
              <Route path="/teacher/dashboard" element={
                <RoleRoute role="teacher"><TeacherDashboard /></RoleRoute>
              } />
              <Route path="/student/dashboard" element={
                <RoleRoute role="student"><StudentDashboard /></RoleRoute>
              } />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
