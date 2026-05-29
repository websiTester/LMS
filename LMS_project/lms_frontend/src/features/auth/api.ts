import { apiClient } from "../../shared/lib/api-client";
import { useAuthStore } from "../../shared/store/authStore";
import type { LoginFormData, RegisterFormData } from "./schemas";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const loginRequest = async (data: LoginFormData) => {
    return apiClient('users/login', {
        method: 'POST',
        body: JSON.stringify(data),
    })
}


export const useLogin = () => {
    return useMutation({
        mutationFn: loginRequest,
    })
}



export const registerRequest = async (data: RegisterFormData) => {
    return apiClient('users/register', {
        method: 'POST',
        body: JSON.stringify(data),
    })
}

export const useRegister = () => {
    return useMutation({
        mutationFn: registerRequest,
    })
}

export const logoutRequest = async () => {
    return apiClient('users/logout', {
        method: 'POST',
    })
}

export const useLogout = () => {
    const queryClient = useQueryClient(); // Phải gọi Hook ở ngoài cùng của Custom Hook

    return useMutation({
        mutationFn: logoutRequest,

        //Call onSettled trong usLogout vì hành vi logout của mọi user đều như nhau...
        onSettled: () => {
            useAuthStore.getState().logout();
            
            // Sau khi logout thành công hoặc thất bại, xóa dữ liệu người dùng khỏi cache
            queryClient.clear();
            window.location.href = '/login'; // Chuyển hướng về trang login sau khi logout
        }
    })
}

export const getCurrentUserRequest = async () => {
    return apiClient('users/me', {
        method: 'GET',
    })
}

export const useGetCurrentUser = () => {
    return useQuery({
        queryKey: ['currentUser'],
        queryFn: getCurrentUserRequest,
        retry: 0,
    })
}