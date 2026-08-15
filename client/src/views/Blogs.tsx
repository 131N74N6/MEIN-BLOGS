import BlogTableRow from "@/components/BlogTableRow";
import Navbar from "@/components/ui/navbar";
import useBlogService from "@/services/useBlogService";

export default function Blogs() {
    const blogs = useBlogService();

    return (
        <section className="md:flex-row flex flex-col h-dvh">
            <Navbar/>
            <div className="md:w-4/5 h-full flex flex-col border-l border-gray-500">
                <BlogTableRow 
                    blogs={
                        blogs.getAllCurrentUserBlogs.data ? 
                        blogs.getAllCurrentUserBlogs.data.pages.flat() : []
                    }
                    fetch_next_page={blogs.getAllCurrentUserBlogs.fetchNextPage}
                    has_next_page={blogs.getAllCurrentUserBlogs.hasNextPage}
                    is_processing={blogs.processing}
                    is_fetching_next_page={blogs.getAllCurrentUserBlogs.isFetchingNextPage}
                    on_delete={blogs.deleteOneCurrentUserBlogMt}
                />
            </div>
        </section>
    );
}