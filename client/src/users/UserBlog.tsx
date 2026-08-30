import { SquareCheck, SquareX, Trash2 } from "lucide-react";
import Navbar from "../styles/Navbar";
import { useStyleStore } from "../styles/store";
import useUserService from "./service";
import BlogTable from "../blogs/BlogTable";
import useBlogService from "../blogs/service";
import { useBlogStore } from "../blogs/store";
import { useEffect } from "react";
import Alert from "../styles/Alert";
import { useUserStore } from "./store";
import useAuthService from "../auth/service";
import { useNavigate } from "react-router-dom";
import useViewerService from "../viewers/service";

export default function UserBlog() {
    const navigate = useNavigate();
    
    const auth = useAuthService();
    const user = useUserService();
    const blogs = useBlogService();
    const viewers = useViewerService();
    
    const message = useStyleStore((state) => state.message);
    const setMessage = useStyleStore((state) => state.setMessage);
    
    const resetChosenBlogsIds = useBlogStore((state) => state.resetChosenBlogsIds);
    
    const selectMode = useBlogStore((state) => state.selectMode);
    const setSelectMode = useBlogStore((state) => state.setSelectMode);

    const currentUserId = useUserStore((state) => state.currentUserId);
    const otherUserId = useUserStore((state) => state.otherUserId);

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

    const isProcessing = blogs.processing || user.isProcessing;
    const isOwner = otherUserId === currentUserId || otherUserId === undefined;

    return (
        <section className="flex md:flex-row flex-col h-dvh relative">
            <Navbar is_processing={isProcessing} place="your blogs" sign_out={auth.signOutMt}/>
            {message ? <Alert message={message}/> : null}
            <main className="h-full flex flex-col w-full md:w-3/4">
                <header className="">
                    {isOwner ? selectMode ? (
                        <header className="flex justify-end gap-2.5 px-2.5 pt-2.5">
                            <button
                                className="cursor-pointer disabled:cursor-not-allowed bg-blue-700 text-white font-medium text-sm p-2 w-32 rounded-md hover:bg-blue-500 transition-colors"
                                disabled={isProcessing}
                                onClick={() => blogs.deleteChosenCurrentUserBlogMt.mutate()}
                                type="button"
                            >
                                <div className="flex items-center justify-center gap-1.5">
                                    <Trash2 size={20}/>
                                    <div>Delete blogs</div>
                                </div>
                            </button>
                            <button
                                className="cursor-pointer disabled:cursor-not-allowed bg-gray-800 text-white font-medium text-sm p-2 w-40 rounded-md hover:bg-gray-600 transition-colors"
                                disabled={isProcessing}
                                onClick={() => {
                                    setSelectMode(false);
                                    resetChosenBlogsIds();
                                }}
                                type="button"
                            >
                                <div className="flex items-center justify-center gap-1.5">
                                    <SquareX size={20}/>
                                    <div>Cancel</div>
                                </div>
                            </button>
                        </header>
                    ) : (
                        <header className="flex justify-end gap-2.5 px-2.5 pt-2.5">
                            <button
                                className="cursor-pointer disabled:cursor-not-allowed bg-blue-700 text-white font-medium text-sm p-2 w-32 rounded-md hover:bg-blue-500 transition-colors"
                                disabled={isProcessing}
                                onClick={() => setSelectMode(true)}
                                type="button"
                            >
                                <div className="flex items-center justify-center gap-1.5">   
                                    <SquareCheck size={20}/>
                                    <div>Select blog</div>
                                </div>
                            </button>
                            <button
                                className="cursor-pointer disabled:cursor-not-allowed bg-gray-800 text-white font-medium text-sm p-2 w-40 rounded-md hover:bg-gray-600 transition-colors"
                                disabled={isProcessing}
                                onClick={() => blogs.deleteAllCurrentUserBlogsMt.mutate()}
                                type="button"
                            >
                                <div className="flex items-center justify-center gap-1.5">   
                                    <Trash2 size={20}/>
                                    <div>Delete all blogs</div>
                                </div>
                            </button>
                        </header>
                    ) : null}
                </header>
                <BlogTable 
                    data={blogs.getAllCurrentUserBlogs.data?.pages.flat() ?? []}
                    fetch_next_page={blogs.getAllCurrentUserBlogs.fetchNextPage}
                    has_next_page={blogs.getAllCurrentUserBlogs.hasNextPage}
                    is_fetching_next_page={blogs.getAllCurrentUserBlogs.isFetchingNextPage}
                    is_processing={blogs.processing}
                    see_one_blog_mt={viewers.seeOneBlogMt}
                />
            </main>
        </section>
    );
}