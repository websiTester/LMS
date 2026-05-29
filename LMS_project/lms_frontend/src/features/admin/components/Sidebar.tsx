import { 
  Users, BookOpen, AlertCircle, 
  LayoutDashboard, Settings, LogOut, X, Activity
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface AdminSidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
}

export const AdminSidebar = ({ isSidebarOpen, setIsSidebarOpen }: AdminSidebarProps) => {
    return ( 
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between h-16 px-6 bg-slate-950">
          <span className="text-xl font-bold text-white tracking-wider">LMS Admin</span>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="px-4 py-6 space-y-1 overflow-y-auto">
          <NavLink to="/admin/dashboard" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors ${isActive ? 'bg-slate-800 text-white' : ''}`}>
            <LayoutDashboard className="w-5 h-5" /> Tổng quan
          </NavLink>
          <NavLink to="/admin/courses" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors ${isActive ? 'bg-slate-800 text-white' : ''}`}>
            <BookOpen className="w-5 h-5" /> Quản lý Khóa học
          </NavLink>
          <NavLink to="/admin/courses/pending" className={({isActive}) => `flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors ${isActive ? 'bg-slate-800 text-white' : ''}`}>
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5" /> Duyệt khóa học
            </div>
            <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs flex items-center justify-center font-bold">12</span>
          </NavLink>
          
          <NavLink to="/admin/users" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors ${isActive ? 'bg-slate-800 text-white' : ''}`}>
            <Users className="w-5 h-5" /> Quản lý Tài khoản
          </NavLink>
          <NavLink to="/admin/revenue" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors ${isActive ? 'bg-slate-800 text-white' : ''}`}>
            <Activity className="w-5 h-5" /> Báo cáo Doanh thu
          </NavLink>
        </div>
        <div className="absolute bottom-0 w-full p-4 border-t border-slate-800">
          <NavLink to="/admin/settings" className={({isActive}) => `flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors ${isActive ? 'bg-slate-800 text-white' : ''} mb-1`}>
            <Settings className="w-5 h-5" /> Cài đặt
          </NavLink>
          <NavLink to="/logout" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-slate-800 hover:text-red-300 transition-colors">
            <LogOut className="w-5 h-5" /> Đăng xuất
          </NavLink>
        </div>
      </aside>
     );
}
 
export default AdminSidebar;