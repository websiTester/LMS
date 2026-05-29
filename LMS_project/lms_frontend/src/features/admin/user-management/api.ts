import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { apiClient } from "../../../shared/lib/api-client"
import type { User } from "../../../shared/types/user"
import type { CreateAccountFormData } from "./schemas"

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


export const createAccountRequest = async (data: CreateAccountFormData) => {
    return apiClient('admin/create-account', {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

export const useCreateAccount = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createAccountRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['all-users'] });  //query key phải trùng với query key trong useGetAllUsers để tự động refetch sau khi tạo account mới
        }
    })
}