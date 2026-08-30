import ReactMarkdown from "react-markdown";
import useAuthService from "../auth/service";
import Navbar from "../styles/Navbar";
import useBlogService from "./service";
import DOMPurify from "dompurify";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import Loading from "../styles/Loading";
import { useNavigate } from "react-router-dom";
import { Eye } from "lucide-react";
import useViewerService from "../viewers/service";
import { useUserStore } from "../users/store";

export default function BlogDetail() {
    const navigate = useNavigate();
    const auth = useAuthService();
    const blog = useBlogService();
    const viewer = useViewerService();

    const currentUserId = useUserStore((state) => state.currentUserId);
    const setOtherUserId = useUserStore((state) => state.setOtherUserId);

    const isProcessing = auth.isProcessing || blog.processing || blog.getOneBlogContent.isLoading;
    const isOwner = blog.getOneBlogContent.data && blog.getOneBlogContent.data.blog_owner_id === currentUserId;

    const sanitizedAnswer = () => {
        if (!blog.getOneBlogContent.data?.content) return;
        return DOMPurify.sanitize(blog.getOneBlogContent.data?.content, {
            ALLOWED_TAGS: [
                "p", "br", "strong", "em", "u", "ol", "ul", "li", "code", "pre", "blockquote", 
                "h1", "h2", "h3", "h4", "h5", "h6", "hr", "table", "thead", "tbody", "tr", "th", 
                "td", "del", "sub", "sup"
            ],
            ALLOWED_ATTR: ["class", "style"]
        });
    };

    const visitUser = () => {
        if (isOwner) {
            navigate("/users");
        } else {
            setOtherUserId(blog.getOneBlogContent.data?.blog_owner_id);
            navigate(`/users/others/${blog.getOneBlogContent.data?.blog_owner_id}`);
        }
    };

    return (
        <section className="h-dvh flex flex-col md:flex-row z-10 relative">
            <Navbar is_processing={isProcessing} place="" sign_out={auth.signOutMt}/>
            {blog.getOneBlogContent.error ? (
                <section className="flex justify-center h-full items-center w-full md:w-3/4">
                    <h3 className="text-center font-medium text-lg text-gray-600">
                        {blog.getOneBlogContent.error.message}
                    </h3>
                </section>
            ) : blog.getOneBlogContent.isLoading ? (
                <section className="flex justify-center h-full items-center w-full md:w-3/4">
                    <Loading/>
                </section>
            ) : (
                <main className="flex flex-col w-full md:w-3/4 h-full overflow-y-auto gap-2.5 p-2.5">
                    <h2 className="text-center font-bold text-4xl text-gray-600">{blog.getOneBlogContent.data?.title}</h2>
                    <div className="flex flex-row justify-center items-center gap-2.5">
                        <p>{new Date(blog.getOneBlogContent.data?.created_at!).toLocaleString()}</p>
                        <p>|</p>
                        <button
                            className="cursor-pointer flex flex-row gap-2.5 items-center disabled:cursor-not-allowed"
                            disabled={isProcessing}
                            onClick={visitUser}
                        >
                            <div className="text-gray-800 font-normal text-base">{blog.getOneBlogContent.data?.blog_owner_name}</div>
                            {blog.getOneBlogContent.data?.blog_owner_profile_picture ? (
                                <div className="w-8 h-8 rounded-full">
                                    <img className="w-full h-full object-cover" src={blog.getOneBlogContent.data?.blog_owner_profile_picture}/>
                                </div>
                            ) : (
                                <div className="bg-gray-900 flex justify-center items-center w-8 h-8 rounded-full">
                                    <div className="text-white font-medium text-sm">{blog.getOneBlogContent.data?.blog_owner_name[0]}</div>
                                </div>
                            )}
                        </button>
                        <p>|</p>
                        <button 
                            className="flex items-center gap-2.5 cursor-pointer disabled:cursor-not-allowed"
                            disabled={isProcessing}
                            onClick={() => navigate(`/users/blogs/contains/${blog.getOneBlogContent.data?._id}/viewers`)}
                            type="button"
                        >
                            <Eye size={22}/>
                            <p>{viewer.getAllBlogViewersTotal.data ?? 0}</p>
                        </button>
                    </div>
                    <section className="flex justify-center">
                        <div className="w-[50%] min-w-78.75 flex h-full">
                            <img 
                                className="object-cover h-full w-full"
                                src={blog.getOneBlogContent.data?.media.url} 
                                alt={blog.getOneBlogContent.data?.media.filename}
                            />
                        </div>
                    </section>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        rehypePlugins={[rehypeRaw]}
                        components={{
                            p: ({ node, ...props }) => <p className="text-gray-700 leading-relaxed" { ...props }></p>,
                            ul: ({ node, ...props }) => <ul className="text-gray-700 list-disc pl-9 my-2 space-y-1" { ...props }></ul>,
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
                    <button
                        className="cursor-pointer disabled:cursor-not-allowed bg-gray-800 text-white font-medium text-sm p-2 w-40 rounded-md hover:bg-gray-600 transition-colors"
                        disabled={isProcessing}
                        onClick={() => navigate(`/users/blogs/contains/${blog.getOneBlogContent.data?._id}/comments/`)}
                        type="button"
                    >
                        Send Comments
                    </button>
                </main>
            )}
        </section>
    );
}