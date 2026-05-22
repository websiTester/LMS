import { useEffect, useState } from "react";

const LandingPage = () => {

    const [isDarkMode, setIsDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Xử lý Theme & Hydration (Tránh lỗi mismatch SSR nếu dùng Next.js)
  useEffect(() => {
    setMounted(true);
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  // Tránh render UI sai theme trong lần load đầu tiên
  if (!mounted) return null;

    return ( 
        <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-900 dark:text-slate-50 font-sans transition-colors duration-300">
      
      {/* HEADER */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <a href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              LinguaLMS
            </a>
            <nav className="hidden md:flex gap-6 text-sm font-medium">
              <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Tính năng</a>
              <a href="#testimonials" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Đánh giá</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle Theme"
            >
              {isDarkMode ? (
                <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            <a href="/login" className="hidden sm:block text-sm font-medium hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Đăng nhập
            </a>
            <a href="/signup" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
              Đăng ký
            </a>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6">
          Chinh phục ngôn ngữ mới <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">
            dễ dàng và hiệu quả
          </span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10">
          Hệ thống học tập cá nhân hóa giúp bạn làm chủ tiếng Anh, Nhật, Hàn, Trung nhanh gấp 2 lần so với phương pháp truyền thống.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/signup" className="px-8 py-4 text-base font-semibold text-white bg-blue-600 rounded-full hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-1">
            Bắt đầu học miễn phí
          </a>
          <a href="#features" className="px-8 py-4 text-base font-semibold text-slate-700 bg-white dark:bg-slate-800 dark:text-slate-200 rounded-full border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
            Tìm hiểu thêm
          </a>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Tính năng nổi bật</h2>
          <p className="text-slate-600 dark:text-slate-400">Trải nghiệm phương pháp học tập hiện đại nhất</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Lộ trình cá nhân hóa",
              desc: "Hệ thống tự động điều chỉnh bài giảng dựa trên trình độ và tốc độ tiếp thu của riêng bạn.",
              icon: "M13 10V3L4 14h7v7l9-11h-7z"
            },
            {
              title: "Tương tác AI thông minh",
              desc: "Luyện phát âm và giao tiếp với trợ lý ảo AI 24/7, nhận phản hồi sửa lỗi ngay lập tức.",
              icon: "M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
            },
            {
              title: "Cộng đồng năng động",
              desc: "Kết nối, học hỏi và thi đấu cùng hàng ngàn học viên khác trên toàn thế giới.",
              icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            }
          ].map((feature, idx) => (
            <div key={idx} className="p-8 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-6">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon} />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-100 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-16">Học viên nói gì về chúng tôi?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="p-8 bg-white dark:bg-slate-800 rounded-2xl text-left border border-slate-200 dark:border-slate-700">
                <div className="flex text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-6 italic">"Giao diện thân thiện, bài học trực quan. Mình đã tăng 2 cấp độ tiếng Anh chỉ sau 3 tháng sử dụng mỗi ngày."</p>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400">
                    HV
                  </div>
                  <div>
                    <div className="font-semibold text-sm">Học viên {item}</div>
                    <div className="text-xs text-slate-500">Người dùng gói Premium</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xl font-bold text-slate-900 dark:text-white">
            LinguaLMS
          </div>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-600 dark:text-slate-400">
            <a href="/about" className="hover:text-blue-600 dark:hover:text-blue-400">Về chúng tôi</a>
            <a href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400">Chính sách bảo mật</a>
            <a href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400">Điều khoản sử dụng</a>
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-500">
            © {new Date().getFullYear()} LinguaLMS. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
     );
}
 
export default LandingPage;