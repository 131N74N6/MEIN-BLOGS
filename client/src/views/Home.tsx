import Header from "../components/Header";
import BlogList from "../components/BlogList";
import useBlogService from "../services/useBlogService";
import useUserService from "../services/useUserService";

export default function Home() {
    const { getCurrentUser } = useUserService();
    const { deleteOneCurrentUserBlogMt, getAllBlogs, processing } = useBlogService();
    
    return (
        <section className="h-dvh flex flex-col">
            <Header 
                is_processing={processing}
                profile_picture={getCurrentUser.data?.profile_picture} 
                username={getCurrentUser.data?.username} 
            />
            <div className="w-full h-full">
                <BlogList
                    blogs={getAllBlogs.data ? getAllBlogs.data.pages.flat() : []}
                    fetch_next_page={getAllBlogs.fetchNextPage}
                    has_next_page={getAllBlogs.hasNextPage}
                    is_fetching_next_page={getAllBlogs.isFetchingNextPage}
                    is_processing={processing}
                    on_delete={deleteOneCurrentUserBlogMt}
                />
            </div>
        </section>
    );
}