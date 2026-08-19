import { useEditor, EditorContent } from '@tiptap/react'
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Navbar from '../components/Navbar';
import useBlogService from '../services/useBlogService';
import useUserService from '../services/useUserService';
import { PlusSquare, Star } from 'lucide-react';
import { useBlogStore } from '../stores/useBlogStore';
import EditorMenuBar from '../components/EditorMenuBar';

export default function MakeBlog() {
    const user = useUserService();
    const blog = useBlogService();

    const media = useBlogStore((state) => state.media);
    const setMedia = useBlogStore((state) => state.setMedia);

    const mediaUrl = useBlogStore((state) => state.mediaUrl);
    const setMediaUrl = useBlogStore((state) => state.setMediaUrl);

    const title = useBlogStore((state) => state.title);
    const setTitle = useBlogStore((state) => state.setTitle);

    const content = useBlogStore((state) => state.content);
    const setContent = useBlogStore((state) => state.setContent);

    const language = useBlogStore((state) => state.language);
    const setLanguage = useBlogStore((state) => state.setLanguage);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2],
                },
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph'],
            }),
            Highlight,
        ],
        content: title,
    });

    return (
        <section className="h-dvh flex md:flex-row flex-col bg-gray-200">
            <Navbar is_processing={blog.processing} place="create blog" sign_out={user.signOutMt}/>
            <div className="h-full w-full md:w-4/5 flex flex-col p-2.5 border bg-white border-gray-50 ">
                <form 
                    className="flex flex-col gap-2.5"
                    onSubmit={(event: React.SubmitEvent<HTMLFormElement>) => {
                        event.preventDefault();
                        blog.createNewBlogMt.mutate();
                    }}
                >
                    <div>
                        <EditorMenuBar editor={editor}/>
                        <EditorContent editor={editor} />
                        <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
                        <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
                    </div>
                    <div className="flex gap-2.5 justify-end">
                        <button
                            className="disabled:cursor-not-allowed cursor-pointer text-sm p-1.5 bg-blue-700 text-white font-normal hover:bg-blue-500 transition-colors"
                            disabled={blog.processing}
                            onClick={() => blog.generateNewBlogMt.mutate()}
                            type="button"
                        >
                            <div className="flex gap-1.5">
                                <Star size={20}/>
                                <div>Start generate</div>
                            </div>
                        </button>
                        <button
                            className="disabled:cursor-not-allowed cursor-pointer text-sm p-1.5 bg-gray-900 text-white font-normal hover:bg-gray-700 transition-colors"
                            disabled={blog.processing}
                            type="submit"
                        >
                            <div className="flex gap-1.5">
                                <PlusSquare size={20}/>
                                <div>Post blog</div>
                            </div>
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}