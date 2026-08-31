import useAuthService from "../auth/service";
import Loading from "../styles/Loading";
import Navbar from "../styles/Navbar";
import RelationList from "./RelationList";
import useRelationService from "./service";

export default function OtherFollowers() {
    const auth = useAuthService();
    const relation = useRelationService();

    const isProcessing = auth.isProcessing || relation.isProcessing;

    return (
        <section className="h-dvh flex md:flex-row flex-col relative z-10">
            <Navbar is_processing={isProcessing} place="" sign_out={auth.signOutMt}/>
            {relation.getAllOtherFollowers.isLoading ? (
                <section className="flex justify-center items-center h-full w-full md:w-3/4">
                    <Loading/>
                </section>
            ) : relation.getAllOtherFollowers.error ? (
                <section className="flex justify-center items-center h-full w-full md:w-3/4">
                    <h3 className="text-center font-medium text-lg text-gray-600">
                        {relation.getAllOtherFollowers.error.message}
                    </h3>
                </section>
            ) : (
                <main className="flex flex-col h-full overflow-y-auto w-full md:w-3/4">
                    <RelationList 
                        data={relation.getAllOtherFollowers.data?.pages.flat() ?? []}
                        fetchNextPage={relation.getAllOtherFollowers.fetchNextPage}
                        hasNextPage={relation.getAllOtherFollowers.hasNextPage}
                        isFetchingNextPage={relation.getAllOtherFollowers.isFetchingNextPage}
                        isProcessing={isProcessing}
                    />
                </main>
            )}
        </section>
    );
}