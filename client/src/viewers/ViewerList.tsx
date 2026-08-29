import type { ViewerListData } from "./model";
import ViewerData from "./ViewerData";

export default function ViewerList(viewers: ViewerListData) {
    if (viewers.data.length === 0) {
        return (
            <section className="flex justify-center items-center h-full">
                <h3 className="text-xl text-gray-800 font-medium">This blog hasn't visited yet</h3>
            </section>
        );
    }

    return (
        <section className="overflow-y-auto p-2.5 flex flex-col gap-2.5">
            <div className="flex flex-col gap-2.5">
                {viewers.data.map((viewer) => <ViewerData {...viewer}/>)}
            </div>
            {viewers.data.length <= 16 ? null : viewers.has_next_page ? (
                <section className="flex justify-center">
                    <button
                        className="cursor-pointer disabled:cursor-not-allowed bg-gray-800 text-white font-medium text-sm p-2 w-40 rounded-md hover:bg-gray-600 transition-colors"
                        disabled={viewers.is_processing}
                        onClick={() => viewers.fetch_next_page()}
                        type="button"
                    >
                        Show more
                    </button>
                </section>
            ) : viewers.is_fetching_next_page ? (
                <section className="flex justify-center">
                    <div className="animate-spin border-t-2 border-b-2 rounded-full w-9 h-9 border-blue-900"></div>
                </section>
            ) : (
                <section className="flex justify-center">
                    <div className="text-base text-gray-800 font-medium">You've reached the end</div>
                </section>
            )}
        </section>
    );
}