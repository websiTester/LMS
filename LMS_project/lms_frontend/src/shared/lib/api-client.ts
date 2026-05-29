import { handleAndThrowError } from "./error";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/';

interface CustomFetchOptions extends RequestInit {
    params?: Record<string, string | number | boolean>;
}

export const apiClient = async(endpoint: string, options: CustomFetchOptions = {}) => {
    const { params, headers, ...restOptions } = options;
    let url = `${BASE_URL}${endpoint}`;

    if(params){
        const searchParams = new URLSearchParams(params as Record<string, string>);
        url +=`?${searchParams.toString()}`;
    }

    const defaultHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        ...headers
    }

    const config: RequestInit = {
        ...restOptions,
        headers: defaultHeaders,
        credentials: 'include', // Gửi cookie cùng với yêu cầu
    }

    const response = await fetch(url, config);
    let data;
    try {
        data = await response.json();
    } catch {
        data = null;
    }
    if(!response.ok){
        handleAndThrowError(data);
    }

    return data;

}