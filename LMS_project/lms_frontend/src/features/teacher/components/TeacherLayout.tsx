import { useState } from 'react';
import { 
  BookOpen, FileText, LayoutDashboard, 
  Settings, LogOut, X, 
  PlayCircle, MessageSquare
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';


export default function TeacherDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden transition-colors duration-300">
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950">
          <span className="text-xl font-bold text-white tracking-wider flex items-center gap-2">
            <PlayCircle className="w-6 h-6 text-blue-500" /> Teacher
          </span>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="px-4 py-6 space-y-1 overflow-y-auto">
          <a href="/teacher" className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-blue-600 text-white font-medium">
            <LayoutDashboard className="w-5 h-5" /> Tổng quan
          </a>
          <NavLink to="/teacher/courses" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <BookOpen className="w-5 h-5" /> Khóa học của tôi
          </NavLink>
          <a href="/teacher/submissions" className="flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5" /> Bài tập (Submissions)
            </div>
            <span className="w-5 h-5 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center font-bold">5</span>
          </a>
          <a href="/teacher/discussions" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors">
            <MessageSquare className="w-5 h-5" /> Q&A Học viên
          </a>
        </div>
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <a href="/teacher/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors mb-1">
            <Settings className="w-5 h-5" /> Cài đặt
          </a>
          <a href="/logout" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors">
            <LogOut className="w-5 h-5" /> Đăng xuất
          </a>
        </div>
      </aside>

      {/* OVERLAY CHO MOBILE SIDEBAR */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <Outlet />
      </main>
    </div>
  );
}