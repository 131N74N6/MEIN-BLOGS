import CommentData from "./CommentData";
import type { CommentListDetail } from "./model";

export default function CommentList(comments: CommentListDetail) {
    if (comments.data.length === 0) {
        return (
            <section className="flex justify-center items-center h-full">
                <h3 className="text-xl text-center text-gray-800 font-medium">
                    No comment found in this blog
                </h3>
            </section>
        );
    }

    return (
        <section className="h-[80dvh] w-full flex px-2.5 pt-2.5 gap-2.5 flex-col overflow-y-auto">
            <div className="flex flex-col gap-2.5">
                {comments.data.map((comment) => (<CommentData {...comment}/>))}
            </div>
            {comments.data.length <= 16 ? null : comments.hasNextPage ? (
                <section className="flex justify-center">
                    <button
                        className="cursor-pointer disabled:cursor-not-allowed bg-gray-800 text-white font-medium text-sm p-2 w-40 rounded-md hover:bg-gray-600 transition-colors"
                        disabled={comments.isProcessing}
                        onClick={() => comments.fetchNextPage()}
                        type="button"
                    >
                        Show more
                    </button>
                </section>
            ) : comments.isFetchingNextPage ? (
                <section className="flex justify-center">
                    <div className="animate-spin border-t-2 border-b-2 rounded-full w-9 h-9 border-blue-900"></div>
                </section>
            ) : (
                <section className="flex justify-center">
                    <div className="text-base text-gray-800 font-medium">You've reached the end</div>
                </section>
            )}
        </section>
    )
}