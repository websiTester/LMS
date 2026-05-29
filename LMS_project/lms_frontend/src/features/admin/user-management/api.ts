import { useQuery } from "@tanstack/react-query"
import { apiClient } from "../../../shared/lib/api-client"
import type { User } from "../../../shared/types/user"

export const getAllUsersRequest = async (): Promise<User[]> => {
    return apiClient('users/all', {
        method: 'GET',
    })
}

export const useGetAllUsers = () => {
    return useQuery({
        queryKey: ['all-users'],
        queryFn: getAllUsersRequest,
    })
}