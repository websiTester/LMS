import { 
  BookOpen, Users, CheckCircle, Clock, 
  PlusCircle, FileText, Menu, TrendingUp, 
  PlayCircle
} from 'lucide-react';


// --- MOCK DATA ---
const STATS = [
  {
    id: 'total',
    title: 'Tổng khóa học',
    value: '12',
    icon: BookOpen,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    href: '/teacher/courses',
  },
  {
    id: 'published',
    title: 'Đã xuất bản',
    value: '8',
    icon: CheckCircle,
    color: 'text-green-600 dark:text-green-400',
    bg: 'bg-green-100 dark:bg-green-900/30',
    href: '/teacher/courses?status=published',
  },
  {
    id: 'pending',
    title: 'Đang chờ duyệt',
    value: '2',
    icon: Clock,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    href: '/teacher/courses?status=pending',
  },
  {
    id: 'students',
    title: 'Tổng học viên',
    value: '1,245',
    icon: Users,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    href: '/teacher/students',
  },
];

// Dữ liệu mock cho biểu đồ 7 ngày
const CHART_DATA = [
  { day: 'T2', enrollments: 12, height: '30%' },
  { day: 'T3', enrollments: 25, height: '60%' },
  { day: 'T4', enrollments: 18, height: '45%' },
  { day: 'T5', enrollments: 42, height: '100%' },
  { day: 'T6', enrollments: 35, height: '80%' },
  { day: 'T7', enrollments: 15, height: '35%' },
  { day: 'CN', enrollments: 28, height: '65%' },
];

export default function TeacherDashboard() {

  return (
    <> 
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <button 
              className="lg:hidden p-2 -ml-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Dashboard Giảng viên</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-sm text-right">
              <p className="font-medium text-slate-900 dark:text-white">Alex Johnson</p>
              <p className="text-slate-500 dark:text-slate-400 text-xs">Teacher</p>
            </div>
            <img 
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=100" 
              alt="Avatar" 
              className="w-10 h-10 rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover"
            />
          </div>
        </header>

        {/* DASHBOARD CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Quick Actions Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Xin chào, Alex! 👋</h2>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Sẵn sàng chia sẻ kiến thức mới tới các học viên hôm nay chưa?</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <a 
                  href="/teacher/submissions"
                  className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-medium rounded-lg transition-colors"
                >
                  <FileText className="w-4 h-4" /> Xem submissions (5)
                </a>
                <a 
                  href="/teacher/courses/create"
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                >
                  <PlusCircle className="w-4 h-4" /> Tạo Course mới
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
                    className="group p-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 flex items-center gap-4"
                  >
                    <div className={`p-4 rounded-xl shrink-0 ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.title}</p>
                      <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                    </div>
                  </a>
                );
              })}
            </div>

            {/* CHARTS & ACTIVITY AREA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Enrollment Chart (CSS Based) */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-500" /> Lượt đăng ký học (7 ngày qua)
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tổng cộng +175 học viên mới tuần này</p>
                  </div>
                </div>

                {/* CSS Bar Chart */}
                <div className="h-64 flex items-end justify-between gap-2 sm:gap-4 pt-4 border-b border-slate-200 dark:border-slate-700 relative">
                  {/* Y-axis lines (Background) */}
                  <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none">
                    <div className="border-t border-slate-100 dark:border-slate-700/50 w-full h-0"></div>
                    <div className="border-t border-slate-100 dark:border-slate-700/50 w-full h-0"></div>
                    <div className="border-t border-slate-100 dark:border-slate-700/50 w-full h-0"></div>
                  </div>

                  {CHART_DATA.map((data, index) => (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 group z-10">
                      {/* Tooltip on hover */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity text-xs font-semibold bg-slate-800 text-white dark:bg-white dark:text-slate-900 px-2 py-1 rounded mb-1 pointer-events-none">
                        {data.enrollments}
                      </div>
                      
                      {/* The Bar */}
                      <div className="w-full max-w-[3rem] bg-blue-100 dark:bg-slate-700 rounded-t-md h-full flex items-end relative overflow-hidden">
                        <div 
                          className="w-full bg-blue-500 hover:bg-blue-400 transition-all duration-500 rounded-t-md" 
                          style={{ height: data.height }}
                        ></div>
                      </div>
                      
                      {/* X-axis Label */}
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {data.day}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Activity / Setup Guide */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Việc cần làm</h3>
                <div className="space-y-4">
                  
                  {/* Task 1 */}
                  <a href="/teacher/submissions" className="block p-4 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-900/10 hover:bg-amber-100 dark:hover:bg-amber-900/20 transition-colors">
                    <div className="flex gap-3">
                      <div className="mt-0.5"><FileText className="w-5 h-5 text-amber-600 dark:text-amber-400" /></div>
                      <div>
                        <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300">Chấm bài tập cuối khóa</h4>
                        <p className="text-xs text-amber-700 dark:text-amber-500/80 mt-1">Bạn có 5 bài tập của học viên khóa "Tiếng Anh Sơ Cấp" cần được review.</p>
                      </div>
                    </div>
                  </a>

                  {/* Task 2 */}
                  <a href="/teacher/courses/drafts" className="block p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                    <div className="flex gap-3">
                      <div className="mt-0.5"><PlayCircle className="w-5 h-5 text-slate-500 dark:text-slate-400" /></div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-200">Hoàn thiện khóa học</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Khóa học "JLPT N3" đang ở dạng nháp. Hãy upload video bài giảng để hoàn tất.</p>
                      </div>
                    </div>
                  </a>

                </div>
              </div>

            </div>
          </div>
        </div>
    </>
  );
}