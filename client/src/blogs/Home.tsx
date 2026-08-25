import { useNavigate } from "react-router-dom";
import useAuthService from "../auth/service";
import Navbar from "../styles/Navbar";
import BlogList from "./BlogList";
import useBlogService from "./service";
import { useEffect } from "react";
import { useUserStore } from "../users/store";

export default function Home() {
    const navigate = useNavigate();

    const auth = useAuthService();
    const blog = useBlogService();
        
    const currentUserId = useUserStore((state) => state.currentUserId);

    useEffect(() => {
        if (!auth.getCurrentUser.isPending && !currentUserId && !auth.getCurrentUser.data?.user_id) {
            navigate("/sign-in", { replace: true });
        }
    }, [currentUserId, auth.getCurrentUser.isPending, auth.getCurrentUser.data, navigate]);

    return (
        <section className="flex md:flex-row flex-col h-dvh">
            <Navbar place="home" sign_out={auth.signOutMt} is_processing={blog.processing}/>
            <main className="h-full flex flex-col">
                <header></header>
                <section>
                    <BlogList/>
                </section>
            </main>
        </section>
    );
}