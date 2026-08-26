import Loading from "../styles/Loading";
import { cn } from "../styles/utils";
import BlogRow from "./BlogRow";
import type { BlogTableData } from "./model";

export default function BlogTable(blogs: BlogTableData) {
    return (
        <section className="overflow-x-auto px-2.5 pt-2.5 h-full w-full">
            <table className="w-full text-sm text-gray-500 min-w-150">
                <thead className="text-base text-gray-700 bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-3">Created at</th>
                        <th className="px-6 py-3">Title</th>
                        <th className="px-6 py-3">Language</th>
                        <th className="px-6 py-3">Action</th>
                    </tr>
                </thead>
                <tbody>
                    {blogs.data.map((blog) => (
                        <BlogRow data={blog} is_processing={blogs.is_processing}/>
                    ))}
                    {blogs.data.length <= 16 ? null : (
                        <tr>
                            <td rowSpan={4} className="bg-gray-50 dark:bg-neutral-800 px-6 py-4 text-center border-t dark:border-neutral-700">
                                {blogs.is_fetching_next_page ? (
                                    <div className="flex justify-center">
                                        <Loading/>
                                    </div>
                                ) : blogs.has_next_page ? (
                                    <button 
                                        className={cn(
                                            "rounded-full px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors", 
                                            "font-medium disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer text-sm shadow-sm"
                                        )}
                                        disabled={blogs.is_processing}
                                        onClick={() => blogs.fetch_next_page()}
                                        type="button"
                                    >
                                        Show More
                                    </button>
                                ) : (
                                    <div className="text-base font-medium text-gray-500">
                                        You've reached the end of your blogs.
                                    </div>
                                )}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </section>
    );
}