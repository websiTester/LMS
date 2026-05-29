export interface Course {
    id: number;
    slug: string;
    title: string;
    description: string;
    thumbnail: string | null;
    target_language: string;
    level: string;
    price: number;
    is_free: boolean;
    status: string;
    teacher_id: number;
    created_at: string | null;
    updated_at: string | null;
}