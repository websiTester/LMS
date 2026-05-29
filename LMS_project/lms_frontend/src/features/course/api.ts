import { useQuery } from "@tanstack/react-query"
import { apiClient } from "../../shared/lib/api-client"



export const getAllCoursesRequest = async () => {
    return apiClient('courses/allCourses', {
        method: 'GET',
    })
}

export const useGetAllCourses = () => {
    return useQuery({
        queryKey: ['all-courses'],
        queryFn: getAllCoursesRequest,
    })
}