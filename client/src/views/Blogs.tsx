import { SquareCheck, SquareX, Trash2 } from "lucide-react";
import BlogTable from "../components/BlogTable";
import Navbar from "../components/Navbar";
import useBlogService from "../services/useBlogService";
import useUserService from "../services/useUserService";
import { useBlogStore } from "../stores/useBlogStore";
import { useMessageStore } from "../stores/useMessageStore";
import { useEffect } from "react";
import Alert from "../components/Alert";

export default function Blogs() {
    const user = useUserService();
    const blog = useBlogService();

    const message = useMessageStore((state) => state.message);
    const setMessage = useMessageStore((state) => state.setMessage);
    
    const resetChosenBlogsIds = useBlogStore((state) => state.resetChosenBlogsIds);
    const selectMode = useBlogStore((state) => state.selectMode);
    const setSelectMode = useBlogStore((state) => state.setSelectMode);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 1800);
            return () => clearTimeout(timer);
        }
    }, [message, setMessage]);

    const is_processing = blog.processing || user.userProcessing;

    return (
        <section className="md:flex-row relative z-10 flex flex-col h-dvh">
            <Navbar sign_out={user.signOutMt} is_processing={is_processing} place="your blogs"/>
            {message ? <Alert message={message}/> : null}
            <div className="md:w-4/5 h-full gap-2.5 w-full flex flex-col bg-zinc-100">
                <header className="px-2.5 pt-2.5 bg-white">
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
                                onClick={() => blog.deleteChosenCurrentUserBlogMt.mutate()}
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
                                onClick={() => blog.deleteAllCurrentUserBlogsMt.mutate()}
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
                <div className="h-full overflow-y-auto p-2.5">
                    <BlogTable 
                        blogs={
                            blog.getAllCurrentUserBlogs.data ? 
                            blog.getAllCurrentUserBlogs.data.pages.flat() : []
                        }
                        fetch_next_page={blog.getAllCurrentUserBlogs.fetchNextPage}
                        has_next_page={blog.getAllCurrentUserBlogs.hasNextPage}
                        is_processing={blog.processing}
                        is_fetching_next_page={blog.getAllCurrentUserBlogs.isFetchingNextPage}
                    />
                </div>
            </div>
        </section>
    );
}