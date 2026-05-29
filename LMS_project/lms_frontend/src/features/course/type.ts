export interface CourseRead {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  thumbnail: string;
  target_language: string;
  level: string;
  price: number;
  is_free: boolean;
  status: string;
  teacher_id: number;
  created_at: string | null;
  updated_at: string | null;
    teacherName: string;
    teacherAvatar: string;
}