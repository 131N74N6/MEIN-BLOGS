import { cn } from "../lib/utils";
import type { BlogTableRowIntrf } from "../models/blogModel";
import { Eraser, Pencil } from "lucide-react";
import Loading from "./Loading";

export default function BlogTable(props: BlogTableRowIntrf) {
    return (
        <div className="flex flex-col">
            <div className="overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 sm:px-6 lg:px-8">
                    <div className="overflow-hidden">
                        <table className="min-w-full text-left text-sm font-light">
                            <thead className="border-b font-medium dark:border-neutral-500">
                                <tr>
                                    <th scope="col" className="px-6 py-4">Created At</th>
                                    <th scope="col" className="px-6 py-4">Blog Title</th>
                                    <th scope="col" className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {props.blogs.map((blog) => (
                                    <tr className="border-b transition duration-300 ease-in-out hover:bg-neutral-100 dark:border-neutral-500 dark:hover:bg-neutral-600">
                                        <td className="whitespace-nowrap px-6 py-4 font-medium">{new Date(blog.created_at).toLocaleString()}</td>
                                        <td className="whitespace-nowrap px-6 py-4">{blog.title}</td>
                                        <td className="whitespace-nowrap px-6 py-4">
                                            <button className="">
                                                <Eraser size={22}/>
                                            </button>
                                            <button className="">
                                                <Pencil size={22}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            {props.blogs.length <= 16 ? null : props.has_next_page ? (
                                <tfoot className="bg-zinc-400">
                                    <tr className="flex justify-center">
                                        <td rowSpan={3} className="py-2">
                                            <button 
                                                className={cn(
                                                    "rounded-2xl p-1.5 bg-blue-500 text-white hover:bg-blue-600 transition-colors", 
                                                    "w-24 font-medium disabled:cursor-not-allowed cursor-pointer text-base"
                                                )}
                                                disabled={props.is_processing}
                                                onClick={() => props.fetch_next_page()}
                                                type="button"
                                            >
                                                Show More
                                            </button>
                                        </td>
                                    </tr>
                                </tfoot>
                            ) : props.is_fetching_next_page ? (
                                <tfoot className="bg-zinc-400">
                                    <tr className="flex justify-center">
                                        <td rowSpan={3} className="py-2">
                                            <Loading/>
                                        </td>
                                    </tr>
                                </tfoot>
                            ) : (
                                <tfoot className="bg-zinc-400">
                                    <tr className="flex justify-center">
                                        <td rowSpan={3} className="py-2">
                                            <div className="text-base text-center text-red-400">
                                                No more blogs to show
                                            </div>
                                        </td>
                                    </tr>
                                </tfoot>
                            )}
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}