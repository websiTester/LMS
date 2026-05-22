import React, { useState } from 'react';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Xóa thông báo lỗi khi người dùng bắt đầu nhập lại
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setErrorMessage('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      // MÔ PHỎNG GỌI API: POST /auth/login
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockResponse = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.login_mock_token'
      };

      // Set JWT Cookie
      // Nếu có "Ghi nhớ tôi", set thời gian sống lâu hơn (VD: 30 ngày), ngược lại là session hoặc 1 ngày
      const maxAge = formData.rememberMe ? 30 * 24 * 60 * 60 : 86400;
      document.cookie = `jwt_token=${mockResponse.token}; path=/; max-age=${maxAge}; secure; samesite=strict`;

      // Chuyển hướng về trang Dashboard
      window.location.href = '/dashboard';

    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setErrorMessage('Email hoặc mật khẩu không chính xác.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Chuyển hướng đến endpoint OAuth của backend (VD: /auth/google)
    console.log("Redirecting to Google OAuth...");
    // window.location.href = '/auth/google';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-300">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
        
        {/* Header / Logo */}
        <div className="text-center">
          <a href="/" className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
            LinguaLMS
          </a>
          <h2 className="mt-6 text-2xl font-bold text-slate-900 dark:text-white">
            Chào mừng trở lại
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Đăng nhập để tiếp tục lộ trình học tập của bạn
          </p>
        </div>

        {/* Nút Đăng nhập bằng Google */}
        <div className="mt-8">
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Đăng nhập với Google
          </button>
        </div>

        {/* Divider */}
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              Hoặc đăng nhập bằng email
            </span>
          </div>
        </div>

        {/* Form Đăng nhập bằng Email/Password */}
        <form className="mt-6 space-y-6" onSubmit={handleSubmit}>
          {errorMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
              {errorMessage}
            </div>
          )}

          <div className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Địa chỉ Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors dark:bg-slate-700 dark:text-white"
                placeholder="you@example.com"
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Mật khẩu
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition-colors dark:bg-slate-700 dark:text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Ghi nhớ tôi & Quên mật khẩu */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700"
              />
              <label htmlFor="rememberMe" className="ml-2 block text-sm text-slate-600 dark:text-slate-400">
                Ghi nhớ tôi
              </label>
            </div>

            <div className="text-sm">
              <a href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
                Quên mật khẩu?
              </a>
            </div>
          </div>

          {/* Nút Submit */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isLoading ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </div>
        </form>

        {/* Link chuyển sang Đăng ký */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Chưa có tài khoản?{' '}
            <a href="/signup" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
              Tạo tài khoản mới
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}