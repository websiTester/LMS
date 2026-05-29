import z from "zod";

export const createAccountSchema = z.object({
  email: z.string().email('Vui lòng nhập email hợp lệ'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  confirm_password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
  role: z.enum(['teacher', 'admin'], { message: 'Vai trò không hợp lệ' }),
}).refine((data) => data.password === data.confirm_password, {
  message: 'Mật khẩu xác nhận không khớp'
});

export type CreateAccountFormData = z.infer<typeof createAccountSchema>;