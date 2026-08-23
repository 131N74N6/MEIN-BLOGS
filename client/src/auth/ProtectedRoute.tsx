import { Navigate } from "react-router-dom";
import useUserService from "../users/service";
import Loading from "../styles/Loading";

interface ProtectedRouteIntrf {
    children: React.ReactNode;
}

export default function ProtectedRoute(props: ProtectedRouteIntrf) {
    const user = useUserService();

    if (!user.getCurrentUser.data && user.getCurrentUser.isLoading) {
        return (
            <div className="bg-white flex justify-center items-center h-dvh">
                <Loading/>
            </div>
        );
    }

    return user.getCurrentUser.data && user.getCurrentUser.data.user_id ? <>{props.children}</> : 
    <Navigate to={"/sign-in"} replace/>;
}