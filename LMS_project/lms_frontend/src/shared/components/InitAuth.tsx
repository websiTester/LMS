import { useEffect } from "react";
import { useGetCurrentUser } from "../../features/auth/api";
import { useAuthStore } from "../store/authStore";
import { Outlet } from "react-router-dom";

const InitAuth = () => {

    const { data: user, isLoading, isError } = useGetCurrentUser();

    const login = useAuthStore((state) => state.login);
    const logout = useAuthStore((state) => state.logout);

    useEffect(() => {
        if(user){
            login(user);
        } else {
            logout();
        }
    }, [user, isError, login, logout]);

    if(isLoading){
        return (
            <div className="flex h-screen w-screen items-center justify-center">
                <span>Đang tải dữ liệu người dùng...</span>
            </div>
        )
    }

    return <Outlet />;
}
 
export default InitAuth;