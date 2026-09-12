import Navbar from "../styles/Navbar";
import { useStyleStore } from "../styles/store";
import useUserService from "./service";
import BlogTable from "../blogs/BlogTable";
import useBlogService from "../blogs/service";
import { useEffect } from "react";
import Alert from "../styles/Alert";
import { useUserStore } from "./store";
import useAuthService from "../auth/service";
import { useNavigate } from "react-router-dom";
import useViewerService from "../viewers/service";
import Loading from "../styles/Loading";
import { useBlogStore } from "../blogs/store";

export default function OtherUserBlogs() {
    const navigate = useNavigate();
    const auth = useAuthService();
    const user = useUserService();
    const blog = useBlogService();
    const viewers = useViewerService();
    
    const message = useStyleStore((state) => state.message);
    const setMessage = useStyleStore((state) => state.setMessage);
        
    const searched = useBlogStore((state) => state.searched);
    const setSearched = useBlogStore((state) => state.setSearched);

    const currentUserId = useUserStore((state) => state.currentUserId);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 1800);
            return () => clearTimeout(timer);
        }
    }, [message, setMessage]);

    useEffect(() => {
        if (!auth.getCurrentUser.isPending && !currentUserId && !auth.getCurrentUser.data?.user_id) {
            navigate("/sign-in", { replace: true });
        }
    }, [currentUserId, auth.getCurrentUser.isPending, auth.getCurrentUser.data, navigate]);

    const isProcessing = auth.isProcessing || blog.processing || viewers.isProcessing || user.isProcessing;

    return (
        <section className="flex md:flex-row flex-col h-dvh relative z-10">
            <Navbar is_processing={isProcessing} place="" sign_out={auth.signOutMt}/>
            {message ? <Alert message={message}/> : null}
            <main className="h-full overflow-y-auto md:w-3/4 w-full flex flex-col gap-2.5">
                <header className="flex flex-wrap gap-2.5 px-2.5 pt-2.5">
                    <input
                        className="outline-0 border w-full p-1.5 rounded-md border-zinc-700 text-zinc-700 text-base"
                        id="search blog title"
                        placeholder="find blog title here"
                        onChange={(event) => setSearched(event.target.value)}
                        type="text"
                        value={searched}
                    />
                </header>
                {blog.getAllOtherUserBlogs.error ? (
                    <section className="flex justify-center items-center h-full w-full md:w-3/4">
                        <h3 className="text-center font-medium text-lg text-gray-600">
                            {blog.getAllOtherUserBlogs.error.message}
                        </h3>
                    </section>
                ) : blog.getAllOtherUserBlogs.isLoading ? (
                    <section className="flex justify-center items-center h-full w-full md:w-3/4">
                        <Loading/>
                    </section>
                ) : (
                    <BlogTable 
                        data={blog.getAllOtherUserBlogs.data?.pages.flat() ?? []}
                        fetch_next_page={blog.getAllOtherUserBlogs.fetchNextPage}
                        has_next_page={blog.getAllOtherUserBlogs.hasNextPage}
                        is_fetching_next_page={blog.getAllOtherUserBlogs.isFetchingNextPage}
                        is_processing={blog.processing}
                        see_one_blog_mt={viewers.seeOneBlogMt}
                    />
                )}
            </main>
        </section>
    );
}