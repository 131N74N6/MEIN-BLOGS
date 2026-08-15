import { useEditor, EditorContent } from '@tiptap/react'
import { FloatingMenu, BubbleMenu } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'

export default function MakeBlog() {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2],
                },
            })
        ],
        content: '<p>Hello World!</p>',
    })

    return (
        <section className="h-dvh flex md:flex-row flex-col">
            <div className="h-full w-full md:4/5 flex flex-col">
                <EditorContent editor={editor} />
                <FloatingMenu editor={editor}>This is the floating menu</FloatingMenu>
                <BubbleMenu editor={editor}>This is the bubble menu</BubbleMenu>
            </div>
        </section>
    );
}