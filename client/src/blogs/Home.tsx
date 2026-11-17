import Navbar from "../styles/Navbar";
import BlogGrid from "./BlogGrid";
import useBlogService from "./service";
import useViewerService from "../viewers/service";
import { useBlogStore } from "./store";
import Loading from "../styles/Loading";

export default function Home() {
    const blog = useBlogService();
    const viewer = useViewerService();
    
    const searched = useBlogStore((state) => state.searched);
    const setSearched = useBlogStore((state) => state.setSearched);

    const isProcessing = blog.processing || viewer.isProcessing;

    return (
        <section className="flex md:flex-row flex-col relative z-10 h-dvh">
            <Navbar place="home" is_processing={blog.processing}/>
            <main className="h-full overflow-y-auto md:w-3/4 w-full flex flex-col gap-2.5">
                <header className="px-2.5 pt-2.5">
                    <input
                        className="outline-0 border w-full p-1.5 rounded-md border-zinc-700 text-zinc-700 text-base"
                        id="search blog title"
                        placeholder="find blog title here"
                        onChange={(event) => setSearched(event.target.value)}
                        type="text"
                        value={searched}
                    />
                </header>
                {blog.getAllBlogs.error ? (
                    <section className="flex justify-center items-center h-full w-full md:w-3/4">
                        <h3 className="text-center font-medium text-lg text-gray-600">
                            {blog.getAllBlogs.error.message}
                        </h3>
                    </section>
                ) : blog.getAllBlogs.isLoading ? (
                    <section className="flex justify-center items-center h-full w-full md:w-3/4">
                        <Loading/>
                    </section>
                ) : (
                    <BlogGrid 
                        data={blog.getAllBlogs.data?.pages.flat() ?? []}
                        fetchNextPage={blog.getAllBlogs.fetchNextPage}
                        hasNextPage={blog.getAllBlogs.hasNextPage}
                        isFetchingNextPage={blog.getAllBlogs.isFetchingNextPage}
                        isProcessing={isProcessing}
                        seeOneBlogMt={viewer.seeOneBlogMt}
                    />
                )}
            </main>
        </section>
    );
}