import useAuthService from "../auth/service";
import Loading from "../styles/Loading";
import Navbar from "../styles/Navbar";
import useViewerService from "./service";
import ViewerList from "./ViewerList";

export default function Viewers() {
    const auth = useAuthService();
    const viewer = useViewerService();
    
    const isProcessing = auth.isProcessing;

    return (
        <section className="h-dvh flex flex-col md:flex-row relative z-10">
            <Navbar place="" is_processing={isProcessing} sign_out={auth.signOutMt}/>
            {viewer.getAllBlogViewers.isLoading ? (
                <section className="flex justify-center items-center h-full w-full md:w-3/4">
                    <Loading/>
                </section>
            ) : viewer.getAllBlogViewers.error ? (
                <section className="flex justify-center items-center h-full w-full md:w-3/4">
                    <h3 className="text-center font-medium text-lg text-gray-600">
                        {viewer.getAllBlogViewers.error.message}
                    </h3>
                </section>
            ) : (
                <main className="w-full h-full md:w-3/4 flex flex-col">
                    <ViewerList
                        data={viewer.getAllBlogViewers.data?.pages.flat() ?? []}
                        fetch_next_page={viewer.getAllBlogViewers.fetchNextPage}
                        has_next_page={viewer.getAllBlogViewers.hasNextPage}
                        is_fetching_next_page={viewer.getAllBlogViewers.isFetchingNextPage}
                        is_processing={isProcessing}
                    />
                </main>
            )}
        </section>
    );
}