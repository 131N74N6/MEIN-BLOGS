import BlogTable from "../components/BlogTable";
import useBlogService from "../services/useBlogService";

export default function Blogs() {
    const { deleteOneCurrentUserBlogMt, getAllCurrentUserBlogs, processing } = useBlogService();

    return (
        <section className="md:flex-row flex flex-col h-dvh">
            <div className="md:w-4/5 h-full flex flex-col border-l border-gray-500">
                <BlogTable 
                    blogs={
                        getAllCurrentUserBlogs.data ? 
                        getAllCurrentUserBlogs.data.pages.flat() : []
                    }
                    fetch_next_page={getAllCurrentUserBlogs.fetchNextPage}
                    has_next_page={getAllCurrentUserBlogs.hasNextPage}
                    is_processing={processing}
                    is_fetching_next_page={getAllCurrentUserBlogs.isFetchingNextPage}
                    on_delete={deleteOneCurrentUserBlogMt}
                />
            </div>
        </section>
    );
}