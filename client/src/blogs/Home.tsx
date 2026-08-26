import { useNavigate } from "react-router-dom";
import useAuthService from "../auth/service";
import Navbar from "../styles/Navbar";
import BlogGrid from "./BlogGrid";
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

    const isProcessing = blog.processing;

    return (
        <section className="flex md:flex-row flex-col h-dvh">
            <Navbar place="home" sign_out={auth.signOutMt} is_processing={blog.processing}/>
            <main className="h-full md:w-3/4 w-full flex flex-col">
                <header className="px-2.5 pt-2.5"></header>
                <BlogGrid 
                    data={blog.getAllBlogs.data?.pages.flat() ?? []}
                    fetchNextPage={blog.getAllBlogs.fetchNextPage}
                    hasNextPage={blog.getAllBlogs.hasNextPage}
                    isFetchingNextPage={blog.getAllBlogs.isFetchingNextPage}
                    isProcessing={isProcessing}
                />
            </main>
        </section>
    );
}