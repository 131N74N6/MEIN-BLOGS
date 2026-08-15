import type { BlogListIntrf } from "../models/blogModel";
import BlogCard from "./BlogCard";
import Loading from "./Loading";

export default function BlogList(props: BlogListIntrf) {
    if (props.blogs.length === 0) {
        return (
            <div className="h-dvh flex justify-center items-center">
                <div className="text-center text-2xl font-semibold text-gray-500">
                    Blogs not found
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col p-2.5 overflow-y-auto">
            <div className="grid lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2">
                {props.blogs.map((blog) => (
                    <BlogCard blog={blog} is_processing={props.is_processing} on_delete={props.on_delete}/>
                ))}
            </div>
            {props.blogs.length <= 16 ? null : props.has_next_page ? (
                <div className="flex justify-center">
                    <button 
                        className="bg-blue-600 text-white font-medium sm:text-sm lg:text-lg md:text-md text-xs md:p-2 p-1.5 cursor-pointer disabled:cursor-not-allowed" 
                        disabled={props.is_processing}
                        onClick={() => props.fetch_next_page()}
                        type="submit"
                    >
                        Show more
                    </button>
                </div>
            ) : props.is_fetching_next_page ? (
                <div className="flex justify-center">
                    <Loading/>
                </div>
            ) : (
                <div className="flex justify-center">
                    <div className="text-base text-center text-gray-500">
                        No more blogs to show
                    </div>
                </div>
            )}
        </div>
    );
}