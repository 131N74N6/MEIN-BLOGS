import { useNavigate } from "react-router-dom";
import type { BlogCardData } from "./model";
import { useBlogStore } from "./store";
import DOMPurify from "dompurify";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";

export default function BlogCard(blog: BlogCardData) {
    const navigate = useNavigate();
    const setBlogId = useBlogStore((state) => state.setBlogId);

    const sanitizedAnswer = () => {
        if (!blog.data.content) return;
        return DOMPurify.sanitize(blog.data.content, {
            ALLOWED_TAGS: [
                "p", "br", "strong", "em", "u", "ol", "ul", "li", "code", "pre", "blockquote", 
                "h1", "h2", "h3", "h4", "h5", "h6", "hr", "table", "thead", "tbody", "tr", "th", 
                "td", "del", "sub", "sup"
            ],
            ALLOWED_ATTR: ["class", "style"]
        });
    };

    const seeThisBlog = () => {
        setBlogId(blog.data._id);
        blog.seeOneBlogMt.mutate();
        navigate(`/users/blogs/${blog.data._id}`);
    };

    return (
        <div 
            className="flex flex-col gap-2.5 p-2.5 shadow-md shadow-gray-600 rounded-md" 
            key={blog.data._id} onClick={seeThisBlog}
        >
            <div className="w-full h-full">
                <img className="w-full h-full object-cover" src={blog.data.media.url}/>
            </div>
            <h3 className="text-base font-semibold text-gray-800">{blog.data.title}</h3>
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
            <p className="text-base font-medium text-gray-800 line-clamp-6">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                        p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed" { ...props }></p>,
                        ul: ({ node, ...props }) => <ul className="text-gray-700 list-disc pl-5 my-2 space-y-1" { ...props }></ul>,
                        ol: ({ node, ...props }) => <ol className="text-gray-700 list-decimal pl-5 my-2 space-y-1" { ...props }></ol>,
                        li: ({ node, ...props }) => <li className="text-gray-700" { ...props }></li>,
                        strong: ({ node, ...props }) => <strong className="text-gray-700 font-semibold" { ...props }></strong>,
                        em: ({ node, ...props }) => <em className="text-gray-700 italic" { ...props }></em>,
                        code: ({ node, inline, className, children, ...props }: any) => 
                            inline ? (
                                <code className="bg-gray-800 text-yellow-300 px-1 py-0.5 rounded text-sm" { ...props }>
                                    {children}
                                </code>
                            ) : (
                                <pre className="bg-gray-900 text-violet-500 rounded p-3 overflow-x-auto my-3">
                                    <code className={className} {...props}>{children}</code>
                                </pre>
                            ),
                        blockquote: ({ node, ...props }) => <blockquote className="bg-gray-400 text-black border-l-4 border-gray-800 italic my-3" { ...props }></blockquote>,
                        h1: ({ node, ...props }) => <h1 className="text-xl font-bold text-gray-700 mt-4 mb-2" { ...props }></h1>,
                        h2: ({ node, ...props }) => <h2 className="text-lg font-semibold text-gray-700 mt-3 mb-2" { ...props }></h2>,
                        h3: ({ node, ...props }) => <h3 className="text-base font-medium text-gray-700 mt-2 mb-1" { ...props }></h3>
                    }}
                >
                    {sanitizedAnswer()}
                </ReactMarkdown>
            </p>
            <p className="text-small font-normal text-gray-800">Published at {new Date(blog.data.created_at).toLocaleString()}</p>
            <p className="text-base font-normal text-gray-800">Language {blog.data.language}</p>
        </div>
    );
}