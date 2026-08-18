import BlogTable from "../components/BlogTable";
import Navbar from "../components/Navbar";
import useBlogService from "../services/useBlogService";
import useUserService from "../services/useUserService";

export default function Blogs() {
    const user = useUserService();
    const blog = useBlogService();
    
    const is_processing = blog.processing || user.userProcessing;
    return (
        <section className="md:flex-row flex flex-col h-dvh">
            <Navbar sign_out={user.signOutMt} is_processing={is_processing} place="your blogs"/>
            <div className="md:w-4/5 h-full w-full flex flex-col border-l border-gray-500 p-2.5">
                <BlogTable 
                    blogs={
                        blog.getAllCurrentUserBlogs.data ? 
                        blog.getAllCurrentUserBlogs.data.pages.flat() : []
                    }
                    fetch_next_page={blog.getAllCurrentUserBlogs.fetchNextPage}
                    has_next_page={blog.getAllCurrentUserBlogs.hasNextPage}
                    is_processing={blog.processing}
                    is_fetching_next_page={blog.getAllCurrentUserBlogs.isFetchingNextPage}
                    on_delete={blog.deleteOneCurrentUserBlogMt}
                />
            </div>
        </section>
    );
}