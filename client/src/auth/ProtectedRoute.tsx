import { Navigate } from "react-router-dom";
import Loading from "../styles/Loading";
import useAuthService from "./service";

interface ProtectedRouteIntrf {
    children: React.ReactNode;
}

export default function ProtectedRoute(props: ProtectedRouteIntrf) {
    const auth = useAuthService();

    if (!auth.getCurrentUser.data && auth.getCurrentUser.isLoading) {
        return (
            <div className="bg-white flex justify-center items-center h-dvh">
                <Loading/>
            </div>
        );
    }

    return auth.getCurrentUser.data && auth.getCurrentUser.data.user_id ? <>{props.children}</> : 
    <Navigate to={"/sign-in"} replace/>;
}