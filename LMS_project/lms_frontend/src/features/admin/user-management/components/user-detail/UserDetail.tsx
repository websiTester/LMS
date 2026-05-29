import { useState } from 'react';
import { 
  ChevronRight, Copy, Check, Save, Lock, Unlock, Key, 
  Calendar, Clock, Monitor, User, ShieldAlert, LogOut, 
  Trash2, BookOpen, CreditCard, GraduationCap, Star, TrendingUp
} from 'lucide-react';
import { getRoleStyle, getStatusStyle } from '../../utils/styles';

// --- MOCK DATA ---
const MOCK_USER = {
  id: 'USR-7890',
  name: 'Nobita Nobi',
  email: 'nobita.nobi@example.com',
  phone: '0987 654 321',
  avatar: 'https://i.pravatar.cc/150?u=nobita',
  status: 'Active', // Active, Banned
  joinedDate: '15/02/2026',
  lastLogin: '29/05/2026 09:15 AM',
  lastIP: '113.190.23.45',
  
  // Dữ liệu mock riêng cho Student
  studentData: {
    enrolledCourses: [
      { id: '1', title: 'Tiếng Anh Giao Tiếp Sơ Cấp', progress: 85, lastStudied: 'Hôm qua' },
      { id: '2', title: 'Luyện thi JLPT N4', progress: 30, lastStudied: '3 ngày trước' },
    ],
    payments: [
      { id: 'INV-001', date: '15/02/2026', amount: '599,000 ₫', status: 'Thành công', course: 'Tiếng Anh Giao Tiếp Sơ Cấp' },
      { id: 'INV-002', date: '10/04/2026', amount: '850,000 ₫', status: 'Thành công', course: 'Luyện thi JLPT N4' },
    ]
  },

  // Dữ liệu mock riêng cho Teacher
  teacherData: {
    totalRevenue: '45,500,000 ₫',
    totalStudents: 1245,
    averageRating: 4.8,
    createdCourses: [
      { id: 't1', title: 'Tiếng Nhật giao tiếp nâng cao', students: 450, status: 'Published', revenue: '12,500,000 ₫' },
      { id: 't2', title: 'Kanji cơ bản đến nâng cao', students: 0, status: 'Pending', revenue: '0 ₫' },
    ]
  }
};

