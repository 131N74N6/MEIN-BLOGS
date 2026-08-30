import BlogCard from "./BlogCard";
import type { BlogGridData } from "./model";

export default function BlogGrid(blogs: BlogGridData) {
    if (blogs.data.length === 0) {
        return (
            <section className="flex justify-center items-center h-full">
                <div className="text-xl text-gray-800 font-medium">Blogs not found</div>
            </section>
        );
    }

    return (
        <section className="px-2.5 pb-2.5 overflow-y-auto h-full flex flex-col gap-2.5">
            <section className="grid gap-2.5 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
                {blogs.data.map((blog) => (
                    <BlogCard data={blog} key={`blog-card-${blog._id}`} seeOneBlogMt={blogs.seeOneBlogMt}/>
                ))}
            </section>
            {blogs.data.length <= 16 ? null : blogs.hasNextPage ? (
                <section className="flex justify-center">
                    <button
                        className="cursor-pointer disabled:cursor-not-allowed bg-olive-800 text-white font-medium text-sm p-2 w-40 rounded-md hover:bg-olive-600 transition-colors"
                        disabled={blogs.isProcessing}
                        onClick={() => blogs.fetchNextPage()}
                        type="button"
                    >
                        Show more
                    </button>
                </section>
            ) : blogs.isFetchingNextPage ? (
                <section className="flex justify-center">
                    <div className="animate-spin border-t-2 border-b-2 rounded-full w-9 h-9 border-blue-900"></div>
                </section>
            ) : (
                <section className="flex justify-center">
                    <div className="text-base text-gray-800 font-medium">You've reached the end</div>
                </section>
            )}
        </section>
    )
}