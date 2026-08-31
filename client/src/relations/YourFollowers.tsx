import useAuthService from "../auth/service";
import Loading from "../styles/Loading";
import Navbar from "../styles/Navbar";
import RelationList from "./RelationList";
import useRelationService from "./service";
import { useRelationStore } from "./store";

export default function YourFollowers() {
    const auth = useAuthService();
    const relation = useRelationService();

    const searchUser = useRelationStore((state) => state.searchUser);
    const setSearchUser = useRelationStore((state) => state.setSearchUser);

    const isProcessing = auth.isProcessing || relation.isProcessing;

    return (
        <section className="h-dvh flex md:flex-row flex-col relative z-10">
            <Navbar is_processing={isProcessing} place="" sign_out={auth.signOutMt}/>
            {relation.getAllYourFollowers.isLoading ? (
                <section className="flex justify-center items-center h-full w-full md:w-3/4">
                    <Loading/>
                </section>
            ) : relation.getAllYourFollowers.error ? (
                <section className="flex justify-center items-center h-full w-full md:w-3/4">
                    <h3 className="text-center font-medium text-lg text-gray-600">
                        {relation.getAllYourFollowers.error.message}
                    </h3>
                </section>
            ) : (
                <main className="flex flex-col h-full overflow-y-auto w-full md:w-3/4">
                    <header className="px-2.5 pt-2.5">
                        <input
                            className="outline-0 border w-full p-1.5 rounded-md border-zinc-700 text-zinc-700 text-base"
                            id="search user"
                            placeholder="find user here"
                            onChange={(event) => setSearchUser(event.target.value)}
                            type="text"
                            value={searchUser}
                        />
                    </header>
                    <RelationList 
                        data={relation.getAllYourFollowers.data?.pages.flat() ?? []}
                        fetchNextPage={relation.getAllYourFollowers.fetchNextPage}
                        hasNextPage={relation.getAllYourFollowers.hasNextPage}
                        isFetchingNextPage={relation.getAllYourFollowers.isFetchingNextPage}
                        isProcessing={isProcessing}
                    />
                </main>
            )}
        </section>
    );
}