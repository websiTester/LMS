import React, { useState, useEffect } from 'react';

export default function Register() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Validate realtime khi người dùng nhập dữ liệu
  useEffect(() => {
    const newErrors = { ...errors };

    // Validate Email
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không đúng định dạng';
    } else {
      newErrors.email = '';
    }

    // Validate Password
    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'Mật khẩu phải có ít nhất 8 ký tự';
    } else {
      newErrors.password = '';
    }

    // Validate Confirm Password
    if (formData.confirmPassword && formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    } else {
      newErrors.confirmPassword = '';
    }

    setErrors(newErrors);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.email, formData.password, formData.confirmPassword]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    
    // Clear lỗi agreeTerms khi người dùng tick vào
    if (name === 'agreeTerms' && checked) {
      setErrors((prev) => ({ ...prev, agreeTerms: '' }));
    }
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.email) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    }
    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    }
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
      isValid = false;
    }
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Bạn cần đồng ý với điều khoản sử dụng';
      isValid = false;
    }

    // Nếu có bất kỳ lỗi nào đang tồn tại (từ useEffect) thì form không hợp lệ
    if (newErrors.email || newErrors.password || newErrors.confirmPassword) {
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      // MÔ PHỎNG GỌI API: POST /auth/signup
      // Thay thế bằng fetch() hoặc axios() thực tế
      await new Promise((resolve) => setTimeout(resolve, 1500)); 
      
      const mockResponse = {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock_token_here'
      };

      // Set JWT Cookie (Lưu ý: trong thực tế nên set HttpOnly cookie từ backend)
      document.cookie = `jwt_token=${mockResponse.token}; path=/; max-age=86400; secure; samesite=strict`;

      // Chuyển hướng về trang Dashboard
      // Nếu dùng Next.js, hãy dùng router.push('/dashboard')
      window.location.href = '/dashboard';

    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      alert('Đã có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setIsLoading(false);
    }
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
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Bắt đầu hành trình chinh phục ngôn ngữ của bạn
          </p>
        </div>

        {/* Form Đăng ký */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
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
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors dark:bg-slate-700 dark:text-white
                  ${errors.email 
                    ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50' 
                    : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400'}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
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
                required
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors dark:bg-slate-700 dark:text-white
                  ${errors.password 
                    ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50' 
                    : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400'}`}
                placeholder="Ít nhất 8 ký tự"
              />
              {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors dark:bg-slate-700 dark:text-white
                  ${errors.confirmPassword 
                    ? 'border-red-500 focus:ring-red-200 dark:focus:ring-red-900/50' 
                    : 'border-slate-300 dark:border-slate-600 focus:ring-blue-500 focus:border-blue-500 dark:focus:border-blue-400'}`}
                placeholder="Nhập lại mật khẩu"
              />
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="agreeTerms" className="text-slate-600 dark:text-slate-400">
                  Tôi đồng ý với các{' '}
                  <a href="/terms" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    Điều khoản sử dụng
                  </a>
                  {' '}và{' '}
                  <a href="/privacy" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                    Chính sách bảo mật
                  </a>
                </label>
                {errors.agreeTerms && <p className="mt-1 text-sm text-red-500">{errors.agreeTerms}</p>}
              </div>
            </div>
          </div>

          {/* Submit Button */}
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
                'Đăng ký tài khoản'
              )}
            </button>
          </div>
        </form>

        {/* Redirect to Login */}
        <div className="text-center mt-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Đã có tài khoản?{' '}
            <a href="/login" className="font-semibold text-blue-600 hover:text-blue-500 dark:text-blue-400 transition-colors">
              Đăng nhập ngay
            </a>
          </p>
        </div>

      </div>
    </div>
  );
}