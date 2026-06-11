import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { registerSchema, type RegisterFormData } from '../../features/auth/schemas';
import { zodResolver } from '@hookform/resolvers/zod/src/index.js';
import { useRegister } from '../../features/auth/api';

export default function Register() {

  const [apiError, setApiError] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isSuccess, setIsSucess] = useState(false);
  const navigate = useNavigate();

  const {register, handleSubmit, formState: { errors, isSubmitting }} = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirm_password: '',
      role: 'student',
  }})

  const {mutate: register_account} = useRegister();
  const onSubmit = async (data: RegisterFormData) => {
    console.log('Form data:', data);
    setApiError('');
    setIsSucess(false)
    register_account(data, {
      onSuccess: (result) => {
        console.log('Register successful:', result);
        setIsSucess(true);
        navigate('/student/dashboard');
      },
      onError: (error: any)=>{
        console.error(error);
        setApiError(error.message || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      }
    })

  };

  const errorMessage = (message: string) => {
    return <p className="mt-1 text-sm text-red-500  whitespace-pre-line">{message}</p>
  }

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
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Địa chỉ Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                {...register('email')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors dark:bg-slate-700 dark:text-white`}
                placeholder="you@example.com"
              />
              {errors.email && errorMessage(errors.email.message!)}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                required
                {...register('password')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors dark:bg-slate-700 dark:text-white`}
                placeholder="Ít nhất 8 ký tự"
              />
              {errors.password && errorMessage(errors.password.message!)}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Xác nhận mật khẩu
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                {...register('confirm_password')}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-colors dark:bg-slate-700 dark:text-white`}
                placeholder="Nhập lại mật khẩu"
              />
              {errors.confirm_password && errorMessage(errors.confirm_password.message!)}
            </div>


            {/* Terms and Conditions Checkbox */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
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
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              {isSubmitting ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Đăng ký tài khoản'
              )}
            </button>
            {apiError && errorMessage(apiError)}
            {isSuccess && <p className="mt-1 text-sm text-green-500  whitespace-pre-line">Register Successful</p>}
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