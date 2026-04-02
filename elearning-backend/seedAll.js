const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Category = require('./models/Category');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const Assignment = require('./models/Assignment');
const Quiz = require('./models/Quiz');

const seedAll = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công\n');

    // === XÓA DỮ LIỆU CŨ ===
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Course.deleteMany({}),
      Lesson.deleteMany({}),
      Assignment.deleteMany({}),
      Quiz.deleteMany({}),
    ]);
    console.log('🗑️  Đã xóa dữ liệu cũ');

    // === 1. TẠO USERS ===
    const salt = await bcrypt.genSalt(10);
    const hashedPw = await bcrypt.hash('123456', salt);

    const users = await User.insertMany([
      { name: 'Nguyen Van A', email: 'teacher1@gmail.com', password: hashedPw, role: 'teacher' },
      { name: 'Tran Thi B', email: 'teacher2@gmail.com', password: hashedPw, role: 'teacher' },
      { name: 'Le Van C', email: 'student1@gmail.com', password: hashedPw, role: 'student' },
      { name: 'Pham Thi D', email: 'student2@gmail.com', password: hashedPw, role: 'student' },
      { name: 'Hoang Van E', email: 'student3@gmail.com', password: hashedPw, role: 'student' },
    ]);

    const [teacher1, teacher2, student1, student2, student3] = users;
    console.log(`👤 Đã tạo ${users.length} users (pass: 123456)`);
    users.forEach(u => console.log(`   ${u.role === 'teacher' ? '👨‍🏫' : '🎓'} ${u.name} - ${u.email}`));

    // === 2. TẠO CATEGORIES ===
    const categories = await Category.insertMany([
      { name: 'Lập trình', description: 'Các khóa học về lập trình, phát triển phần mềm', icon: '💻' },
      { name: 'Thiết kế', description: 'Thiết kế đồ họa, UI/UX, multimedia', icon: '🎨' },
      { name: 'Kinh doanh', description: 'Quản trị kinh doanh, marketing, tài chính', icon: '📊' },
      { name: 'Ngoại ngữ', description: 'Tiếng Anh, Nhật, Hàn, Trung và các ngôn ngữ khác', icon: '🌐' },
      { name: 'Khoa học', description: 'Toán, Lý, Hóa, Sinh học và khoa học tự nhiên', icon: '🔬' },
      { name: 'Mobile', description: 'Phát triển ứng dụng di động Android, iOS', icon: '📱' },
      { name: 'Data Science', description: 'Khoa học dữ liệu, Machine Learning, AI', icon: '🤖' },
      { name: 'Kỹ năng mềm', description: 'Giao tiếp, thuyết trình, quản lý thời gian', icon: '🧠' },
    ]);
    console.log(`\n📂 Đã tạo ${categories.length} danh mục`);

    const [catLapTrinh, catThietKe, catKinhDoanh, catNgoaiNgu, catKhoaHoc, catMobile, catDS, catKyNang] = categories;

    // === 3. TẠO COURSES ===
    const courses = await Course.insertMany([
      {
        title: 'Lập trình JavaScript từ cơ bản đến nâng cao',
        description: 'Khóa học toàn diện về JavaScript, từ biến, hàm, vòng lặp đến ES6+, async/await, OOP và các design pattern. Phù hợp cho người mới bắt đầu lẫn lập trình viên muốn nâng cao kỹ năng.',
        teacher: teacher1._id,
        category: catLapTrinh._id,
        students: [student1._id, student2._id, student3._id],
      },
      {
        title: 'React.js - Xây dựng giao diện web hiện đại',
        description: 'Học React từ zero đến hero: JSX, Components, Hooks, State Management, React Router, gọi API và deploy ứng dụng thực tế. Dự án thực hành xây dựng ứng dụng quản lý công việc.',
        teacher: teacher1._id,
        category: catLapTrinh._id,
        students: [student1._id, student2._id],
      },
      {
        title: 'Node.js & Express - Backend API chuyên nghiệp',
        description: 'Xây dựng RESTful API với Node.js, Express, MongoDB. Bao gồm authentication JWT, upload file, validation, error handling và deployment. Dự án thực tế: xây dựng E-commerce API.',
        teacher: teacher1._id,
        category: catLapTrinh._id,
        students: [student1._id, student3._id],
      },
      {
        title: 'Thiết kế UI/UX với Figma',
        description: 'Học thiết kế giao diện người dùng từ cơ bản đến nâng cao với Figma. Bao gồm wireframe, prototype, design system, responsive design và handoff cho developer.',
        teacher: teacher2._id,
        category: catThietKe._id,
        students: [student2._id, student3._id],
      },
      {
        title: 'Digital Marketing cơ bản',
        description: 'Tổng quan về Digital Marketing: SEO, SEM, Social Media Marketing, Email Marketing, Content Marketing. Chiến lược xây dựng thương hiệu trực tuyến hiệu quả.',
        teacher: teacher2._id,
        category: catKinhDoanh._id,
        students: [student1._id],
      },
      {
        title: 'Tiếng Anh giao tiếp cho người đi làm',
        description: 'Khóa học tập trung vào kỹ năng giao tiếp tiếng Anh trong môi trường công sở: họp, thuyết trình, email, phỏng vấn. Có video bài giảng và bài tập thực hành.',
        teacher: teacher2._id,
        category: catNgoaiNgu._id,
        students: [student1._id, student2._id, student3._id],
      },
      {
        title: 'Python cho Data Science',
        description: 'Học Python từ cơ bản đến phân tích dữ liệu: NumPy, Pandas, Matplotlib, Seaborn. Thực hành xử lý dữ liệu thực tế và visualize kết quả.',
        teacher: teacher1._id,
        category: catDS._id,
        students: [student2._id],
      },
      {
        title: 'Phát triển ứng dụng Mobile với React Native',
        description: 'Xây dựng ứng dụng di động cross-platform với React Native. Từ setup môi trường đến xây dựng và deploy ứng dụng lên App Store / Google Play.',
        teacher: teacher1._id,
        category: catMobile._id,
        students: [],
      },
    ]);
    console.log(`\n📚 Đã tạo ${courses.length} khóa học:`);
    courses.forEach(c => console.log(`   📖 "${c.title}" - ${c.students.length} học viên`));

    // === 4. TẠO LESSONS ===
    const lessonsData = [
      // Khóa 1: JavaScript
      { title: 'Giới thiệu JavaScript', content: 'JavaScript là ngôn ngữ lập trình phổ biến nhất thế giới. Nó được sử dụng để tạo ra các trang web tương tác, ứng dụng server, mobile app và nhiều hơn nữa.\n\nTrong bài học này, bạn sẽ:\n- Hiểu JavaScript là gì và tại sao nên học\n- Cài đặt môi trường phát triển\n- Viết chương trình JavaScript đầu tiên', course: courses[0]._id, order: 1, duration: 30, videoUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk' },
      { title: 'Biến, kiểu dữ liệu và toán tử', content: 'Tìm hiểu cách khai báo biến với var, let, const. Các kiểu dữ liệu: String, Number, Boolean, null, undefined, Object, Array. Toán tử: số học, so sánh, logic.', course: courses[0]._id, order: 2, duration: 45 },
      { title: 'Câu lệnh điều kiện & vòng lặp', content: 'If/else, switch/case, ternary operator. Vòng lặp for, while, do-while, for...of, for...in. Break, continue.', course: courses[0]._id, order: 3, duration: 40 },
      { title: 'Hàm (Functions)', content: 'Khai báo hàm, function expression, arrow function. Parameters, arguments, return value. Scope, closure, hoisting. Callback function.', course: courses[0]._id, order: 4, duration: 50 },
      { title: 'ES6+ Features', content: 'Template literals, destructuring, spread/rest operator, default parameters, modules (import/export), class, Promise, async/await, Optional chaining.', course: courses[0]._id, order: 5, duration: 60 },

      // Khóa 2: React
      { title: 'Giới thiệu React & JSX', content: 'React là thư viện JavaScript để xây dựng giao diện người dùng. JSX cho phép viết HTML trong JavaScript. Tìm hiểu cách React hoạt động và tại sao nó phổ biến.', course: courses[1]._id, order: 1, duration: 35 },
      { title: 'Components & Props', content: 'Functional components, class components (legacy). Props: truyền dữ liệu giữa components. Children props. PropTypes validation.', course: courses[1]._id, order: 2, duration: 45 },
      { title: 'State & Hooks', content: 'useState, useEffect, useContext, useRef, useMemo, useCallback. Custom hooks. Rules of hooks.', course: courses[1]._id, order: 3, duration: 55 },
      { title: 'React Router & Navigation', content: 'React Router v6: BrowserRouter, Routes, Route, Link, NavLink, useNavigate, useParams, useLocation. Protected routes, nested routes.', course: courses[1]._id, order: 4, duration: 40 },

      // Khóa 3: Node.js
      { title: 'Giới thiệu Node.js & NPM', content: 'Node.js runtime, event-driven architecture, non-blocking I/O. NPM: package manager, package.json, dependencies vs devDependencies.', course: courses[2]._id, order: 1, duration: 30 },
      { title: 'Express.js Framework', content: 'Cài đặt Express, tạo server, routing, middleware, static files, error handling. RESTful API design principles.', course: courses[2]._id, order: 2, duration: 50 },
      { title: 'MongoDB & Mongoose', content: 'NoSQL database, CRUD operations, Schema design, Model methods, populate, aggregation pipeline. Indexing và performance.', course: courses[2]._id, order: 3, duration: 55 },

      // Khóa 4: UI/UX Figma
      { title: 'Nguyên tắc thiết kế UI cơ bản', content: 'Color theory, typography, spacing, alignment, visual hierarchy. Các nguyên tắc Gestalt. Accessibility trong thiết kế.', course: courses[3]._id, order: 1, duration: 40 },
      { title: 'Làm quen với Figma', content: 'Giao diện Figma, tools cơ bản: Frame, Shape, Text, Pen tool. Layers, Groups, Components. Auto layout.', course: courses[3]._id, order: 2, duration: 45 },

      // Khóa 5: Digital Marketing
      { title: 'Tổng quan Digital Marketing', content: 'Các kênh digital marketing chính, phễu marketing, customer journey. So sánh digital vs traditional marketing.', course: courses[4]._id, order: 1, duration: 35 },

      // Khóa 6: Tiếng Anh
      { title: 'Greeting & Small Talk', content: 'Cách chào hỏi trong môi trường công sở. Small talk topics: weather, weekend, hobbies. Useful phrases và cultural notes.', course: courses[5]._id, order: 1, duration: 30 },
      { title: 'Business Email Writing', content: 'Cấu trúc email chuyên nghiệp: subject line, greeting, body, closing. Template cho các loại email phổ biến: request, follow-up, complaint.', course: courses[5]._id, order: 2, duration: 40 },
      { title: 'Meeting & Presentation', content: 'Vocabulary cho cuộc họp: agenda, minutes, action items. Cách trình bày ý kiến, đồng ý/phản đối lịch sự. Presentation structure.', course: courses[5]._id, order: 3, duration: 50 },

      // Khóa 7: Python
      { title: 'Python cơ bản', content: 'Cài đặt Python, IDE (VS Code, Jupyter). Variables, data types, operators. Input/output. Control flow. Functions.', course: courses[6]._id, order: 1, duration: 45 },
      { title: 'NumPy & Pandas', content: 'NumPy arrays, operations. Pandas DataFrame, Series. Đọc dữ liệu CSV/Excel. Filtering, grouping, merging.', course: courses[6]._id, order: 2, duration: 60 },
    ];

    const lessons = await Lesson.insertMany(lessonsData);
    console.log(`\n📖 Đã tạo ${lessons.length} bài học`);

    // === 5. TẠO ASSIGNMENTS ===
    const assignmentsData = [
      // Khóa 1: JavaScript
      { title: 'Bài tập: Biến & Kiểu dữ liệu', description: 'Bài 1: Khai báo các biến chứa thông tin cá nhân (tên, tuổi, email, isStudent).\nBài 2: Viết chương trình tính diện tích và chu vi hình tròn khi biết bán kính r.\nBài 3: Viết chương trình chuyển đổi nhiệt độ từ Celsius sang Fahrenheit.\n\nYêu cầu: Nộp file .js hoặc screenshot kết quả.', course: courses[0]._id, maxScore: 10, dueDate: new Date('2026-04-15') },
      { title: 'Bài tập: Array & Object', description: 'Bài 1: Tạo mảng 10 sinh viên, viết hàm tìm sinh viên có điểm cao nhất.\nBài 2: Tạo object quản lý sách (title, author, year, pages). Viết các hàm CRUD.\nBài 3: Sử dụng map, filter, reduce để xử lý dữ liệu.\n\nYêu cầu: Nộp mã nguồn + screenshot.', course: courses[0]._id, maxScore: 10, dueDate: new Date('2026-04-20') },
      { title: 'Project cuối khóa: Todo App', description: 'Xây dựng ứng dụng Todo List hoàn chỉnh:\n- Thêm, sửa, xóa công việc\n- Đánh dấu hoàn thành\n- Lọc: All, Active, Completed\n- Lưu vào localStorage\n\nYêu cầu: Nộp link GitHub + screenshot demo.', course: courses[0]._id, maxScore: 30, dueDate: new Date('2026-04-30') },

      // Khóa 2: React
      { title: 'Bài tập: Components & Props', description: 'Tạo các component: Header, Footer, Card, Button. Sử dụng props để truyền dữ liệu. Tạo ProductList hiển thị danh sách sản phẩm.\n\nYêu cầu: Nộp code + screenshot.', course: courses[1]._id, maxScore: 10, dueDate: new Date('2026-04-18') },
      { title: 'Project: Ứng dụng quản lý công việc', description: 'Xây dựng Task Manager App với React:\n- CRUD tasks\n- Filter by status (todo, in-progress, done)\n- Search tasks\n- Responsive design\n\nBonus: Drag & drop, Dark mode.', course: courses[1]._id, maxScore: 30, dueDate: new Date('2026-05-05') },

      // Khóa 3: Node.js
      { title: 'Bài tập: RESTful API CRUD', description: 'Xây dựng API quản lý sách (Book API):\n- GET /books - lấy danh sách\n- GET /books/:id - chi tiết\n- POST /books - tạo mới\n- PUT /books/:id - cập nhật\n- DELETE /books/:id - xóa\n\nSử dụng Express + MongoDB.', course: courses[2]._id, maxScore: 15, dueDate: new Date('2026-04-22') },

      // Khóa 4: UI/UX
      { title: 'Thiết kế Landing Page', description: 'Thiết kế landing page cho một sản phẩm (tự chọn) trên Figma:\n- Hero section\n- Features section\n- Testimonials\n- CTA\n- Footer\n\nYêu cầu: Export PDF hoặc chia sẻ link Figma.', course: courses[3]._id, maxScore: 20, dueDate: new Date('2026-04-25') },

      // Khóa 6: Tiếng Anh
      { title: 'Writing: Business Email', description: 'Viết 3 email theo tình huống:\n1. Email xin phép nghỉ ốm\n2. Email follow-up sau cuộc họp\n3. Email phản hồi khiếu nại của khách hàng\n\nYêu cầu: Viết bằng tiếng Anh, chú ý format email chuyên nghiệp.', course: courses[5]._id, maxScore: 10, dueDate: new Date('2026-04-20') },
    ];

    const assignments = await Assignment.insertMany(assignmentsData);
    console.log(`\n📝 Đã tạo ${assignments.length} bài tập`);

    // === 6. TẠO QUIZZES ===
    const quizzesData = [
      // Khóa 1: JavaScript
      {
        title: 'Quiz: JavaScript cơ bản',
        description: 'Kiểm tra kiến thức cơ bản về JavaScript: biến, kiểu dữ liệu, toán tử, cấu trúc điều khiển.',
        course: courses[0]._id,
        timeLimit: 10,
        passingScore: 60,
        questions: [
          {
            question: 'Đâu là cách khai báo biến hằng (constant) trong JavaScript?',
            options: ['var x = 5', 'let x = 5', 'const x = 5', 'define x = 5'],
            correctOption: 2,
            explanation: 'const dùng để khai báo hằng số - giá trị không thể gán lại.',
          },
          {
            question: 'typeof null trả về gì?',
            options: ['"null"', '"undefined"', '"object"', '"boolean"'],
            correctOption: 2,
            explanation: 'Đây là một bug nổi tiếng trong JavaScript. typeof null trả về "object" dù null không phải là object.',
          },
          {
            question: 'Kết quả của "5" + 3 là gì?',
            options: ['8', '"53"', 'NaN', 'Error'],
            correctOption: 1,
            explanation: 'Khi + được dùng với string, JavaScript sẽ chuyển đổi số thành string và nối chuỗi.',
          },
          {
            question: 'Sự khác nhau giữa == và === ?',
            options: [
              'Không có khác nhau',
              '== so sánh giá trị, === so sánh giá trị và kiểu dữ liệu',
              '=== nhanh hơn ==',
              '== chỉ dùng cho số, === dùng cho string',
            ],
            correctOption: 1,
            explanation: '== (loose equality) chỉ so sánh giá trị, === (strict equality) so sánh cả giá trị và kiểu dữ liệu.',
          },
          {
            question: 'Array method nào KHÔNG thay đổi mảng gốc?',
            options: ['push()', 'splice()', 'map()', 'sort()'],
            correctOption: 2,
            explanation: 'map() trả về mảng mới, không thay đổi mảng gốc. push, splice, sort đều thay đổi mảng gốc.',
          },
        ],
      },
      {
        title: 'Quiz: ES6+ Features',
        description: 'Kiểm tra hiểu biết về các tính năng mới trong ES6 trở lên.',
        course: courses[0]._id,
        timeLimit: 15,
        passingScore: 50,
        questions: [
          {
            question: 'Arrow function khác gì so với function thường?',
            options: [
              'Không có gì khác, chỉ viết ngắn hơn',
              'Arrow function không có this riêng',
              'Arrow function chạy nhanh hơn',
              'Arrow function chỉ dùng được với React',
            ],
            correctOption: 1,
            explanation: 'Arrow function không bind this riêng mà kế thừa this từ scope bên ngoài (lexical this).',
          },
          {
            question: 'Destructuring assignment dùng để làm gì?',
            options: [
              'Xóa object',
              'Trích xuất giá trị từ array/object vào biến riêng',
              'Tạo deep copy của object',
              'Gộp nhiều object lại',
            ],
            correctOption: 1,
            explanation: 'Destructuring cho phép "unpack" giá trị từ array hoặc property từ object vào các biến riêng biệt.',
          },
          {
            question: 'Spread operator (...) có thể dùng cho?',
            options: ['Chỉ Array', 'Chỉ Object', 'Cả Array và Object', 'Chỉ String'],
            correctOption: 2,
            explanation: 'Spread operator có thể dùng cho cả Array, Object và các iterable khác.',
          },
          {
            question: 'Promise.all() sẽ reject khi nào?',
            options: [
              'Khi tất cả promises reject',
              'Khi bất kỳ promise nào reject',
              'Khi quá thời gian timeout',
              'Khi có nhiều hơn 10 promises',
            ],
            correctOption: 1,
            explanation: 'Promise.all() reject ngay khi BẤT KỲ promise nào trong danh sách bị reject.',
          },
          {
            question: 'async/await là gì?',
            options: [
              'Một framework mới',
              'Syntax sugar cho Promise',
              'Thay thế hoàn toàn callback',
              'Chỉ dùng được trên server',
            ],
            correctOption: 1,
            explanation: 'async/await là syntactic sugar (viết ngắn gọn hơn) cho Promise, giúp code bất đồng bộ dễ đọc hơn.',
          },
          {
            question: 'Optional chaining (?.) trả về gì nếu property không tồn tại?',
            options: ['null', 'undefined', 'Error', 'false'],
            correctOption: 1,
            explanation: 'Optional chaining trả về undefined thay vì throw error khi truy cập property của null/undefined.',
          },
        ],
      },

      // Khóa 2: React
      {
        title: 'Quiz: React.js cơ bản',
        description: 'Kiểm tra kiến thức React: Components, Props, State, Hooks.',
        course: courses[1]._id,
        timeLimit: 10,
        passingScore: 60,
        questions: [
          {
            question: 'JSX là gì?',
            options: [
              'Một ngôn ngữ lập trình mới',
              'JavaScript XML - syntax extension cho JavaScript',
              'Một framework CSS',
              'Một loại database',
            ],
            correctOption: 1,
            explanation: 'JSX là JavaScript XML, cho phép viết markup giống HTML trong JavaScript.',
          },
          {
            question: 'React Hook nào dùng để quản lý state?',
            options: ['useEffect', 'useRef', 'useState', 'useContext'],
            correctOption: 2,
            explanation: 'useState là hook dùng để khai báo và quản lý state trong functional component.',
          },
          {
            question: 'useEffect với dependency array rỗng [] chạy khi nào?',
            options: [
              'Mỗi lần render',
              'Chỉ khi mount (lần render đầu tiên)',
              'Chỉ khi unmount',
              'Không bao giờ chạy',
            ],
            correctOption: 1,
            explanation: 'useEffect với [] chỉ chạy 1 lần sau lần render đầu tiên, tương tự componentDidMount.',
          },
          {
            question: 'Cách nào đúng để truyền props cho component?',
            options: [
              '<Component {name: "React"} />',
              '<Component name="React" />',
              '<Component props.name="React" />',
              '<Component: name="React" />',
            ],
            correctOption: 1,
            explanation: 'Props được truyền giống HTML attributes: <Component propName={value} /> hoặc propName="string".',
          },
          {
            question: 'Key trong list rendering dùng để làm gì?',
            options: [
              'Bảo mật component',
              'Giúp React xác định element nào thay đổi, thêm, hoặc xóa',
              'Sắp xếp thứ tự render',
              'Styleshkng component',
            ],
            correctOption: 1,
            explanation: 'Key giúp React nhận dạng và tối ưu hóa việc update DOM khi list thay đổi.',
          },
        ],
      },

      // Khóa 6: Tiếng Anh
      {
        title: 'Quiz: Business English Vocabulary',
        description: 'Kiểm tra từ vựng tiếng Anh thương mại cơ bản.',
        course: courses[5]._id,
        timeLimit: 10,
        passingScore: 50,
        questions: [
          {
            question: '"Please find attached the report" nghĩa là gì?',
            options: [
              'Vui lòng tìm báo cáo',
              'Vui lòng xem báo cáo đính kèm',
              'Vui lòng in báo cáo',
              'Vui lòng sửa báo cáo',
            ],
            correctOption: 1,
            explanation: '"Find attached" là cụm từ phổ biến trong email, nghĩa là "xem file đính kèm".',
          },
          {
            question: 'Cách nào LỊCH SỰ NHẤT để phản đối ý kiến trong cuộc họp?',
            options: [
              'You are wrong.',
              'I see your point, but I have a different perspective.',
              'That makes no sense.',
              'I do not agree at all.',
            ],
            correctOption: 1,
            explanation: 'Sử dụng hedging language (I see your point, but...) thể hiện sự tôn trọng ý kiến người khác.',
          },
          {
            question: '"ASAP" viết tắt của gì?',
            options: [
              'As Soon As Planned',
              'As Simple As Possible',
              'As Soon As Possible',
              'As Specified And Prepared',
            ],
            correctOption: 2,
            explanation: 'ASAP = As Soon As Possible, nghĩa là "càng sớm càng tốt".',
          },
          {
            question: '"Could you please...?" thuộc dạng câu gì?',
            options: ['Mệnh lệnh', 'Yêu cầu lịch sự', 'Câu hỏi Yes/No', 'Câu trần thuật'],
            correctOption: 1,
            explanation: '"Could you please...?" là cấu trúc yêu cầu lịch sự, phù hợp trong môi trường công sở.',
          },
        ],
      },
    ];

    const quizzes = await Quiz.insertMany(quizzesData);
    console.log(`\n📝 Đã tạo ${quizzes.length} bài quiz (${quizzesData.reduce((acc, q) => acc + q.questions.length, 0)} câu hỏi)`);

    // === TỔNG KẾT ===
    console.log('\n' + '='.repeat(50));
    console.log('✅ SEED HOÀN TẤT!');
    console.log('='.repeat(50));
    console.log('\n📊 Tổng kết:');
    console.log(`   👤 ${users.length} users (2 teacher, 3 student)`);
    console.log(`   📂 ${categories.length} danh mục`);
    console.log(`   📚 ${courses.length} khóa học`);
    console.log(`   📖 ${lessons.length} bài học`);
    console.log(`   📝 ${assignments.length} bài tập`);
    console.log(`   ❓ ${quizzes.length} bài quiz`);
    console.log('\n🔑 Thông tin đăng nhập (password: 123456):');
    console.log('   👨‍🏫 Teacher: teacher1@gmail.com / teacher2@gmail.com');
    console.log('   🎓 Student: student1@gmail.com / student2@gmail.com / student3@gmail.com');

    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    console.error(err);
    process.exit(1);
  }
};

seedAll();
