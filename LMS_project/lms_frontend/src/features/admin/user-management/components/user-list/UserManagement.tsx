import { useState } from 'react';
import { 
 UserPlus
} from 'lucide-react';
import UserDetailSlide from './UserDetailSlide';
import ToolBar from './ToolBar';
import UserTable from './UserTable';
import { useGetAllUsers } from '../../api';
import type { User } from '../../../../../shared/types/user';
import { TableSkeleton } from './TableSkeleton';
import AlertMessage from '@/shared/components/AlertMessage';
import CreateAccountModal from './CreateAccountModal';


export default function UserManagement() {

  const {data: allUsers, isPending, isError} = useGetAllUsers();
  //const [users, setUsers] = useState<User[]>([]);

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // States cho Modals
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Lọc dữ liệu
  const filteredUsers = allUsers?.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'All' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || user.is_active?.toString() === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  }) || [];



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
            onClick={() => setIsCreateAccountModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tạo account</span>
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

      {/* 5A. MODAL TẠO ACCOUNT */}
      {isCreateAccountModalOpen && (
        <CreateAccountModal setIsCreateAccountModalOpen={setIsCreateAccountModalOpen} />
      )}

      {/* 5B. SLIDE-OVER (DRAWER) XEM CHI TIẾT NGƯỜI DÙNG */}
      {selectedUser && (
        <UserDetailSlide selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
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