export default function UserDetail() {
  const [activeTab, setActiveTab] = useState<'personal' | 'lms' | 'security'>('personal');
  const [isCopied, setIsCopied] = useState(false);
  
  // States mô phỏng thao tác Admin
  const [role, setRole] = useState<'student' | 'teacher' | 'admin'>('student');
  const [status, setStatus] = useState(MOCK_USER.status);

  // Hàm Copy Email
  const handleCopyEmail = () => {
    navigator.clipboard.writeText(MOCK_USER.email);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };


  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-50 p-4 sm:p-6 lg:p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* 1. HEADER & ACTIONS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          
          {/* Breadcrumb */}
          <div className="flex items-center text-sm font-medium text-slate-500 dark:text-slate-400">
            <a href="/admin/users" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Quản lý người dùng</a>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-slate-900 dark:text-white">Chi tiết</span>
            <ChevronRight className="w-4 h-4 mx-1" />
            <span className="text-slate-900 dark:text-white">{MOCK_USER.name}</span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button 
              onClick={() => setRole(role === 'student' ? 'teacher' : 'student')}
              className="px-3 py-2 text-xs font-medium bg-slate-100 dark:bg-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors mr-2 border border-dashed border-slate-400"
            >
              🔄 Xem giao diện {role === 'student' ? 'Giảng viên' : 'Học viên'}
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
              <Key className="w-4 h-4" /> <span className="hidden sm:inline">Reset Pass</span>
            </button>
            
            <button 
              onClick={() => setStatus(status === 'Active' ? 'Banned' : 'Active')}
              className={`flex items-center gap-2 px-4 py-2 border rounded-lg text-sm font-medium transition-colors shadow-sm ${
                status === 'Active' 
                  ? 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800/50 dark:text-red-400 dark:hover:bg-red-900/40' 
                  : 'bg-green-50 border-green-200 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800/50 dark:text-green-400 dark:hover:bg-green-900/40'
              }`}
            >
              {status === 'Active' ? <><Lock className="w-4 h-4" /> Khóa TK</> : <><Unlock className="w-4 h-4" /> Mở khóa</>}
            </button>

            <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white border border-transparent rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Save className="w-4 h-4" /> Lưu
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          
          {/* 2. PROFILE SUMMARY CARD (LEFT COL) */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-6 text-center border-b border-slate-100 dark:border-slate-700/50">
                <div className="relative inline-block mb-4">
                  <img src={MOCK_USER.avatar} alt={MOCK_USER.name} className="w-24 h-24 rounded-full border-4 border-slate-50 dark:border-slate-700 object-cover shadow-sm" />
                  <div className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{MOCK_USER.name}</h2>
                <div className="flex justify-center items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                  <span>{MOCK_USER.email}</span>
                  <button onClick={handleCopyEmail} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors" title="Copy Email">
                    {isCopied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-center gap-3 mt-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleStyle(role)}`}>{role}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusStyle(status)}`}>{status === 'Active' ? 'Hoạt động' : 'Bị khóa'}</span>
                </div>
              </div>

              <div className="p-6 space-y-4 text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Ngày tham gia</p>
                    <p className="font-medium text-slate-900 dark:text-white">{MOCK_USER.joinedDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Lần đăng nhập cuối</p>
                    <p className="font-medium text-slate-900 dark:text-white">{MOCK_USER.lastLogin}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Monitor className="w-4 h-4 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Địa chỉ IP gần nhất</p>
                    <p className="font-medium text-slate-900 dark:text-white">{MOCK_USER.lastIP}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. MAIN CONTENT TABS (RIGHT COL) */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden min-h-[500px] flex flex-col">
              
              {/* Tabs Navigation */}
              <div className="flex border-b border-slate-200 dark:border-slate-700 overflow-x-auto hide-scrollbar">
                {[
                  { id: 'personal', label: 'Thông tin cá nhân', icon: User },
                  { id: 'lms', label: 'Dữ liệu Học tập/Giảng dạy', icon: BookOpen },
                  { id: 'security', label: 'Bảo mật & Quản trị', icon: ShieldAlert },
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors ${
                        activeTab === tab.id 
                          ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10' 
                          : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content Wrapper */}
              <div className="p-6 flex-1">
                
                {/* --- TAB 1: PERSONAL INFO --- */}
                {activeTab === 'personal' && (
                  <div className="space-y-6 animate-fade-in">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Cập nhật hồ sơ</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Họ và tên</label>
                        <input type="text" defaultValue={MOCK_USER.name} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Số điện thoại</label>
                        <input type="text" defaultValue={MOCK_USER.phone} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                          Địa chỉ Email <span className="text-slate-400 font-normal ml-1">(Chỉ đọc)</span>
                        </label>
                        <input type="email" defaultValue={MOCK_USER.email} disabled className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-2.5 text-slate-500 dark:text-slate-400 cursor-not-allowed" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vai trò hệ thống</label>
                        <select value={role} onChange={(e) => setRole(e.target.value as any)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none transition-colors">
                          <option value="Student">Học viên (Student)</option>
                          <option value="Teacher">Giảng viên (Teacher)</option>
                          <option value="Admin">Quản trị viên (Admin)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB 2: LMS DATA --- */}
                {activeTab === 'lms' && (
                  <div className="animate-fade-in space-y-8">
                    
                    {/* VARIANT: STUDENT */}
                    {role === 'student' && (
                      <>
                        {/* Courses */}
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-500" /> Khóa học đang tham gia
                          </h3>
                          <div className="space-y-4">
                            {MOCK_USER.studentData.enrolledCourses.map(course => (
                              <div key={course.id} className="p-4 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                <div className="flex justify-between items-start mb-2">
                                  <div className="font-semibold text-slate-900 dark:text-white">{course.title}</div>
                                  <div className="text-sm font-medium text-blue-600 dark:text-blue-400">{course.progress}%</div>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-2">
                                  <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${course.progress}%` }}></div>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">Học lần cuối: {course.lastStudied}</div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Payments */}
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-green-500" /> Lịch sử giao dịch
                          </h3>
                          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                  <th className="p-4">Mã HĐ</th>
                                  <th className="p-4">Ngày</th>
                                  <th className="p-4">Khóa học</th>
                                  <th className="p-4 text-right">Số tiền</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                {MOCK_USER.studentData.payments.map(payment => (
                                  <tr key={payment.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <td className="p-4 font-medium text-slate-900 dark:text-slate-300">{payment.id}</td>
                                    <td className="p-4">{payment.date}</td>
                                    <td className="p-4">{payment.course}</td>
                                    <td className="p-4 text-right font-medium text-green-600 dark:text-green-400">{payment.amount}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    )}

                    {/* VARIANT: TEACHER */}
                    {role === 'teacher' && (
                      <>
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-4">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg"><TrendingUp className="w-6 h-6" /></div>
                            <div><p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Tổng doanh thu</p><p className="text-lg font-bold text-slate-900 dark:text-white">{MOCK_USER.teacherData.totalRevenue}</p></div>
                          </div>
                          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-4">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg"><GraduationCap className="w-6 h-6" /></div>
                            <div><p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Học viên</p><p className="text-lg font-bold text-slate-900 dark:text-white">{MOCK_USER.teacherData.totalStudents.toLocaleString()}</p></div>
                          </div>
                          <div className="p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center gap-4">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 rounded-lg"><Star className="w-6 h-6" /></div>
                            <div><p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase">Đánh giá TB</p><p className="text-lg font-bold text-slate-900 dark:text-white">{MOCK_USER.teacherData.averageRating} / 5</p></div>
                          </div>
                        </div>

                        {/* Created Courses */}
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-blue-500" /> Khóa học đã tạo
                          </h3>
                          <div className="overflow-x-auto border border-slate-200 dark:border-slate-700 rounded-xl">
                            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
                              <thead className="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-medium border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                  <th className="p-4">Tên khóa học</th>
                                  <th className="p-4">Học viên</th>
                                  <th className="p-4">Trạng thái</th>
                                  <th className="p-4 text-right">Doanh thu</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-700 bg-white dark:bg-slate-800">
                                {MOCK_USER.teacherData.createdCourses.map(course => (
                                  <tr key={course.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                                    <td className="p-4 font-medium text-slate-900 dark:text-slate-300">{course.title}</td>
                                    <td className="p-4">{course.students}</td>
                                    <td className="p-4">
                                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${course.status === 'Published' ? 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400' : 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                                        {course.status === 'Published' ? 'Đã xuất bản' : 'Chờ duyệt'}
                                      </span>
                                    </td>
                                    <td className="p-4 text-right font-medium text-slate-900 dark:text-white">{course.revenue}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* --- TAB 3: SECURITY & DANGER ZONE --- */}
                {activeTab === 'security' && (
                  <div className="animate-fade-in space-y-8">
                    
                    {/* Session Management */}
                    <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Quản lý phiên làm việc</h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Đăng xuất người dùng này khỏi tất cả các thiết bị đang đăng nhập hiện tại. Hữu ích khi phát hiện truy cập trái phép.</p>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-medium transition-colors">
                        <LogOut className="w-4 h-4" /> Force Logout (Đăng xuất ngay)
                      </button>
                    </div>

                    {/* DANGER ZONE */}
                    <div className="border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/10 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                      <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-2 flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5" /> Danger Zone (Khu vực nguy hiểm)
                      </h3>
                      <p className="text-sm text-red-700/80 dark:text-red-300/80 mb-6 max-w-3xl">
                        Xóa tài khoản là một hành động không thể phục hồi. Tất cả dữ liệu khóa học, thanh toán và tiến độ của người dùng sẽ bị xóa vĩnh viễn khỏi hệ thống. Khuyến nghị sử dụng tính năng "Khóa tài khoản" ở phía trên thay vì xóa cứng.
                      </p>
                      <button className="flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
                        <Trash2 className="w-4 h-4" /> Xóa vĩnh viễn tài khoản
                      </button>
                    </div>

                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.2s ease-out forwards; }
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}