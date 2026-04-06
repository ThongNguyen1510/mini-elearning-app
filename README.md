# 📚 Mini E-Learning System

Hệ thống quản lý khóa học trực tuyến (E-Learning) đầy đủ tính năng với 2 vai trò: **Giảng viên (Teacher)** và **Học viên (Student)**.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

---

## 🏗️ Kiến trúc hệ thống

```
mini-elearning-app/
├── elearning-backend/          # Backend API (Node.js + Express + MongoDB)
│   ├── models/                 # 13 Mongoose Models
│   │   ├── User.js             # Người dùng (teacher/student)
│   │   ├── Course.js           # Khóa học
│   │   ├── Category.js         # Danh mục khóa học
│   │   ├── Lesson.js           # Bài học
│   │   ├── Assignment.js       # Bài tập
│   │   ├── Submission.js       # Bài nộp
│   │   ├── Quiz.js             # Bài trắc nghiệm
│   │   ├── QuizAttempt.js      # Lượt làm bài trắc nghiệm
│   │   ├── QuizResult.js       # Kết quả trắc nghiệm
│   │   ├── Review.js           # Đánh giá khóa học
│   │   ├── Notification.js     # Thông báo tự động
│   │   ├── Progress.js         # Tiến độ học tập
│   │   └── Comment.js          # Bình luận bài học
│   ├── routes/                 # 13 RESTful API Routes
│   │   ├── auth.js             # Đăng ký, đăng nhập, profile
│   │   ├── courses.js          # CRUD khóa học + tìm kiếm/lọc/phân trang
│   │   ├── enrollments.js      # Đăng ký/hủy khóa học
│   │   ├── categories.js       # CRUD danh mục
│   │   ├── lessons.js          # CRUD bài học
│   │   ├── assignments.js      # CRUD bài tập
│   │   ├── submissions.js      # Nộp bài + chấm điểm
│   │   ├── quizzes.js          # CRUD quiz + làm bài + xem kết quả
│   │   ├── reviews.js          # Đánh giá khóa học
│   │   ├── notifications.js    # Thông báo
│   │   ├── progress.js         # Tiến độ học tập
│   │   ├── stats.js            # Thống kê dashboard
│   │   └── comments.js         # Bình luận / forum bài học
│   ├── middleware/
│   │   ├── auth.js             # JWT Authentication & Authorization
│   │   └── upload.js           # Multer file upload (50MB limit)
│   ├── seed.js                 # Seed danh mục mẫu
│   ├── seedAll.js              # Seed dữ liệu mẫu toàn diện
│   └── server.js               # Entry point
│
└── elearning-frontend/         # Frontend (React + Vite)
    └── src/
        ├── components/
        │   ├── Navbar.jsx       # Thanh navigation + notification bell + theme toggle
        │   └── ProtectedRoute.jsx # Route bảo vệ theo role
        ├── context/
        │   ├── AuthContext.jsx  # Quản lý đăng nhập/đăng ký
        │   └── ThemeContext.jsx # Quản lý Dark/Light theme
        ├── pages/
        │   ├── Login.jsx        # Trang đăng nhập
        │   ├── Register.jsx     # Trang đăng ký
        │   ├── CourseList.jsx   # Danh sách khóa học + search/filter/sort/pagination
        │   ├── CourseDetail.jsx # Chi tiết khóa học + progress tracking
        │   ├── TeacherDashboard.jsx # Dashboard giảng viên + thống kê
        │   ├── StudentDashboard.jsx # Dashboard học viên + tiến độ
        │   ├── LessonView.jsx   # Xem bài học + forum bình luận
        │   ├── AssignmentView.jsx # Xem bài tập + nộp bài + upload file
        │   ├── QuizView.jsx     # Làm bài trắc nghiệm
        │   └── Profile.jsx      # Hồ sơ cá nhân + đổi mật khẩu
        ├── services/
        │   └── api.js           # Axios API client (14 API modules)
        └── index.css            # Dark/Light theme + Glassmorphism UI
```

---

## ⚡ Tính năng chính

### 👨‍🏫 Giảng viên (Teacher)
| Tính năng | Mô tả |
|-----------|--------|
| 📚 Quản lý khóa học | Tạo, sửa, xóa khóa học + gán danh mục |
| 📤 Upload tài liệu | Upload PDF, Word, ảnh, video cho khóa học |
| 📖 Quản lý bài học | Tạo bài học với nội dung, video URL, tài liệu đính kèm |
| 📝 Quản lý bài tập | Tạo, sửa, xóa bài tập + đính kèm file |
| ✏️ Quản lý trắc nghiệm | Tạo quiz nhiều câu hỏi, giới hạn thời gian |
| ✅ Chấm điểm | Xem bài nộp, chấm điểm + nhận xét |
| 📂 Quản lý danh mục | Tạo, xóa danh mục khóa học |
| 📊 Dashboard thống kê | Tổng học viên, bài nộp, chờ chấm, lượt quiz, đánh giá TB |
| 🔔 Thông báo | Nhận thông báo khi có bài nộp, đánh giá, bình luận mới |
| 💬 Quản lý bình luận | Xóa bình luận không phù hợp trong bài học |

