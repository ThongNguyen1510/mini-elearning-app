import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Tự động thêm token vào header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi 401 - tự động logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Category API
export const categoryAPI = {
  getAll: () => api.get('/categories'),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Course API
export const courseAPI = {
  getAll: (params = '') => api.get(`/courses${params ? `?${params}` : ''}`),
  getById: (id) => api.get(`/courses/${id}`),
  create: (data) => api.post('/courses', data),
  update: (id, data) => api.put(`/courses/${id}`, data),
  delete: (id) => api.delete(`/courses/${id}`),
  upload: (id, formData) =>
    api.post(`/courses/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteMaterial: (courseId, materialId) =>
    api.delete(`/courses/${courseId}/materials/${materialId}`),
  getByTeacher: (teacherId) => api.get(`/courses?teacher=${teacherId}`),
  getByCategory: (categoryId) => api.get(`/courses?category=${categoryId}`),
};

// Enrollment API
export const enrollmentAPI = {
  enroll: (courseId) => api.post(`/enrollments/${courseId}/enroll`),
  unenroll: (courseId) => api.post(`/enrollments/${courseId}/unenroll`),
  myCourses: () => api.get('/enrollments/my-courses'),
};

// Lesson API
export const lessonAPI = {
  getByCourse: (courseId) => api.get(`/lessons/course/${courseId}`),
  getById: (id) => api.get(`/lessons/${id}`),
  create: (data) => api.post('/lessons', data),
  update: (id, data) => api.put(`/lessons/${id}`, data),
  delete: (id) => api.delete(`/lessons/${id}`),
  upload: (id, formData) =>
    api.post(`/lessons/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteAttachment: (lessonId, attId) =>
    api.delete(`/lessons/${lessonId}/attachments/${attId}`),
};

// Assignment API
export const assignmentAPI = {
  getByCourse: (courseId) => api.get(`/assignments/course/${courseId}`),
  getById: (id) => api.get(`/assignments/${id}`),
  create: (data) => api.post('/assignments', data),
  update: (id, data) => api.put(`/assignments/${id}`, data),
  delete: (id) => api.delete(`/assignments/${id}`),
  upload: (id, formData) =>
    api.post(`/assignments/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Submission API
export const submissionAPI = {
  create: (data) => api.post('/submissions', data),
  getById: (id) => api.get(`/submissions/${id}`),
  getByAssignment: (assignmentId) => api.get(`/submissions/assignment/${assignmentId}`),
  getMy: (assignmentId) => api.get(`/submissions/my/${assignmentId}`),
  update: (id, data) => api.put(`/submissions/${id}`, data),
  grade: (id, data) => api.put(`/submissions/${id}/grade`, data),
  upload: (id, formData) =>
    api.post(`/submissions/${id}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Review API
export const reviewAPI = {
  getByCourse: (courseId) => api.get(`/reviews/course/${courseId}`),
  create: (data) => api.post('/reviews', data),
  update: (id, data) => api.put(`/reviews/${id}`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

// Notification API
export const notificationAPI = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

export default api;
