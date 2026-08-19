import { cn } from "../lib/utils";
import type { BlogTableIntrf } from "../models/blogModel";
import Loading from "./Loading";
import BlogRow from "./BlogRow";

export default function BlogTable(props: BlogTableIntrf) {
    return (
        // 1. Root container harus w-full agar tunduk pada parent (md:w-4/5)
        <div className="w-full">
            {/* 2. overflow-x-auto HANYA di sini. Ini yang memunculkan scrollbar horizontal pada tabel, bukan pada body */}
            <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-neutral-700">
                <table className="min-w-full text-left text-sm font-light">
                    <thead className="border-b bg-gray-50 font-medium dark:bg-neutral-800 dark:border-neutral-700">
                        <tr>
                            <th scope="col" className="px-6 py-4">Created At</th>
                            <th scope="col" className="px-6 py-4">Blog Title</th>
                            <th scope="col" className="px-6 py-4 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.blogs.length === 0 ? (
                            <tr>
                                {/* PERBAIKAN 1: Gunakan colSpan, bukan rowSpan. Hapus flex pada tr. */}
                                <td colSpan={3} className="px-6 py-12 text-center text-xl font-semibold text-gray-500">
                                    Blogs not found
                                </td>
                            </tr>
                        ) : (
                            props.blogs.map((blog) => (
                                // PERBAIKAN 2: Wajib tambahkan key={blog._id} untuk list rendering di React
                                <BlogRow blog={blog} is_processing={props.is_processing}/>
                            ))
                        )}
                    </tbody>
                    
                    {/* PERBAIKAN 3: Sederhanakan logika tfoot */}
                    {props.blogs.length > 0 && (
                        <tfoot>
                            <tr>
                                <td colSpan={3} className="bg-gray-50 dark:bg-neutral-800 px-6 py-4 text-center border-t dark:border-neutral-700">
                                    {props.is_fetching_next_page ? (
                                        <div className="flex justify-center">
                                            <Loading/>
                                        </div>
                                    ) : props.has_next_page ? (
                                        <button 
                                            className={cn(
                                                "rounded-full px-6 py-2 bg-blue-500 text-white hover:bg-blue-600 transition-colors", 
                                                "font-medium disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer text-sm shadow-sm"
                                            )}
                                            disabled={props.is_processing}
                                            onClick={() => props.fetch_next_page()}
                                            type="button"
                                        >
                                            Show More
                                        </button>
                                    ) : (
                                        <div className="text-sm text-gray-500 italic">
                                            You've reached the end of your blogs.
                                        </div>
                                    )}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>
            </div>
        </div>
    );
}