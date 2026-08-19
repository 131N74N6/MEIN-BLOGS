import { Square, SquareCheck, Pencil, SquareArrowDownLeft } from "lucide-react";
import type { BlogTableRowIntrf } from "../models/blogModel";
import { useBlogStore } from "../stores/useBlogStore";
import { cn } from "../lib/utils";
import { useNavigate } from "react-router-dom";

export default function BlogRow(props: BlogTableRowIntrf) {
    const navigate = useNavigate();

    const chosenBlogsIds = useBlogStore((state) => state.chosenBlogsIds);
    const hasSelected = chosenBlogsIds.includes(props.blog._id);

    const selectMode = useBlogStore((state) => state.selectMode);
    const blogIdToggle = useBlogStore((state) => state.blogIdToggle);

    return (
        <tr 
            key={props.blog._id} 
            className={cn(
                "border-b transition duration-300 ease-in-out hover:bg-neutral-100",
                `${hasSelected ? "bg-blue-400" : "bg-zinc-300"}`
            )}
        >
            <td className="whitespace-nowrap px-6 py-4 font-medium">
                {new Date(props.blog.created_at).toLocaleString()}
            </td>
            <td className="whitespace-nowrap px-6 py-4 max-w-xs truncate" title={props.blog.title}>
                {props.blog.title}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-center">
                <button 
                    className={cn(
                        "text-blue-500 hover:text-blue-700 transition-colors inline-flex", 
                        "items-center justify-center"
                    )}
                    disabled={props.is_processing}
                    onClick={() => navigate(`/user/blogs/blog/${props.blog._id}`)}
                    title="See Blog"
                >
                    <SquareArrowDownLeft size={20}/>
                </button>
                {selectMode ? (
                    <button 
                        className={cn(
                            "text-blue-500 hover:text-blue-700 transition-colors inline-flex", 
                            "items-center justify-center"
                        )}
                        disabled={props.is_processing}
                        onClick={() => {
                            if (selectMode) blogIdToggle(props.blog._id);
                        }}
                        title="hasn't chosen"
                    >
                        {hasSelected ? <SquareCheck size={20}/> : <Square size={20}/>}
                    </button>
                ) : (
                    <button 
                        className={cn(
                            "text-blue-500 hover:text-blue-700 transition-colors inline-flex", 
                            "items-center justify-center"
                        )}
                        disabled={props.is_processing}
                        onClick={() => navigate(`/user/blogs/blog/edit/${props.blog._id}`)}
                        title="Edit Blog"
                    >
                        <Pencil size={20}/>
                    </button>
                )}
            </td>
        </tr>
    );
}