import { useParams } from 'react-router-dom';
import { CourseHero } from '../../features/course/components/CourseHero';
import { CourseDetailLeft } from '../../features/course/components/CourseDetailLeft';
import CourseDetailRight from '../../features/course/components/CourseDetailRight';

// --- MOCK DATA ---
const COURSE_DATA = {
  id: 'c1',
  slug: 'tieng-anh-giao-tiep-so-cap',
  title: 'Tiếng Anh Giao Tiếp Sơ Cấp Dành Cho Người Mất Gốc',
  shortDesc: 'Khóa học thiết kế đặc biệt giúp bạn xây dựng lại nền tảng tiếng Anh từ con số 0. Tự tin giao tiếp trong các tình huống cơ bản hàng ngày chỉ sau 3 tháng.',
  thumbnail: 'https://images.unsplash.com/photo-1546410531-dd4caa3d4088?auto=format&fit=crop&q=80&w=1200',
  price: 0, // 0 = Miễn phí. Thử đổi thành 499000 để xem UI Paid course
  level: 'Sơ cấp',
  totalStudents: 12450,
  rating: 4.8,
  teacher: {
    name: 'Alex Johnson',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    title: 'Giảng viên TESOL cấp cao / Cựu giám khảo IELTS',
    bio: 'Alex có hơn 10 năm kinh nghiệm giảng dạy tiếng Anh cho người lớn tại châu Á. Thầy nổi tiếng với phương pháp dạy học trực quan, hài hước và tập trung mạnh vào phát âm chuẩn xác.'
  },
  outcomes: [
    'Nắm vững 1000 từ vựng cơ bản và các cấu trúc ngữ pháp cốt lõi',
    'Phát âm chuẩn IPA, không còn bị ngọng hoặc sai trọng âm',
    'Tự tin giới thiệu bản thân, giao tiếp tại nhà hàng, sân bay, công sở',
    'Nghe hiểu các đoạn hội thoại tiếng Anh tốc độ chậm và vừa',
    'Biết cách tự học và duy trì thói quen học tiếng Anh mỗi ngày',
    'Đủ nền tảng vững chắc để tiếp tục học lên các chứng chỉ quốc tế'
  ],
  curriculum: [
    {
      id: 'chap-1',
      title: 'Chương 1: Làm quen với Tiếng Anh & Bảng chữ cái IPA',
      totalDuration: '45 phút',
      lessons: [
        { id: 'l1', title: 'Giới thiệu tổng quan về khóa học', duration: '05:20' },
        { id: 'l2', title: 'Tại sao bạn học tiếng Anh mãi không giỏi?', duration: '12:15' },
        { id: 'l3', title: 'Bảng phiên âm quốc tế IPA (Phần 1 - Nguyên âm)', duration: '15:40' },
        { id: 'l4', title: 'Bảng phiên âm quốc tế IPA (Phần 2 - Phụ âm)', duration: '12:25' },
      ]
    },
    {
      id: 'chap-2',
      title: 'Chương 2: Chào hỏi và Giới thiệu bản thân',
      totalDuration: '1 giờ 10 phút',
      lessons: [
        { id: 'l5', title: 'Các mẫu câu chào hỏi thông dụng', duration: '18:10' },
        { id: 'l6', title: 'Giới thiệu về nghề nghiệp và sở thích', duration: '22:30' },
        { id: 'l7', title: 'Luyện tập hội thoại qua Roleplay', duration: '15:00' },
        { id: 'l8', title: 'Bài tập thực hành phát âm', duration: '14:20' },
      ]
    },
    {
      id: 'chap-3',
      title: 'Chương 3: Số đếm, Thời gian và Ngày tháng',
      totalDuration: '55 phút',
      lessons: [
        { id: 'l9', title: 'Cách đọc số đếm từ 1 đến 1,000,000', duration: '20:10' },
        { id: 'l10', title: 'Hỏi và trả lời về giờ giấc', duration: '15:45' },
        { id: 'l11', title: 'Cách nói ngày tháng năm chuẩn', duration: '19:05' },
      ]
    }
  ]
};

// --- COMPONENT ---
export default function CourseDetailPage() {

  const { slug } = useParams();
  console.log('Course slug from URL:', slug);


  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">
      
      {/* 1. HERO SECTION (Dark background layout) */}
      <CourseHero COURSE_DATA={COURSE_DATA} />

      {/* 2. MAIN CONTENT & SIDEBAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* LEFT COL: TABS & CONTENT */}
          <CourseDetailLeft COURSE_DATA={COURSE_DATA} />

          {/* RIGHT COL: STICKY SIDEBAR (Sales Card) */}
          <CourseDetailRight COURSE_DATA={COURSE_DATA} />
        </div>
      </div>
    </div>
  );
}