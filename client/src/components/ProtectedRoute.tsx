import useUserService from "../services/useUserService"
import Loading from "./Loading";
import { Navigate } from "react-router-dom";

interface RouteProtectionIntrf {
    children: React.ReactNode;
}

export default function ProtectedRoute(props: RouteProtectionIntrf) {
    const { getCurrentUser } = useUserService();

    if (!getCurrentUser.data && getCurrentUser.isLoading) {
        return (
            <div className="bg-white justify-center items-center h-dvh">
                <Loading/>
            </div>
        )
    }

    return getCurrentUser.data && getCurrentUser.data.user_id ? 
    <>{props.children}</> : 
    <Navigate to={"/sign-in"} replace/>
}