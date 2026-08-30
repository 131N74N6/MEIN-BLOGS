import useAuthService from "../auth/service";
import Loading from "../styles/Loading";
import Navbar from "../styles/Navbar";
import RelationList from "./RelationList";
import useRelationService from "./service";

export default function Followers() {
    const auth = useAuthService();
    const relation = useRelationService();

    const isProcessing = auth.isProcessing || relation.isProcessing;

    return (
        <section className="h-dvh flex md:flex-row flex-col relative z-10">
            <Navbar is_processing={isProcessing} place="" sign_out={auth.signOutMt}/>
            {relation.getAllFollowers.isLoading ? (
                <section className="flex justify-center items-center h-full w-full md:w-3/4">
                    <Loading/>
                </section>
            ) : relation.getAllFollowers.error ? (
                <section className="flex justify-center items-center h-full w-full md:w-3/4">
                    <h3 className="text-center font-medium text-lg text-gray-600">
                        {relation.getAllFollowers.error.message}
                    </h3>
                </section>
            ) : (
                <main className="flex flex-col h-full overflow-y-auto w-full md:w-3/4">
                    <header className="px-2.5 pt-2.5">
                        <input
                            className="outline-0 border w-full p-1.5 rounded-md border-zinc-700 text-zinc-700 text-base"
                            id="search user"
                            placeholder="find user here"
                            type="text"
                        />
                    </header>
                    <RelationList 
                        data={relation.getAllFollowers.data?.pages.flat() ?? []}
                        fetchNextPage={relation.getAllFollowers.fetchNextPage}
                        hasNextPage={relation.getAllFollowed.hasNextPage}
                        isFetchingNextPage={relation.getAllFollowers.isFetchingNextPage}
                        isProcessing={isProcessing}
                    />
                </main>
            )}
        </section>
    );
}