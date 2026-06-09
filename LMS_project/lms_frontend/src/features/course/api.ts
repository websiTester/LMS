import { useQuery } from "@tanstack/react-query"
import { apiClient } from "../../shared/lib/api-client"
import { courseKeys } from "@/shared/types/queryKey"



export const getAllCoursesRequest = async () => {
    return apiClient('courses/allCourses', {
        method: 'GET',
    })
}

export const useGetAllCourses = () => {
    return useQuery({
        queryKey: courseKeys.all,
        queryFn: getAllCoursesRequest,
    })
}