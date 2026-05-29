import { Calendar, Mail, Phone, Shield, X } from "lucide-react";
import type { User } from "../../../../../shared/types/user";
import { NavLink } from "react-router-dom";
import { formatTime } from "@/shared/utils/format-time";

import { getRoleStyle, getStatusStyle } from "../../utils/styles";

interface UserDetailSlideProps {
  selectedUser: User | null;
  setSelectedUser: (user: UserDetailSlideProps['selectedUser']) => void;
}

const UserDetailSlide = ({ selectedUser, setSelectedUser }: UserDetailSlideProps) => {
    return ( 
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setSelectedUser(null)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-800 h-full shadow-2xl border-l border-slate-200 dark:border-slate-700 flex flex-col transform transition-transform duration-300 animate-slide-in-right">
            
            {/* Drawer Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Thông tin chi tiết</h3>
              <button onClick={() => setSelectedUser(null)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-full text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body */}
            {
                selectedUser ? (
                    <>
                    <div className="p-6 flex-1 overflow-y-auto">
                    <div className="flex flex-col items-center text-center mb-8">
                        <img src="/doraemon.jpg" alt="Avatar" className="w-24 h-24 rounded-full border-4 border-white dark:border-slate-700 mb-4 shadow-md object-cover" />
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedUser.full_name || 'N/A'}</h2>
                        <span className={`mt-2 px-3 py-1 rounded-full text-xs font-medium border ${getRoleStyle(selectedUser.role)}`}>
                        {selectedUser.role}
                        </span>
                    </div>

                    <div className="space-y-6">
                        <div>
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Liên hệ</h4>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
                            <Mail className="w-4 h-4 text-slate-400" /> {selectedUser.email}
                            </div>
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
                            <Phone className="w-4 h-4 text-slate-400" /> {selectedUser.phone_number || 'N/A'}
                            </div>
                        </div>
                        </div>

                        <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tài khoản</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                <Shield className="w-4 h-4 text-slate-400" /> Trạng thái
                            </div>
                            <span className={`px-2 py-0.5 rounded text-xs border ${getStatusStyle(selectedUser.is_active?.toString())}`}>
                                {selectedUser.is_active ? 'Hoạt động' : 'Bị khóa'}
                            </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
                                <Calendar className="w-4 h-4 text-slate-400" /> Ngày tham gia
                            </div>
                            <span className="text-slate-600 dark:text-slate-300">
                                {formatTime(selectedUser.created_at)}
                            </span>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                    {/* Drawer Footer */}
            <div className="p-6 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3">
              <NavLink to={`/admin/users/${selectedUser.id}`} className="flex items-center justify-center py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors">
                Chỉnh sửa
              </NavLink>
              {selectedUser.is_active === true ? (
                <button className="py-2.5 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-lg text-sm font-medium transition-colors">
                  Khóa tài khoản
                </button>
              ) : (
                <button className="py-2.5 bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/40 border border-green-200 dark:border-green-800/50 text-green-600 dark:text-green-400 rounded-lg text-sm font-medium transition-colors">
                  Mở khóa
                </button>
              )}
            </div>
                    </>
                    
                )
                : (
                    <div className="p-6 flex-1 flex items-center justify-center text-slate-500">
                        Chọn một người dùng để xem chi tiết
                    </div>
                )
            }     

            
          </div>
        </div>
     );
}
 
export default UserDetailSlide;