import { Send } from "lucide-react";
import useAuthService from "../auth/service";
import Navbar from "../styles/Navbar";
import useCommentSevice from "./service";
import CommentList from "./CommentList";

export default function Comments() {
    const auth = useAuthService();
    const comment = useCommentSevice();

    const isProcessing = auth.isProcessing || comment.isProcessing;

    const sendComment = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        comment.createNewCommentMt.mutate();
    }

    return (
        <section className="flex flex-col h-dvh md:flex-row z-10 relative">
            <Navbar is_processing={isProcessing} place="" sign_out={auth.signOutMt}/>
            <main className="flex flex-col h-full w-full md:w-3/4">
                <CommentList
                    data={comment.getAllCommentsInABlog.data?.pages.flat() ?? []}
                    fetchNextPage={comment.getAllCommentsInABlog.fetchNextPage}
                    hasNextPage={comment.getAllCommentsInABlog.hasNextPage}
                    isFetchingNextPage={comment.getAllCommentsInABlog.isFetchingNextPage}
                    isProcessing={isProcessing}
                />
                <form className="h-[10%] border border-gray-700 w-full flex gap-2.5" onSubmit={sendComment}>
                    <textarea className="resize-none h-full overflow-y-auto text-sm font-medium text-gray-700"/>
                    <button 
                        className="bg-purple-700 text-white text-sm font-medium cursor-pointer disabled:cursor-not-allowed w-8 h-8 rounded-full"
                        disabled={isProcessing}
                        type="submit"
                    >
                        <Send size={18}/>
                    </button>
                </form>
            </main>
        </section>
    );
}