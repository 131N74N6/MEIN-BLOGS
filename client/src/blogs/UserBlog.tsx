import { SquareCheck, SquareX, Trash2 } from "lucide-react";
import Navbar from "../styles/Navbar";
import { useStyleStore } from "../styles/store";
import useUserService from "../users/service";
import BlogTable from "./BlogTable";
import useBlogService from "./service";
import { useBlogStore } from "./store";
import { useEffect } from "react";
import Alert from "../styles/Alert";
import { useUserStore } from "../users/store";
import useAuthService from "../auth/service";
import { useNavigate } from "react-router-dom";

export default function UserBlog() {
    const navigate = useNavigate();
    
    const auth = useAuthService();
    const user = useUserService();
    const blogs = useBlogService();
    
    const message = useStyleStore((state) => state.message);
    const setMessage = useStyleStore((state) => state.setMessage);
    
    const resetChosenBlogsIds = useBlogStore((state) => state.resetChosenBlogsIds);
    const selectMode = useBlogStore((state) => state.selectMode);
    const setSelectMode = useBlogStore((state) => state.setSelectMode);

    const currentUserId = useUserStore((state) => state.currentUserId);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 1800);
            return () => clearTimeout(timer);
        }
    }, [message, setMessage]);

    useEffect(() => {
        if (currentUserId === undefined) {
            navigate("/sign-in", { replace: true });
        }
    }, [currentUserId, auth.getCurrentUser.isLoading, navigate]);

    const is_processing = blogs.processing || user.isProcessing;

    return (
        <section className="flex md:flex-row flex-col h-dvh">
            <Navbar/>
            {message ? <Alert message={message}/> : null}
            <main className="h-full flex flex-col w-full md:w-4/5">
                <header className="">
                    {selectMode ? (
                        <div className="flex justify-end gap-2.5">
                            <button
                                className="disabled:cursor-not-allowed cursor-pointer text-sm p-1.5 bg-amber-700 text-white font-normal hover:bg-amber-500 transition-colors"
                                disabled={is_processing}
                                onClick={() => {
                                    setSelectMode(false);
                                    resetChosenBlogsIds();
                                }}
                                type="button"
                            >
                                <div className="flex items-center gap-1.5">
                                    <SquareX size={20}/>
                                    <div>Cancel</div>
                                </div>
                            </button>
                            <button
                                className="disabled:cursor-not-allowed cursor-pointer text-sm p-1.5 bg-red-700 text-white font-normal hover:bg-red-500 transition-colors"
                                disabled={is_processing}
                                onClick={() => blogs.deleteChosenCurrentUserBlogMt.mutate()}
                                type="button"
                            >
                                <div className="flex items-center gap-1.5">
                                    <Trash2 size={20}/>
                                    <div>Delete blogs</div>
                                </div>
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-end gap-2.5">                            
                            <button
                                className="disabled:cursor-not-allowed cursor-pointer text-sm p-1.5 bg-green-700 text-white font-normal hover:bg-green-500 transition-colors"
                                disabled={is_processing}
                                onClick={() => setSelectMode(true)}
                                type="button"
                            >
                                <div className="flex items-center gap-1.5">   
                                    <SquareCheck size={20}/>
                                    <div>Select blog</div>
                                </div>
                            </button>
                            <button
                                className="disabled:cursor-not-allowed cursor-pointer text-sm p-1.5 bg-olive-700 text-white font-normal hover:bg-olive-500 transition-colors"
                                disabled={is_processing}
                                onClick={() => blogs.deleteAllCurrentUserBlogsMt.mutate()}
                                type="button"
                            >
                                <div className="flex items-center gap-1.5">   
                                    <Trash2 size={20}/>
                                    <div>Delete all blogs</div>
                                </div>
                            </button>
                        </div>
                    )}
                </header>
                <section className="overflow-x-auto w-full">
                    <BlogTable 
                        data={
                            blogs.getAllCurrentUserBlogs.data ? 
                            blogs.getAllCurrentUserBlogs.data.pages.flat() : []
                        }
                        fetch_next_page={blogs.getAllCurrentUserBlogs.fetchNextPage}
                        has_next_page={blogs.getAllCurrentUserBlogs.hasNextPage}
                        is_fetching_next_page={blogs.getAllCurrentUserBlogs.isFetchingNextPage}
                        is_processing={blogs.processing}
                    />
                </section>
            </main>
        </section>
    );
}