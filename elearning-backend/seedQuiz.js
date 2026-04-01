const mongoose = require('mongoose');
require('dotenv').config();

const Quiz = require('./models/Quiz');
const Course = require('./models/Course');

const seedQuizzes = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công');

    // Lấy khóa học đầu tiên
    const course = await Course.findOne();
    if (!course) {
      console.log('❌ Chưa có khóa học nào! Hãy tạo khóa học trước.');
      process.exit(1);
    }

    console.log(`📚 Tạo quiz cho khóa học: "${course.title}"`);

    // Xóa quiz cũ của khóa học này
    await Quiz.deleteMany({ course: course._id });

    const quizzes = [
      {
        title: 'Kiểm tra cơ bản - Lập trình',
        description: 'Bài kiểm tra kiến thức cơ bản về lập trình. Hãy đọc kỹ câu hỏi và chọn đáp án đúng nhất.',
        course: course._id,
        timeLimit: 10,
        passingScore: 60,
        questions: [
          {
            question: 'HTML là viết tắt của gì?',
            options: [
              'Hyper Text Markup Language',
              'High Tech Modern Language',
              'Hyper Transfer Markup Language',
              'Home Tool Markup Language',
            ],
            correctOption: 0,
            explanation: 'HTML = HyperText Markup Language, là ngôn ngữ đánh dấu siêu văn bản.',
          },
          {
            question: 'CSS dùng để làm gì?',
            options: [
              'Xử lý dữ liệu phía server',
              'Tạo cấu trúc trang web',
              'Định dạng giao diện trang web',
              'Kết nối cơ sở dữ liệu',
            ],
            correctOption: 2,
            explanation: 'CSS (Cascading Style Sheets) dùng để định dạng giao diện và trình bày nội dung.',
          },
          {
            question: 'JavaScript chạy ở đâu?',
            options: [
              'Chỉ trên server',
              'Chỉ trên trình duyệt',
              'Cả trình duyệt và server',
              'Chỉ trên mobile',
            ],
            correctOption: 2,
            explanation: 'JavaScript chạy trên trình duyệt (frontend) và cả server (Node.js).',
          },
          {
            question: 'Đâu KHÔNG phải là kiểu dữ liệu trong JavaScript?',
            options: [
              'String',
              'Boolean',
              'Float',
              'Undefined',
            ],
            correctOption: 2,
            explanation: 'JavaScript không có kiểu Float riêng, chỉ có Number cho cả số nguyên và thực.',
          },
          {
            question: 'MongoDB là loại cơ sở dữ liệu gì?',
            options: [
              'SQL (quan hệ)',
              'NoSQL (phi quan hệ)',
              'Graph database',
              'Key-value store',
            ],
            correctOption: 1,
            explanation: 'MongoDB là cơ sở dữ liệu NoSQL, lưu trữ dữ liệu dạng document (JSON-like).',
          },
        ],
      },
      {
        title: 'Quiz nâng cao - Node.js & Express',
        description: 'Kiểm tra kiến thức về Node.js và Express framework.',
        course: course._id,
        timeLimit: 15,
        passingScore: 50,
        questions: [
          {
            question: 'Node.js sử dụng engine JavaScript nào?',
            options: [
              'SpiderMonkey',
              'V8',
              'Chakra',
              'JavaScriptCore',
            ],
            correctOption: 1,
            explanation: 'Node.js sử dụng V8 JavaScript engine của Google Chrome.',
          },
          {
            question: 'Express.js là gì?',
            options: [
              'Một cơ sở dữ liệu',
              'Một web framework cho Node.js',
              'Một ngôn ngữ lập trình',
              'Một hệ điều hành',
            ],
            correctOption: 1,
            explanation: 'Express.js là web framework phổ biến nhất cho Node.js.',
          },
          {
            question: 'Middleware trong Express dùng để làm gì?',
            options: [
              'Tạo giao diện người dùng',
              'Xử lý request trước khi đến route handler',
              'Kết nối database tự động',
              'Biên dịch JavaScript',
            ],
            correctOption: 1,
            explanation: 'Middleware là hàm có quyền truy cập req, res và next, xử lý request giữa chừng.',
          },
          {
            question: 'JWT thường được dùng để làm gì?',
            options: [
              'Mã hóa dữ liệu trong database',
              'Xác thực người dùng (Authentication)',
              'Tạo giao diện responsive',
              'Gửi email tự động',
            ],
            correctOption: 1,
            explanation: 'JWT (JSON Web Token) dùng để xác thực người dùng trong API stateless.',
          },
          {
            question: 'HTTP Status Code 404 nghĩa là gì?',
            options: [
              'Server error',
              'Unauthorized',
              'Not Found',
              'Bad Request',
            ],
            correctOption: 2,
            explanation: '404 = Not Found, nghĩa là tài nguyên không tồn tại.',
          },
          {
            question: 'Phương thức HTTP nào dùng để cập nhật dữ liệu?',
            options: [
              'GET',
              'POST',
              'PUT',
              'DELETE',
            ],
            correctOption: 2,
            explanation: 'PUT dùng để cập nhật toàn bộ tài nguyên, PATCH cập nhật một phần.',
          },
        ],
      },
    ];

    const created = await Quiz.insertMany(quizzes);
    console.log(`\n✅ Đã tạo ${created.length} bài quiz:`);
    created.forEach(q => {
      console.log(`   📝 "${q.title}" - ${q.questions.length} câu - ${q.timeLimit}p - Điểm đạt: ${q.passingScore}%`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Seed quiz hoàn tất!');
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
};

seedQuizzes();
