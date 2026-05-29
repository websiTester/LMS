import { 
  Users, BookOpen, DollarSign, AlertCircle, ArrowRight, 
  FileText, CheckCircle
} from 'lucide-react';

// --- MOCK DATA ---x
const STATS = [
  {
    id: 'pending',
    title: 'Khóa học chờ duyệt',
    value: '12',
    change: '+3 hôm nay',
    changeType: 'neutral',
    icon: AlertCircle,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    href: '/admin/courses/pending',
  },
  {
    id: 'users',
    title: 'Tổng học viên',
    value: '14,250',
    change: '+124 tuần này',
    changeType: 'positive',
    icon: Users,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    href: '/admin/users',
  },
  {
    id: 'revenue',
    title: 'Doanh thu hôm nay',
    value: '12.5M ₫',
    change: '+15% so với hôm qua',
    changeType: 'positive',
    icon: DollarSign,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    href: '/admin/revenue',
  },
  {
    id: 'active-courses',
    title: 'Khóa học đang hoạt động',
    value: '156',
    change: '2 khóa học mới',
    changeType: 'positive',
    icon: BookOpen,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    href: '/admin/courses',
  },
];


export default function AdminDashboard() {

  return (
    <div>
       {/* TOP HEADER */}
        {/* <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Dashboard Tổng quan</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-right">
              <p className="font-medium text-slate-900 dark:text-white">Admin User</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Super Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-slate-200 dark:border-slate-700">
              A
            </div>
          </div>
        </header> */}

        {/* DASHBOARD CONTENT (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Quick Actions Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Chào mừng trở lại!</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Dưới đây là tình hình hoạt động của hệ thống hôm nay.</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a 
                  href="/admin/courses/pending"
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                >
                  <AlertCircle className="w-4 h-4" /> Duyệt khóa học (12)
                </a>
                <a 
                  href="/admin/users"
                  className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg shadow-sm transition-colors"
                >
                  <Users className="w-4 h-4" /> Quản lý người dùng
                </a>
              </div>
            </div>

            {/* STATS CARDS ROW */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STATS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <a 
                    key={stat.id}
                    href={stat.href}
                    className="group flex flex-col p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all" />
                    </div>
                    <div>
                      <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1">
                        {stat.title}
                      </h3>
                      <div className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                        {stat.value}
                      </div>
                      <p className={`text-xs font-medium ${
                        stat.changeType === 'positive' ? 'text-green-600 dark:text-green-400' :
                        stat.changeType === 'negative' ? 'text-red-600 dark:text-red-400' :
                        'text-amber-600 dark:text-amber-400'
                      }`}>
                        {stat.change}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* RECENT ACTIVITY PLACEHOLDER */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Hoạt động gần đây</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-100 dark:border-slate-700 last:border-0 last:pb-0">
                      <div className="p-2 bg-slate-100 dark:bg-slate-700 rounded-lg shrink-0">
                        <FileText className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white">Giảng viên Kim nộp khóa học mới</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">2 giờ trước</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Hệ thống hoạt động ổn định</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
                  Không có cảnh báo lỗi nào trong 24 giờ qua. Các dịch vụ thanh toán và video streaming đang vận hành tốt.
                </p>
              </div>
            </div>

          </div>
        </div>
    </div>
       


  );
}