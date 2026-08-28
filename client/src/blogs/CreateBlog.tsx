import { useEffect, useRef } from "react";
import useAuthService from "../auth/service";
import Navbar from "../styles/Navbar";
import useBlogService from "./service";
import Quill from "quill";
import { useBlogStore } from "./store";
import { Image, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "../users/store";
import { useStyleStore } from "../styles/store";
import Alert from "../styles/Alert";

export default function CreateBlog() {
    const auth = useAuthService();
    const blog = useBlogService();
    const navigate = useNavigate();
    
    const content = useBlogStore((state) => state.content);
    const setContent = useBlogStore((state) => state.setContent);

    const language = useBlogStore((state) => state.language);
    const setLanguage = useBlogStore((state) => state.setLanguage);
    
    const setMedia = useBlogStore((state) => state.setMedia);
    
    const mediaUrl = useBlogStore((state) => state.mediaUrl);
    const setMediaUrl = useBlogStore((state) => state.setMediaUrl);

    const title = useBlogStore((state) => state.title);
    const setTitle = useBlogStore((state) => state.setTitle);

    const message = useStyleStore((state) => state.message);
    const setMessage = useStyleStore((state) => state.setMessage);
    
    const currentUserId = useUserStore((state) => state.currentUserId);

    const editorTextRef = useRef(null);
    const quillRef = useRef<Quill | null>(null);

    useEffect(() => {
        if (!auth.getCurrentUser.isPending && !currentUserId && !auth.getCurrentUser.data?.user_id) {
            navigate("/sign-in", { replace: true });
        }
    }, [currentUserId, auth.getCurrentUser.isPending, auth.getCurrentUser.data, navigate]);

    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 1800);
            return () => clearTimeout(timer);
        }
    }, [message, setMessage]);

    useEffect(() => {
        if (!quillRef.current && editorTextRef.current) {
            quillRef.current = new Quill(editorTextRef.current, { theme: "snow" });

            quillRef.current.on("text-change", () => {
                if (quillRef.current) {
                    setContent(quillRef.current.root.innerHTML);
                }
            });
        }
    }, [setContent]);

    useEffect(() => {
        if (quillRef.current && content !== quillRef.current.root.innerHTML) {
            quillRef.current.root.innerHTML = content || "";
        }
    }, [content]);

    const isProcessing = blog.processing || auth.isProcessing;

    const publishBlog = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        blog.createNewBlogMt.mutate();
    }

    return (
        <section className="flex md:flex-row flex-col h-dvh relative z-10">
            <Navbar place="create blog" sign_out={auth.signOutMt} is_processing={blog.processing}/>
            {message ? <Alert message={message}/> : null}
            <form className="h-full md:w-3/4 w-full flex flex-col overflow-y-auto" onSubmit={publishBlog}>
                <section className="flex flex-col overflow-y-auto h-[90%] px-2.5 pt-2.5 gap-2.5">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-base font-semibold text-gray-600" htmlFor="media">Thumbnail</label>
                        <input className="hidden" id="media" name="media" onChange={blog.blogMediaPrefiew} ref={blog.blogMediaRef} type="file"/>
                        <div className="border cursor-pointer border-dashed border-gray-500 p-2 h-[50dvh]" onClick={() => blog.blogMediaRef.current?.click()}>
                            {mediaUrl ? (
                                <div className="relative group w-full h-full">
                                    <img className="object-cover w-full h-full" src={mediaUrl} alt="thumbnail"/>
                                    <button
                                        className="group-hover:opacity-100 opacity-0 bg-amber-600 text-white flex justify-center items-center cursor-pointer p-1.5 rounded-full w-8 h-8 absolute top-2 left-2"
                                        disabled={isProcessing}
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            setMedia(null);
                                            setMediaUrl(null);
                                            URL.revokeObjectURL(mediaUrl);
                                        }}
                                        type="button"
                                    >
                                        <X size={18}/>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex justify-center items-center h-full">
                                    <div className="font-semibold md:text-xl text:base">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-center"><Image size={32}/></div>
                                            <div className="text-center">Click here to select the thumbnail</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-base font-semibold text-gray-600" htmlFor="title">Title</label>
                        <input
                            className="border border-zinc-500 p-1.5 text-sm font-medium text-zinc-500 outline-0 rounded-md"
                            id="title"
                            name="title"
                            onChange={(event) => setTitle(event.target.value)}
                            value={title}
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-base font-semibold text-gray-600" htmlFor="language">Language</label>
                        <select 
                            className="border border-zinc-500 p-1.5 text-sm font-medium outline-0 rounded-e-md" 
                            id="language"
                            onChange={(event) => setLanguage(event.target.value)}
                            value={language}
                        >
                            <option value="" disabled>-- Select language --</option>
                            <option value="indonesia">Indonesia</option>
                            <option value="inggris">English</option>
                            <option value="jepang">Japanese</option>
                            <option value="jerman">Germany</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-base font-semibold text-gray-600">Content</label>
                        <div className="h-[50dvh] flex flex-col">
                            {isProcessing ? (
                                <div className="flex justify-center items-center h-full">
                                    <div className="text-base text-center font-medium text-gray-700">Please wait</div>
                                </div>
                            ) : (
                                <div ref={editorTextRef} className="h-full overflow-y-auto border-x border-b border-gray-400 rounded-b-md"/>
                            )}
                        </div>
                    </div>
                </section>
                <section className="flex h-[10%] justify-end p-2.5 gap-2.5">
                    <button
                        className="cursor-pointer disabled:cursor-not-allowed bg-blue-700 text-white font-medium text-sm p-2 w-22 rounded-md hover:bg-blue-500 transition-colors"
                        disabled={isProcessing}
                        type="submit"
                    >
                        Publish
                    </button>
                    <button
                        className="cursor-pointer disabled:cursor-not-allowed bg-gray-800 text-white font-medium text-sm p-2 w-40 rounded-md hover:bg-gray-600 transition-colors"
                        disabled={isProcessing}
                        onClick={() => blog.generateNewBlogMt.mutate()}
                        type="button"
                    >
                        Generate with AI
                    </button>
                </section>
            </form>
        </section>
    );
}