### 🎓 Học viên (Student)
| Tính năng | Mô tả |
|-----------|--------|
| 🔍 Tìm kiếm nâng cao | Tìm kiếm theo tên/mô tả, lọc danh mục, sắp xếp 6 kiểu |
| 📄 Phân trang | Duyệt khóa học với phân trang thông minh |
| 📝 Đăng ký khóa học | Đăng ký / hủy đăng ký 1 click |
| 📖 Xem bài học | Xem nội dung + video bài giảng + tài liệu |
| ✅ Theo dõi tiến độ | Đánh dấu bài học hoàn thành, xem % tiến độ |
| 📤 Nộp bài tập | Viết nội dung + upload file đính kèm nộp bài |
| ✏️ Làm trắc nghiệm | Làm quiz có giới hạn thời gian, xem kết quả chi tiết |
| ⭐ Đánh giá | Đánh giá khóa học 1-5 sao + nhận xét |
| 📊 Dashboard thống kê | Khóa học, bài nộp, lượt quiz, điểm trung bình |
| 💬 Bình luận bài học | Viết bình luận, trả lời, sửa, xóa |
| 🔔 Thông báo | Nhận thông báo bài học mới, kết quả chấm, bài tập mới |
| 👤 Hồ sơ cá nhân | Xem/sửa thông tin, đổi mật khẩu |

### 🎨 Giao diện
| Tính năng | Mô tả |
|-----------|--------|
| 🌙☀️ Dark/Light Theme | Chuyển đổi 1 click, lưu vào localStorage |
| 💎 Glassmorphism | Hiệu ứng kính mờ hiện đại |
| 📱 Responsive | Tương thích mobile & desktop |
| ✨ Animations | fadeIn, fadeInUp, hover effects, micro-animations |
| 🔤 Typography | Inter font (Google Fonts) |

---

## 📊 13 Models (Database Schema)

| # | Model | Mô tả | CRUD | Auth | Upload |
|---|-------|--------|------|------|--------|
| 1 | **User** | Người dùng (teacher/student) | Register, Login, Profile | JWT + bcrypt | — |
| 2 | **Course** | Khóa học | ✅ Full + Search/Paginate | Teacher owner | ✅ Materials |
| 3 | **Category** | Danh mục khóa học | ✅ Full | Teacher only | — |
| 4 | **Lesson** | Bài học trong khóa học | ✅ Full | Teacher owner | ✅ Attachments |
| 5 | **Assignment** | Bài tập | ✅ Full | Teacher owner | ✅ Attachments |
| 6 | **Submission** | Bài nộp của học viên | Create, Read, Update, Grade | Student nộp, Teacher chấm | ✅ Files |
| 7 | **Quiz** | Bài trắc nghiệm | ✅ Full | Teacher owner | — |
| 8 | **QuizAttempt** | Lượt làm quiz | Create, Read | Student làm bài | — |
| 9 | **QuizResult** | Kết quả quiz | Auto-created | System | — |
| 10 | **Review** | Đánh giá khóa học (1-5⭐) | ✅ Full | Student enrolled | — |
| 11 | **Notification** | Thông báo tự động | Read, Mark Read, Delete | User owner | — |
| 12 | **Progress** | Tiến độ học tập | Create, Read, Update | Student | — |
| 13 | **Comment** | Bình luận / forum bài học | ✅ Full + Reply | Login required | — |

---

## 🔐 Authentication & Authorization

- **JWT Token**: Đăng nhập trả về token, tự động gửi qua `Authorization: Bearer <token>`
- **Mã hóa mật khẩu**: bcryptjs (salt 10 rounds)
- **Phân quyền Role**: Teacher vs Student middleware
- **Owner check**: Chỉ teacher tạo khóa học mới được sửa/xóa
- **Enrollment check**: Chỉ student đã đăng ký mới được đánh giá, nộp bài
- **Profile management**: Cập nhật tên, đổi mật khẩu

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

**Seed cơ bản** (chỉ danh mục):
```bash
node seed.js
```

**Seed toàn diện** (5 users, 8 categories, 8 courses, 20 lessons, 8 assignments, 4 quizzes):
```bash
node seedAll.js
```

> **Tài khoản mẫu sau khi seed:**
> | Email | Mật khẩu | Vai trò |
> |-------|----------|---------|
> | teacher1@test.com | 123456 | Giảng viên |
> | teacher2@test.com | 123456 | Giảng viên |
> | student1@test.com | 123456 | Học viên |
> | student2@test.com | 123456 | Học viên |
> | student3@test.com | 123456 | Học viên |

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
> 🚀 Server chạy tại: http://localhost:5000

