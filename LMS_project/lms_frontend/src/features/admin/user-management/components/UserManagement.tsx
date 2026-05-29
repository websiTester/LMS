import { useState } from 'react';
import { 
 UserPlus, X
} from 'lucide-react';
import UserDetailSlide from './UserDetailSlide';
import ToolBar from './ToolBar';
import UserTable from './UserTable';
import { useGetAllUsers } from '../api';
import type { User } from '../../../../shared/types/user';
import { TableSkeleton } from './TableSkeleton';
import AlertMessage from '@/shared/components/AlertMessage';


export default function UserManagement() {

  const {data: allUsers, isPending, isError} = useGetAllUsers();
  //const [users, setUsers] = useState<User[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // States cho Modals
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Lọc dữ liệu
  const filteredUsers = allUsers?.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.is_active?.toString() === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];

  // --- HELPER FUNCTIONS CHO BADGES (Chuẩn hóa màu theme) ---
  const getRoleStyle = (role: string) => {
    const normalizedRole = role.toLowerCase().trim();
    console.log(`Getting style for role: ${normalizedRole}`);
    switch (normalizedRole) {
      case 'admin': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800/50';
      case 'teacher': return 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800/50';
      case 'student': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800/50';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const getStatusStyle = (status: string) => {
    console.log(`Getting style for status: ${status}`);
    switch (status) {
      case 'true': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800/50';
      case 'false': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800/50';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  return (
    // Sử dụng màu nền đồng bộ với dự án (Slate-50 / Slate-900)
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 p-4 sm:p-8 font-sans overflow-x-hidden relative transition-colors duration-300">
      
      <div className="max-w-7xl mx-auto space-y-8">
        {/* 1. HEADER */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Quản lý Người dùng
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Quản lý học viên, giảng viên và quản trị viên trong hệ thống.
            </p>
          </div>
          <button 
            onClick={() => setIsInviteModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Mời Giảng Viên</span>
          </button>
        </header>

        {/* 2. TOOLBAR */}
        <ToolBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* 3. BẢNG DỮ LIỆU */}
        <UserTable 
          filteredUsers={filteredUsers}
          getRoleStyle={getRoleStyle}
          getStatusStyle={getStatusStyle}
          setSelectedUser={setSelectedUser}
        />


        {
          isError && (
             <AlertMessage/>
          )
        }
        
        {
          isPending && (
            <TableSkeleton />
          )
        }
      </div>

      {/* 5. HIDDEN COMPONENTS */}

      {/* 5A. MODAL MỜI GIẢNG VIÊN */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsInviteModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Mời Người Dùng Mới</h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); setIsInviteModalOpen(false); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Địa chỉ Email</label>
                <input required type="email" placeholder="email@example.com" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Chỉ định Vai trò</label>
                <select className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <option>Teacher</option>
                  <option>Admin</option>
                </select>
              </div>
              <button type="submit" className="w-full mt-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors">
                Gửi Lời Mời
              </button>
            </form>
          </div>
        </div>
      )}

      {/* 5B. SLIDE-OVER (DRAWER) XEM CHI TIẾT NGƯỜI DÙNG */}
      {selectedUser && (
        <UserDetailSlide selectedUser={selectedUser} setSelectedUser={setSelectedUser} getStatusStyle={getStatusStyle} getRoleStyle={getRoleStyle} />
      )}

      {/* CSS phụ trợ cho animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .animate-slide-in-right { animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}} />
    </div>
  );
}