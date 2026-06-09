import { apiClient } from "@/shared/lib/api-client"
import type { CourseRead } from "@/shared/types/course"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { CreateCourseFormData } from "./schemas"
import { courseKeys } from "@/shared/types/queryKey"

export const getTeacherCoursesRequest = async (): Promise<CourseRead[]> => {
    return apiClient('teacher/list-courses', {
        method: 'GET',
    })
}

export const useGetTeacherCourses = () => {
    return useQuery({
        queryKey: courseKeys.teacherCourses(),
        queryFn: getTeacherCoursesRequest,
    })
}

export const createCourseRequest = async (courseData: CreateCourseFormData): Promise<CourseRead> => {
    return apiClient('teacher/create-course', {
        method: 'POST',
        body: JSON.stringify(courseData),
    })
}

export const useCreateCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createCourseRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: courseKeys.teacherCourses()}); //query key phải trùng với query key trong useGetTeacherCourses để tự động refetch sau khi tạo course mới
        }
    })
}


export const getCourseByIdRequest = async (courseId: number): Promise<CourseRead> => {
    return apiClient(`teacher/courses/${courseId}`, {
        method: 'GET',
    })
}

export const useGetCourseById = (courseId: number, isEditMode: boolean) => {
    return useQuery({
        queryKey: courseKeys.detail(courseId),
        queryFn: () => getCourseByIdRequest(courseId),
        enabled: isEditMode, //chỉ chạy query này khi đang ở chế độ edit, tránh việc gọi API không cần thiết khi tạo mới course
    })
}


export const updateCourseRequest = async ({courseId, courseData}: {courseId: number, courseData: CreateCourseFormData}): Promise<CourseRead> => {
    return apiClient(`teacher/courses/update/${courseId}`, {
        method: 'PUT',
        body: JSON.stringify(courseData),
    })
}

export const useUpdateCourse = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateCourseRequest,
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: courseKeys.teacherCourses() }); //query key phải trùng với query key trong useGetTeacherCourses để tự động refetch sau khi tạo course mới
            queryClient.invalidateQueries({ queryKey: courseKeys.detail(variables.courseId) }); //refetch lại dữ liệu chi tiết course sau khi update để đảm bảo dữ liệu mới nhất được hiển thị nếu người dùng đang ở trang edit course
        }
    })
}
