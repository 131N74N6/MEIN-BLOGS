import { useNavigate } from "react-router-dom";
import type { BlogCardData } from "./model";
import { useBlogStore } from "./store";

export default function BlogCard(blog: BlogCardData) {
    const navigate = useNavigate();
    const setBlogId = useBlogStore((state) => state.setBlogId);

    const seeThisBlog = () => {
        setBlogId(blog.data._id);
        blog.seeOneBlogMt.mutate();
        navigate(`/users/blogs/${blog.data._id}`);
    }

    return (
        <div 
            className="flex flex-col gap-2.5 p-2.5 shadow-md shadow-gray-600 rounded-md" 
            key={blog.data._id} onClick={seeThisBlog}
        >
            <div className="w-full h-full">
                <img className="w-full h-full object-cover" src={blog.data.media.url}/>
            </div>
            <h3 className="text-base font-semibold text-gray-800 line-clamp-2">{blog.data.title}</h3>
            <div className="flex gap-2.5 items-center">
                <div className="text-gray-800 font-normal text-xs">{blog.data.blog_owner_name}</div>
                {blog.data.blog_owner_profile_picture ? (
                    <div className="w-8 h-8 rounded-full">
                        <img className="w-full h-full object-cover" src={blog.data.blog_owner_profile_picture}/>
                    </div>
                ) : (
                    <div className="bg-gray-900 flex justify-center items-center w-8 h-8 rounded-full">
                        <div className="text-white font-medium text-sm">{blog.data.blog_owner_name[0]}</div>
                    </div>
                )}
            </div>
            <p className="text-base font-medium text-gray-800 line-clamp-6">{blog.data.content}</p>
            <p className="text-small font-normal text-gray-800">Published at {new Date(blog.data.created_at).toLocaleString()}</p>
            <p className="text-base font-normal text-gray-800">Language {blog.data.language}</p>
        </div>
    );
}