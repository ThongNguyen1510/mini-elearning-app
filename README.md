# 📚 Mini E-Learning System

Hệ thống quản lý khóa học trực tuyến (E-Learning) với 2 vai trò: **Giảng viên (Teacher)** và **Học viên (Student)**.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

---

## 🏗️ Kiến trúc hệ thống

```
mini-elearning-app/
├── elearning-backend/          # Backend API (Node.js + Express + MongoDB)
│   ├── models/                 # 8 Mongoose Models
│   │   ├── User.js
│   │   ├── Course.js
│   │   ├── Category.js
│   │   ├── Lesson.js
│   │   ├── Assignment.js
│   │   ├── Submission.js
│   │   ├── Review.js
│   │   └── Notification.js
│   ├── routes/                 # RESTful API Routes
│   │   ├── auth.js
│   │   ├── courses.js
│   │   ├── enrollments.js
│   │   ├── categories.js
│   │   ├── lessons.js
│   │   ├── assignments.js
│   │   ├── submissions.js
│   │   ├── reviews.js
│   │   └── notifications.js
│   ├── middleware/
│   │   ├── auth.js             # JWT Authentication & Authorization
│   │   └── upload.js           # Multer file upload (50MB limit)
│   ├── seed.js                 # Script tạo dữ liệu mẫu
│   └── server.js               # Entry point
│
└── elearning-frontend/         # Frontend (React + Vite)
    └── src/
        ├── components/
        │   ├── Navbar.jsx
        │   └── ProtectedRoute.jsx
        ├── context/
        │   └── AuthContext.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── CourseList.jsx
        │   ├── CourseDetail.jsx
        │   ├── TeacherDashboard.jsx
        │   ├── StudentDashboard.jsx
        │   ├── LessonView.jsx
        │   └── AssignmentView.jsx
        ├── services/
        │   └── api.js           # Axios API client
        └── index.css            # Dark theme + Glassmorphism UI
```

---

## ⚡ Tính năng chính

### 👨‍🏫 Giảng viên (Teacher)
| Tính năng | Mô tả |
|-----------|--------|
| Quản lý khóa học | Tạo, sửa, xóa khóa học + gán danh mục |
| Upload tài liệu | Upload PDF, Word, ảnh, video cho khóa học |
| Quản lý bài học | Tạo bài học với nội dung, video URL, tài liệu đính kèm |
| Quản lý bài tập | Tạo, sửa, xóa bài tập + đính kèm file (ảnh, PDF...) |
| Chấm điểm | Xem bài nộp của học viên, chấm điểm + nhận xét |
| Quản lý danh mục | Tạo, xóa danh mục khóa học |
| Thông báo | Nhận thông báo khi có bài nộp mới, đánh giá mới |

### 🎓 Học viên (Student)
| Tính năng | Mô tả |
|-----------|--------|
| Duyệt khóa học | Tìm kiếm, lọc theo danh mục |
| Đăng ký khóa học | Đăng ký / hủy đăng ký |
| Xem bài học | Xem nội dung + video bài giảng |
| Nộp bài tập | Viết nội dung + upload file nộp bài |
| Đánh giá | Đánh giá khóa học 1-5 sao + nhận xét |
| Xem điểm | Xem kết quả chấm điểm + feedback |
| Thông báo | Nhận thông báo bài học mới, bài tập mới, kết quả chấm |

---

## 📊 8 Models (Database Schema)

| # | Model | Mô tả | CRUD | Auth | Upload |
|---|-------|--------|------|------|--------|
| 1 | **User** | Người dùng (teacher/student) | Register, Login, GetMe | JWT + bcrypt | — |
| 2 | **Course** | Khóa học | ✅ Full | Teacher owner | ✅ Materials |
| 3 | **Category** | Danh mục khóa học | ✅ Full | Teacher only | — |
| 4 | **Lesson** | Bài học trong khóa học | ✅ Full | Teacher owner | ✅ Attachments |
| 5 | **Assignment** | Bài tập | ✅ Full | Teacher owner | ✅ Attachments |
| 6 | **Submission** | Bài nộp của học viên | Create, Read, Update, Grade | Student nộp, Teacher chấm | ✅ Files |
| 7 | **Review** | Đánh giá khóa học (1-5⭐) | ✅ Full | Student enrolled | — |
| 8 | **Notification** | Thông báo tự động | Read, Mark Read, Delete | User owner | — |

---

## 🔐 Authentication & Authorization

- **JWT Token**: Đăng nhập trả về token, tự động gửi qua `Authorization: Bearer <token>`
- **Mã hóa mật khẩu**: bcryptjs (salt 10 rounds)
- **Phân quyền Role**: Teacher vs Student middleware
- **Owner check**: Chỉ teacher tạo khóa học mới được sửa/xóa
- **Enrollment check**: Chỉ student đã đăng ký mới được đánh giá, nộp bài

---

## 📤 Upload File

- **Engine**: Multer với disk storage
- **Giới hạn**: 50MB / file
- **Định dạng**: PDF, DOC, DOCX, PPT, PPTX, MP4, WEBM, OGG, JPG, PNG, GIF, WEBP
- **Thư mục**: `elearning-backend/uploads/`
- **Áp dụng cho**: Tài liệu khóa học, bài học, bài tập, bài nộp

---

## 🚀 Cài đặt & Chạy

### Yêu cầu
- **Node.js** >= 18
- **MongoDB** (chạy local hoặc MongoDB Atlas)
- **Git**

