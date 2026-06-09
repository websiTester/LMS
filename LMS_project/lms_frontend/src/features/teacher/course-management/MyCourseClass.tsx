import { 
  PlusCircle, Search, ChevronDown, MoreHorizontal, 
   Send, Trash2, BookOpen, LayoutDashboard, Edit
} from 'lucide-react';
import { useGetTeacherCourses } from '../api';
import type { CourseRead } from '@/shared/types/course';
import { NavLink } from 'react-router-dom';
import CourseStatusBadge from './CourseStatusBadege';
import { useState, useEffect } from 'react';

// --- MOCK DATA ---
type CourseStatus = 'published' | 'draft' | 'pending' | 'rejected';

interface Course {
  id: string;
  title: string;
  thumbnail: string;
  status: CourseStatus;
  students: number;
  createdAt: string;
}

export default function TeacherCoursesList() {

  const {data: teacherCourses=[], isPending, isError} = useGetTeacherCourses();

  // State quản lý hiển thị Action Menu
  const [activeMenuId, setActiveMenuId] = useState<string | number | null>(null);

  // Ẩn menu khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.action-menu-container')) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300" >
      
      {/* HEADER (Giả lập nằm trong layout có Sidebar) */}
      <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400">
          <a href="/teacher" className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <LayoutDashboard className="w-4 h-4" /> Tổng quan
          </a>
          <ChevronDown className="w-4 h-4 -rotate-90" />
          <span className="text-slate-900 dark:text-white">Khóa học của tôi</span>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Top Section: Title & Create Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Khóa học của tôi</h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Quản lý nội dung, theo dõi trạng thái kiểm duyệt và số lượng học viên.</p>
            </div>
            <NavLink 
              to="/teacher/courses/create" // Điều hướng tới Wizard
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Tạo Khóa học mới</span>
            </NavLink>
          </div>

          {/* Toolbar (Search & Filters) */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="relative w-full md:w-96 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500" />
              <input
                type="text"
                placeholder="Tìm tên khóa học..."
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors text-slate-900 dark:text-white"
              />
            </div>

            <div className="w-full md:w-auto relative">
              <select
                className="w-full md:w-auto appearance-none bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
              >
                <option value="all">Trạng thái: Tất cả</option>
                <option value="published">Đã xuất bản</option>
                <option value="pending">Chờ duyệt</option>
                <option value="draft">Bản nháp</option>
                <option value="rejected">Bị từ chối</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            </div>
          </div>

          {/* Course Table */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-auto max-h-[600px] min-h-[400px] relative">
              <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                
                {/* Table Header (Sticky) */}
                <thead className="sticky top-0 z-10 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-sm text-slate-700 dark:text-slate-300 font-semibold shadow-sm">
                  <tr>
                    <th className="p-4 w-16 text-center">Ảnh</th>
                    <th className="p-4 min-w-[300px]">Tên khóa học</th>
                    <th className="p-4 w-36">Trạng thái</th>
                    <th className="p-4 w-28 text-center">Học viên</th>
                    <th className="p-4 w-32">Ngày tạo</th>
                    <th className="p-4 w-20 text-center">Hành động</th>
                  </tr>
                </thead>
                
                {/* Table Body */}
                <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                  {teacherCourses.length > 0 ? (
                    teacherCourses.map((course: CourseRead, index: number) => {
                      // Bật pop-up ngược lên trên nếu là 2 item cuối danh sách (để menu không bị che mất)
                      const isNearBottom = index >= teacherCourses.length - 2 && teacherCourses.length >= 3;
                      
                      return (
                        <tr 
                        key={course.id} 
                        className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors cursor-pointer group"
                      >
                        <td className="p-4">
                          <img 
                            src='/course_thumpnail.png'
                            alt={course.title} 
                            className="w-16 h-12 rounded object-cover border border-slate-200 dark:border-slate-600"
                          />
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                            {course.title}
                          </div>
                        </td>
                        <td className="p-4">
                          <CourseStatusBadge  status={course.status} />
                        </td>
                        <td className="p-4 text-center font-medium text-slate-900 dark:text-white">
                          {/* {course.students.toLocaleString()} */}
                          1000
                        </td>
                        <td className="p-4">
                          {course.created_at}
                        </td>
                        <td className="p-4 text-center relative action-menu-container">
                          <button 
                            onClick={() => setActiveMenuId(activeMenuId === course.id ? null : course.id)}
                            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors focus:outline-none"
                            title="Tùy chọn"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>

                          {/* ACTION MENU (3-dots Dropdown) */}
                          {activeMenuId === course.id && (
                            <div className={`absolute right-8 z-50 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-fade-in text-left ${isNearBottom ? 'bottom-10' : 'top-10'}`}>
                              
                              {/* Option 3 (New): Edit / View Detail */}
                              <NavLink 
                                to={`/teacher/courses/${course.id}/edit`} 
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                              >
                                <Edit className="w-4 h-4 text-slate-400" /> Chi tiết / Chỉnh sửa
                              </NavLink>
                              
                              {/* Option 1: Chỉ hiện Nút Submit nếu đang là nháp hoặc bị từ chối */}
                              {(course.status === 'draft' || course.status === 'rejected') && (
                                <button 
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border-t border-slate-100 dark:border-slate-700"
                                >
                                  <Send className="w-4 h-4 text-blue-500" /> Gửi xét duyệt
                                </button>
                              )}

                              {/* Option 2: Chỉ cho phép Xóa nếu đang là nháp */}
                              {course.status === 'draft' && (
                                <button 
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border-t border-slate-100 dark:border-slate-700"
                                >
                                  <Trash2 className="w-4 h-4 text-red-500" /> Xóa khóa học
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                  </tr>
                      )
                    })
                  ): (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-slate-500 dark:text-slate-400">
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>Không tìm thấy khóa học nào phù hợp.</p>
                      </td>
                    </tr>
                  )}


                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* CSS phụ trợ */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.15s ease-out forwards; }
      `}} />
    </div>
  );
}