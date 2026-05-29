
export type Role = 'admin' | 'student' | 'instructor'; // Nên dùng Union Type thay vì string thường
export interface User {
  id: number;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  is_active: boolean;
  role: Role;
  created_at: string; // ISO date string

}