### 1. Clone project
```bash
git clone https://github.com/ThongNguyen1510/mini-elearning-app.git
cd mini-elearning-app
```

### 2. Cài đặt Backend
```bash
cd elearning-backend
npm install
```

Tạo file `.env`:
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/elearning
JWT_SECRET=your_jwt_secret_key_here
```

### 3. Seed dữ liệu mẫu (tùy chọn)
```bash
node seed.js
```
> Tạo 8 danh mục mẫu: Lập trình, Thiết kế, Kinh doanh, Ngoại ngữ, Khoa học, Mobile, Data Science, Kỹ năng mềm

### 4. Cài đặt Frontend
```bash
cd ../elearning-frontend
npm install
```

### 5. Chạy ứng dụng

**Terminal 1 — Backend:**
```bash
cd elearning-backend
node server.js
```
> Server chạy tại: http://localhost:5000

**Terminal 2 — Frontend:**
```bash
cd elearning-frontend
npm run dev
```
> App chạy tại: http://localhost:5173

---

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| POST | `/register` | Đăng ký tài khoản | Public |
| POST | `/login` | Đăng nhập | Public |
| GET | `/me` | Thông tin user hiện tại | Private |

### Courses (`/api/courses`)
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/` | Danh sách khóa học (search, filter) | Public |
| GET | `/:id` | Chi tiết khóa học | Public |
| POST | `/` | Tạo khóa học | Teacher |
| PUT | `/:id` | Cập nhật khóa học | Teacher owner |
| DELETE | `/:id` | Xóa khóa học | Teacher owner |
| POST | `/:id/upload` | Upload tài liệu | Teacher owner |
| DELETE | `/:id/materials/:materialId` | Xóa tài liệu | Teacher owner |

### Categories (`/api/categories`)
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/` | Danh sách danh mục | Public |
| GET | `/:id` | Chi tiết danh mục | Public |
| POST | `/` | Tạo danh mục | Teacher |
| PUT | `/:id` | Sửa danh mục | Teacher |
| DELETE | `/:id` | Xóa danh mục | Teacher |

### Lessons (`/api/lessons`)
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/course/:courseId` | Bài học theo khóa | Public |
| GET | `/:id` | Chi tiết bài học | Public |
| POST | `/` | Tạo bài học | Teacher owner |
| PUT | `/:id` | Sửa bài học | Teacher owner |
| DELETE | `/:id` | Xóa bài học | Teacher owner |
| POST | `/:id/upload` | Upload tài liệu bài học | Teacher owner |

### Assignments (`/api/assignments`)
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/course/:courseId` | Bài tập theo khóa | Private |
| GET | `/:id` | Chi tiết bài tập | Private |
| POST | `/` | Tạo bài tập | Teacher owner |
| PUT | `/:id` | Sửa bài tập | Teacher owner |
| DELETE | `/:id` | Xóa bài tập | Teacher owner |
| POST | `/:id/upload` | Upload đính kèm | Teacher owner |

### Submissions (`/api/submissions`)
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| POST | `/` | Nộp bài | Student enrolled |
| GET | `/:id` | Chi tiết bài nộp | Owner / Teacher |
| GET | `/assignment/:id` | Tất cả bài nộp | Teacher |
| GET | `/my/:assignmentId` | Bài nộp của tôi | Student |
| PUT | `/:id` | Cập nhật bài nộp | Student owner |
| PUT | `/:id/grade` | Chấm điểm | Teacher |
| POST | `/:id/upload` | Upload file nộp bài | Student owner |

### Reviews (`/api/reviews`)
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/course/:courseId` | Đánh giá theo khóa | Public |
| POST | `/` | Viết đánh giá | Student enrolled |
| PUT | `/:id` | Sửa đánh giá | Student owner |
| DELETE | `/:id` | Xóa đánh giá | Student owner |

### Enrollments (`/api/enrollments`)
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| POST | `/:id/enroll` | Đăng ký khóa học | Student |
| POST | `/:id/unenroll` | Hủy đăng ký | Student |
| GET | `/my-courses` | Khóa học đã đăng ký | Student |

### Notifications (`/api/notifications`)
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/` | Danh sách thông báo | Private |
| PUT | `/:id/read` | Đánh dấu đã đọc | Private |
| PUT | `/read-all` | Đọc tất cả | Private |
| DELETE | `/:id` | Xóa thông báo | Private |

---

## 🎨 Giao diện

- **Dark Theme** với gradient tím-xanh
- **Glassmorphism** effect (backdrop blur)
- **Responsive** trên mobile & desktop
- **Font**: Inter (Google Fonts)
- **Animations**: fadeIn, fadeInUp, hover effects
- **Components**: Tabs, Star Rating, Video Player, Notification Bell, Category Chips

---

## 🛠️ Công nghệ sử dụng

### Backend
| Package | Mục đích |
|---------|----------|
| express | Web framework |
| mongoose | MongoDB ODM |
| jsonwebtoken | JWT authentication |
| bcryptjs | Mã hóa mật khẩu |
| multer | Upload file |
| cors | Cross-origin requests |
| express-validator | Validation |
| dotenv | Environment variables |

### Frontend
| Package | Mục đích |
|---------|----------|
| react | UI library |
| react-router-dom | Client-side routing |
| axios | HTTP client |
| vite | Build tool & dev server |

---

## 👤 Tác giả

**Thong Nguyen** — [GitHub](https://github.com/ThongNguyen1510)