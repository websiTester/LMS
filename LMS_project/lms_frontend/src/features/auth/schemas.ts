import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Vui lòng nhập email hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  rememberMe: z.boolean().optional(),
});

export type LoginFormData = z.infer<typeof loginSchema>;


export const registerSchema = z.object({
  email: z.string().email('Vui lòng nhập email hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirm_password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  role: z.enum(['student', 'teacher'], { message: 'Vai trò không hợp lệ' }),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirm_password'], // lỗi sẽ được gắn vào trường confirm_password
});

export type RegisterFormData = z.infer<typeof registerSchema>;

