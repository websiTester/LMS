import { MoreHorizontal } from "lucide-react";
import type { User } from "../../../../../shared/types/user";
import { formatTime } from "@/shared/utils/format-time";


import { getRoleStyle, getStatusStyle } from "../../utils/styles";

interface UserTableProps {
  filteredUsers: User[];
  setSelectedUser: (user: User) => void;
}

const UserTable = ({ filteredUsers, setSelectedUser }: UserTableProps) => {
    return ( 
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 pb-4 border-b border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-500 dark:text-slate-400 px-4">
            <div className="col-span-5 sm:col-span-4">Người dùng</div>
            <div className="col-span-3 sm:col-span-2 hidden sm:block">Vai trò</div>
            <div className="col-span-3 sm:col-span-2 hidden sm:block">Trạng thái</div>
            <div className="col-span-2 hidden lg:block">Ngày tham gia</div>
            <div className="col-span-4 sm:col-span-2 text-right">Hành động</div>
          </div>

          {/* Table Body */}
          <div className="mt-4 space-y-3">
            {filteredUsers.length > 0 ? filteredUsers.map((user) => (
              <div 
                key={user.id} 
                className="grid grid-cols-12 gap-4 items-center bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-700/50 border border-slate-100 dark:border-slate-700/50 rounded-xl p-4 transition-all duration-200"
              >
                {/* User Info */}
                <div className="col-span-8 sm:col-span-4 flex items-center gap-3">
                  <img src="/doraemon.jpg" alt={user.full_name || 'User'} className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-600 object-cover" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-200">{user.full_name || 'N/A'}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                  </div>
                </div>

                {/* Role */}
                <div className="col-span-4 sm:col-span-2 flex items-center justify-end sm:justify-start">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleStyle(user.role.toString())}`}>
                    {user.role}
                  </span>
                </div>

                {/* Status */}
                <div className="col-span-4 sm:col-span-2 hidden sm:flex items-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(user.is_active?.toString())}`}>
                    {user.is_active === true ? 'Hoạt động' : 'Bị khóa'}
                  </span>
                </div>

                {/* Joined Date */}
                <div className="col-span-2 hidden lg:flex items-center text-sm text-slate-600 dark:text-slate-400">
                  { formatTime(user.created_at) }
                </div>

                {/* Actions */}
                <div className="col-span-4 sm:col-span-2 flex items-center justify-end">
                  <button 
                    onClick={() => setSelectedUser(user)}
                    className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center text-slate-500 dark:text-slate-400">
                Không tìm thấy người dùng nào phù hợp.
              </div>
            )}
          </div>

          {/* 4. PHÂN TRANG (Pagination) */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400">
            <div>
              Đang hiển thị <span className="font-semibold text-slate-900 dark:text-white">1</span> đến <span className="font-semibold text-slate-900 dark:text-white">{filteredUsers.length}</span> trong tổng số <span className="font-semibold text-slate-900 dark:text-white">2,450</span> người dùng
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Trước</button>
              <button className="px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium">1</button>
              <button className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">2</button>
              <button className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">3</button>
              <span className="px-2 py-1.5">...</span>
              <button className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">Tiếp</button>
            </div>
          </div>
        </div>
     );
}
 
export default UserTable;