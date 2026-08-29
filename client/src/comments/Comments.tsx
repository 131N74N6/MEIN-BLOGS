import { ArrowUp } from "lucide-react";
import useAuthService from "../auth/service";
import Navbar from "../styles/Navbar";
import useCommentSevice from "./service";
import CommentList from "./CommentList";
import { useCommentStore } from "./store";
import Loading from "../styles/Loading";

export default function Comments() {
    const auth = useAuthService();
    const comment = useCommentSevice();

    const text = useCommentStore((state) => state.text);
    const setText = useCommentStore((state) => state.setText);

    const isProcessing = auth.isProcessing || comment.isProcessing;

    const sendComment = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        comment.createNewCommentMt.mutate();
    }

    return (
        <section className="flex flex-col h-dvh md:flex-row z-10 relative">
            <Navbar is_processing={isProcessing} place="" sign_out={auth.signOutMt}/>
            {comment.getAllCommentsInABlog.isLoading ? (
                <section className="flex justify-center items-center h-full w-full md:w-3/4">
                    <Loading/>
                </section>
            ) : comment.getAllCommentsInABlog.error ? (
                <section className="flex justify-center items-center h-full w-full md:w-3/4">
                    <h3 className="text-center font-medium text-lg text-gray-600">
                        {comment.getAllCommentsInABlog.error.message}
                    </h3>
                </section>
            ) : (
                <main className="flex flex-col h-full w-full md:w-3/4 p-2.5 overflow-y-auto">
                    <CommentList
                        data={comment.getAllCommentsInABlog.data?.pages.flat() ?? []}
                        fetchNextPage={comment.getAllCommentsInABlog.fetchNextPage}
                        hasNextPage={comment.getAllCommentsInABlog.hasNextPage}
                        isFetchingNextPage={comment.getAllCommentsInABlog.isFetchingNextPage}
                        isProcessing={isProcessing}
                    />
                    <form className="h-[20dvh]  bg-zinc-100 p-2.5 items-center rounded-md w-full flex gap-2.5" onSubmit={sendComment}>
                        <textarea 
                            className="resize-none outline-0 w-full h-full overflow-y-auto text-sm font-medium text-gray-700"
                            onChange={(event) => setText(event.target.value)}
                            value={text}
                        />
                        <button 
                            className="bg-purple-700 hover:bg-purple-500 transition-colors flex justify-center items-center text-white text-sm font-medium cursor-pointer disabled:cursor-not-allowed w-8 h-8 rounded-full"
                            disabled={isProcessing}
                            type="submit"
                        >
                            <ArrowUp size={18}/>
                        </button>
                    </form>
                </main>
            )}
        </section>
    );
}