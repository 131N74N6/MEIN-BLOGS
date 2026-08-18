import { useEditor, EditorContent } from '@tiptap/react'
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Navbar from '../components/Navbar';
import useBlogService from '../services/useBlogService';
import useUserService from '../services/useUserService';

export default function MakeBlog() {
    const user = useUserService();
    const blog = useBlogService();

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2],
                },
            })
        ],
        content: '<p>Hello World!</p>',
    });

    return (
        <section className="h-dvh flex md:flex-row flex-col">
            <Navbar is_processing={blog.processing} place="create blog" sign_out={user.signOutMt}/>
            <div className="h-full w-full md:w-4/5 flex flex-col">
                <EditorContent editor={editor} />
                <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
                <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
            </div>
        </section>
    );
}