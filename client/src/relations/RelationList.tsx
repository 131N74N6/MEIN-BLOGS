import type { RelationListData } from "./model";
import RelationData from "./RelationData";

export default function RelationList(relations: RelationListData) {
    if (relations.data.length === 0) {
        return (
            <section className="flex justify-center items-center h-full">
                <h3 className="text-xl text-center text-gray-800 font-medium">
                    No followers found
                </h3>
            </section>
        );
    }

    return (
        <section className="flex flex-col overflow-y-auto px-2.5 pb-2.5 gap-2.5">
            <section className="flex flex-col gap-2.5">
                {relations.data.map((relation) => (<RelationData {...relation}/>))}
            </section>
            {relations.data.length <= 16 ? null : relations.hasNextPage ? (
                <section className="flex justify-center">
                    <button
                        className="cursor-pointer disabled:cursor-not-allowed bg-gray-800 text-white font-medium text-sm p-2 w-40 rounded-md hover:bg-gray-600 transition-colors"
                        disabled={relations.isProcessing}
                        onClick={() => relations.fetchNextPage()}
                        type="button"
                    >
                        Show more
                    </button>
                </section>
            ) : relations.isFetchingNextPage ? (
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