**Terminal 2 — Frontend:**
```bash
cd elearning-frontend
npm run dev
```
> ⚡ App chạy tại: http://localhost:5173

---

## 📡 API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| POST | `/register` | Đăng ký tài khoản | Public |
| POST | `/login` | Đăng nhập | Public |
| GET | `/me` | Thông tin user hiện tại | Private |
| PUT | `/profile` | Cập nhật thông tin cá nhân | Private |
| PUT | `/password` | Đổi mật khẩu | Private |

### Courses (`/api/courses`)
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/` | Danh sách khóa học (search, filter, sort, paginate) | Public |
| GET | `/:id` | Chi tiết khóa học | Public |
| POST | `/` | Tạo khóa học | Teacher |
| PUT | `/:id` | Cập nhật khóa học | Teacher owner |
| DELETE | `/:id` | Xóa khóa học | Teacher owner |
| POST | `/:id/upload` | Upload tài liệu | Teacher owner |
| DELETE | `/:id/materials/:materialId` | Xóa tài liệu | Teacher owner |

> **Query params cho GET `/`:**
> `search`, `teacher`, `category`, `sort` (newest/oldest/rating/popular/az/za), `page`, `limit`

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

### Quizzes (`/api/quizzes`)
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/course/:courseId` | Quiz theo khóa | Private |
| GET | `/:id` | Chi tiết quiz | Private |
| POST | `/` | Tạo quiz | Teacher owner |
| PUT | `/:id` | Sửa quiz | Teacher owner |
| DELETE | `/:id` | Xóa quiz | Teacher owner |
| POST | `/:id/submit` | Nộp bài quiz | Student enrolled |
| GET | `/:id/my-attempts` | Lượt làm của tôi | Student |
| GET | `/:id/all-attempts` | Tất cả lượt làm | Teacher |

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

### Progress (`/api/progress`)
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/:courseId` | Tiến độ khóa học | Student |
| GET | `/my/all` | Tiến độ tất cả khóa | Student |
| POST | `/:courseId/complete/:lessonId` | Đánh dấu hoàn thành | Student |
| POST | `/:courseId/uncomplete/:lessonId` | Bỏ đánh dấu | Student |

### Stats (`/api/stats`)
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/teacher` | Thống kê teacher dashboard | Teacher |
| GET | `/student` | Thống kê student dashboard | Student |

### Comments (`/api/comments`)
| Method | Endpoint | Mô tả | Access |
|--------|----------|--------|--------|
| GET | `/lesson/:lessonId` | Bình luận theo bài học | Public |
| POST | `/` | Viết bình luận | Private |
| PUT | `/:id` | Sửa bình luận | Owner |
| DELETE | `/:id` | Xóa bình luận | Owner / Teacher |

---

## 🎨 Giao diện

- **Dark/Light Theme**: Chuyển đổi 1 click (nút 🌙/☀️ trên Navbar), lưu localStorage
- **Glassmorphism**: Backdrop blur, gradient backgrounds
- **Responsive**: Mobile-first, grid layout tự co giãn
- **Font**: Inter (Google Fonts)
- **Animations**: fadeIn, fadeInUp, hover effects, smooth transitions
- **Components**:
  - 📊 Stats Cards (Dashboard thống kê)
  - ⭐ Star Rating (Đánh giá)
  - 🎬 Video Player (YouTube embed / HTML5 video)
  - 🔔 Notification Bell (Real-time dropdown)
  - 🏷️ Category Chips (Filter nhanh)
  - 📄 Pagination (Phân trang thông minh)
  - 📊 Progress Bars (Thanh tiến độ)
  - 💬 Threaded Comments (Bình luận + trả lời)
  - 🔍 Search + Sort Bar (Tìm kiếm + Sắp xếp)
  - 👤 Profile Page (Hồ sơ cá nhân)

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

## 📁 Trang chính

| Trang | Đường dẫn | Mô tả |
|-------|----------|--------|
| Đăng nhập | `/login` | Form đăng nhập |
| Đăng ký | `/register` | Form đăng ký (chọn Teacher/Student) |
| Danh sách khóa học | `/courses` | Tìm kiếm, lọc, sort, phân trang |
| Chi tiết khóa học | `/courses/:id` | Info, bài học, bài tập, quiz, đánh giá, progress |
| Xem bài học | `/lessons/:id` | Nội dung + video + tài liệu + bình luận |
| Xem bài tập | `/assignments/:id` | Chi tiết + nộp bài + upload file |
| Làm quiz | `/quizzes/:id` | Làm bài trắc nghiệm + xem kết quả |
| Dashboard Giảng viên | `/teacher/dashboard` | Thống kê + CRUD khóa/bài/quiz |
| Dashboard Học viên | `/student/dashboard` | Thống kê + tiến độ các khóa |
| Hồ sơ cá nhân | `/profile` | Xem/sửa thông tin + đổi mật khẩu |

---

## 👤 Tác giả

**Thong Nguyen** — [GitHub](https://github.com/ThongNguyen1510)