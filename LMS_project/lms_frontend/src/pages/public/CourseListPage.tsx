import { useState } from 'react';
import { BookOpen, SearchX } from 'lucide-react';

import { useGetAllCourses } from '../../features/course/api';
import type { CourseRead } from '../../features/course/type';
import { CourseSkeleton } from '../../features/course/components/CourseSkeleton';
import { ErrorMessage } from '../../shared/components/ErrorMessage';
import { CourseCard } from '../../features/course/components/CourseCard';
import { Pagination } from '../../features/course/components/Pagination';

// --- TYPES ---
// interface Course {
//   id: string;
//   slug: string;
//   title: string;
//   thumbnail: string;
//   teacherName: string;
//   teacherAvatar: string;
//   level: 'Sơ cấp' | 'Trung cấp' | 'Cao cấp';
//   price: number; // 0 = Miễn phí
// }

// // --- MOCK DATA ---
// const MOCK_COURSES: Course[] = [
//   {
//     id: '1',
//     slug: 'tieng-anh-giao-tiep-so-cap',
//     title: 'Tiếng Anh Giao Tiếp Sơ Cấp Dành Cho Người Mất Gốc',
//     thumbnail: 'https://images.unsplash.com/photo-1546410531-dd4caa3d4088?auto=format&fit=crop&q=80&w=800',
//     teacherName: 'Alex Johnson',
//     teacherAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100',
//     level: 'Sơ cấp',
//     price: 0,
//   },
//   {
//     id: '2',
//     slug: 'tieng-nhat-jlpt-n4',
//     title: 'Luyện thi JLPT N4: Từ vựng và Ngữ pháp',
//     thumbnail: 'https://images.unsplash.com/photo-1528164344705-47542687000d?auto=format&fit=crop&q=80&w=800',
//     teacherName: 'Sato Haruki',
//     teacherAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=100',
//     level: 'Trung cấp',
//     price: 599000,
//   },
//   {
//     id: '3',
//     slug: 'tieng-han-cao-cap-topik-5-6',
//     title: 'Chinh phục TOPIK 5-6: Kỹ năng Viết chuyên sâu',
//     thumbnail: 'https://images.unsplash.com/photo-1580211565431-15eeccb403d5?auto=format&fit=crop&q=80&w=800',
//     teacherName: 'Kim Ji Eun',
//     teacherAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100',
//     level: 'Cao cấp',
//     price: 850000,
//   },
//   {
//     id: '4',
//     slug: 'tieng-trung-hsk-3',
//     title: 'Tiếng Trung HSK 3: Giao tiếp văn phòng cơ bản',
//     thumbnail: 'https://images.unsplash.com/photo-1517502474497-28d8b671a539?auto=format&fit=crop&q=80&w=800',
//     teacherName: 'Wang Wei',
//     teacherAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=100',
//     level: 'Trung cấp',
//     price: 0,
//   },
// ];

// --- SUB-COMPONENTS ---

// 1. Image Lazy Load Component



// --- MAIN COMPONENT ---
export default function CourseList() {
  const [page, setPage] = useState(1);
  const totalPages = 3; // Mock tổng số trang
  const {data: courses = [], isPending, isError, error} = useGetAllCourses();

  if (isError) {
    return (
      <ErrorMessage error={error} />
    )
  }


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="mb-10 text-center sm:text-left">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center sm:justify-start gap-3">
            <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Khám phá Khóa học
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Hàng trăm khóa học ngoại ngữ chất lượng cao đang chờ đón bạn.
          </p>
        </div>

        {/* Course Grid / States */}
        {isPending ? (
          // 1. SKELETON STATE
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
              <CourseSkeleton key={item} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          // 2. EMPTY STATE
          <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <SearchX className="w-16 h-16 text-slate-400 mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Không tìm thấy khóa học nào</h3>
            <p className="text-slate-500 dark:text-slate-400 text-center max-w-sm">
              Hiện tại không có khóa học nào ở trang này hoặc trong danh mục bạn chọn. Vui lòng thử lại sau.
            </p>
          </div>
        ) : (
          // 3. ACTUAL CONTENT
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {courses.map((course: CourseRead) => (
             <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}

        {/* Pagination */}
        <Pagination page={page} totalPages={totalPages} setPage={setPage} isPending={isPending} />

      </div>
    </div>
  );
}