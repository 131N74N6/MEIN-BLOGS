import type { BlogTableRowIntrf } from "../models/blogModel";
import { Eraser, Pencil } from "lucide-react";

export default function BlogTableRow(props: BlogTableRowIntrf) {
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
                            <tfoot></tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}