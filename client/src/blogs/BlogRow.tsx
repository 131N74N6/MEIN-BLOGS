import { Pencil, Square, Eye, SquareCheck } from "lucide-react";
import type { BlogRowData } from "./model";
import { useNavigate } from "react-router-dom";
import { cn } from "../styles/utils";
import { useBlogStore } from "./store";

export default function BlogRow(blog: BlogRowData) {
    const navigate = useNavigate();

    const chosenBlogsIds = useBlogStore((state) => state.chosenBlogsIds);
    const hasSelected = chosenBlogsIds.includes(blog.data._id);

    const selectMode = useBlogStore((state) => state.selectMode);
    const blogIdToggle = useBlogStore((state) => state.blogIdToggle);
    
    const setBlogId = useBlogStore((state) => state.setBlogId);
    const setBlogOwnerId = useBlogStore((state) => state.setBlogOwnerId);

    const seeThisBlog = () => {
        setBlogId(blog.data._id);
        setBlogOwnerId(blog.data.blog_owner_id);
        blog.see_one_blog_mt.mutate();
        navigate(`/users/blogs/${blog.data._id}`);
    };
    
    return (
        <tr key={blog.data._id} className="hover:bg-gray-50">
            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                {new Date(blog.data.created_at).toLocaleString()}
            </td>
            <td className="px-6 py-4">{blog.data.title}</td>
            <td className="px-6 py-4">{blog.data.language}</td>
            <td className="px-6 py-4">
                <span className="flex flex-row gap-2 justify-center">
                    <button 
                        className={cn(
                            "text-blue-500 hover:text-blue-700 transition-colors inline-flex", 
                            "items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                        )}
                        disabled={blog.is_processing}
                        onClick={seeThisBlog}
                        type="button"
                    >
                        <Eye size={20}/>
                    </button>
                    {selectMode ? (
                        <button 
                            className={cn(
                                "text-blue-500 hover:text-blue-700 transition-colors inline-flex", 
                                "items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                            )}
                            disabled={blog.is_processing}
                            onClick={() => {
                                if (selectMode) blogIdToggle(blog.data._id);
                            }}
                            type="button"
                        >
                            {hasSelected ? <SquareCheck size={20}/> : <Square size={20}/>}
                        </button>
                    ) : (
                        <button 
                            className={cn(
                                "text-blue-500 hover:text-blue-700 transition-colors inline-flex", 
                                "items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                            )}
                            disabled={blog.is_processing}
                            onClick={() => navigate(`/user/blogs/edit/${blog.data._id}`)}
                            type="button"
                        >
                            <Pencil size={20}/>
                        </button>
                    )}
                </span>
            </td>
        </tr>
    );
}