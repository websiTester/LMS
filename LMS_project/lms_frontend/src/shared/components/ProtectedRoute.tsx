import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

interface Props{
    allowedRoles: string[];
}

export const ProtectedRoute = ({ allowedRoles }: Props) => {
    const user = useAuthStore((state) => state.user);

    if(!user){
        return <Navigate to="/login" replace />;
    }

    if(!allowedRoles.includes(user.role)){
        return <Navigate to="/403-unauthorized" replace />;
    }

    return <Outlet />;

}