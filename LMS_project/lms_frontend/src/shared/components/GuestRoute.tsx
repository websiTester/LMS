import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { getDashboardByRole } from "../utils/navigation";

const GuestRoute = () => {
    const user = useAuthStore((state) => state.user);
    console.log("GuestRoute user:", user);
    if(user){
        return <Navigate to={getDashboardByRole(user.role)} replace />;
    }

    return <Outlet />;
}
 
export default GuestRoute;