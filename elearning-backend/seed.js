const mongoose = require('mongoose');
require('dotenv').config();

const Category = require('./models/Category');

const categories = [
  { name: 'Lập trình', description: 'Các khóa học về lập trình, phát triển phần mềm', icon: '💻' },
  { name: 'Thiết kế', description: 'Thiết kế đồ họa, UI/UX, multimedia', icon: '🎨' },
  { name: 'Kinh doanh', description: 'Quản trị kinh doanh, marketing, tài chính', icon: '📊' },
  { name: 'Ngoại ngữ', description: 'Tiếng Anh, Nhật, Hàn, Trung và các ngôn ngữ khác', icon: '🌐' },
  { name: 'Khoa học', description: 'Toán, Lý, Hóa, Sinh học và khoa học tự nhiên', icon: '🔬' },
  { name: 'Mobile', description: 'Phát triển ứng dụng di động Android, iOS', icon: '📱' },
  { name: 'Data Science', description: 'Khoa học dữ liệu, Machine Learning, AI', icon: '🤖' },
  { name: 'Kỹ năng mềm', description: 'Giao tiếp, thuyết trình, quản lý thời gian', icon: '🧠' },
];

const seedCategories = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Kết nối MongoDB thành công');

    await Category.deleteMany({});
    console.log('🗑️  Đã xóa categories cũ');

    const created = await Category.insertMany(categories);
    console.log(`✅ Đã tạo ${created.length} categories:`);
    created.forEach(c => console.log(`   ${c.icon} ${c.name}`));

    await mongoose.disconnect();
    console.log('\n✅ Seed hoàn tất!');
  } catch (err) {
    console.error('❌ Lỗi:', err.message);
    process.exit(1);
  }
};

seedCategories();
