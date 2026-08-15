import { useNavigate } from "react-router-dom";
import type { BlogCardIntrf } from "../models/blogModel";

export default function BlogCard(props: BlogCardIntrf) {
    const navigate = useNavigate();

    return (
        <div className="border border-gray-500 p-2 rounded-md shadow flex flex-col gap-2"  onClick={() => navigate("/user")}>
            <div className="w-8 h-8 rounded-full">
                <div className="w-full h-full">
                    <img 
                        className="w-full h-full object-cover rounded-full" 
                        src={props.blog.media.url} 
                        alt={props.blog.media.public_id}
                    />
                </div>
            </div>
            <div className="text-sm font-light">{new Date(props.blog.created_at).toLocaleString()}</div>
            <div className="text-base font-semibold">{props.blog.title}</div>
            <div className="text-sm font-light">{props.blog.blog_owner_name}</div>
            <div className="text-base font-light line-clamp-5">{props.blog.content}</div>
            <div className="text-sm font-light">{props.blog.language}</div>
        </div>
    );
}