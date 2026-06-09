import z from "zod";

export const createCourseSchema = z.object({
    title: z.string().min(1, 'Tiêu đề không được để trống'),
    description: z.string().min(1, 'Mô tả không được để trống'),
    thumbnail: z.string().nullable(),
    target_language: z.string().min(1, 'Ngôn ngữ mục tiêu không được để trống'),
    level: z.enum(['beginner', 'intermediate', 'advanced'], { message: 'Cấp độ không hợp lệ' }),
    price: z.number().min(0, 'Giá phải là số dương'),
    is_free: z.boolean(),
})

export type CreateCourseFormData = z.infer<typeof createCourseSchema>;