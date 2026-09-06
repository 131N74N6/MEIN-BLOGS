import { useNavigate } from "react-router-dom";
import useAuthService from "../auth/service";
import Loading from "../styles/Loading";
import Navbar from "../styles/Navbar";
import RelationList from "./RelationList";
import useRelationService from "./service";
import { useUserStore } from "../users/store";
import { useEffect } from "react";

export default function OtherFollowed() {
    const auth = useAuthService();
    const relation = useRelationService();
    const navigate = useNavigate();

    const currentUserId = useUserStore((state) => state.currentUserId);

    useEffect(() => {
        if (!auth.getCurrentUser.isPending && !currentUserId && !auth.getCurrentUser.data?.user_id) {
            navigate("/sign-in", { replace: true });
        }
    }, [currentUserId, auth.getCurrentUser.isPending, auth.getCurrentUser.data, navigate]);
    
    const isProcessing = auth.isProcessing || relation.isProcessing;

    return (
        <section className="h-dvh flex md:flex-row flex-col relative z-10">
            <Navbar is_processing={isProcessing} place="" sign_out={auth.signOutMt}/>
            {relation.getAllOtherFollowed.isLoading ? (
                <section className="flex justify-center items-center h-full w-full md:w-3/4">
                    <Loading/>
                </section>
            ) : relation.getAllOtherFollowed.error ? (
                <section className="flex justify-center items-center h-full w-full md:w-3/4">
                    <h3 className="text-center font-medium text-lg text-gray-600">
                        {relation.getAllOtherFollowed.error.message}
                    </h3>
                </section>
            ) : (
                <main className="flex flex-col h-full overflow-y-auto w-full md:w-3/4">
                    <RelationList 
                        data={relation.getAllOtherFollowed.data?.pages.flat() ?? []}
                        fetchNextPage={relation.getAllOtherFollowed.fetchNextPage}
                        hasNextPage={relation.getAllOtherFollowed.hasNextPage}
                        isFetchingNextPage={relation.getAllOtherFollowed.isFetchingNextPage}
                        isProcessing={isProcessing}
                    />
                </main>
            )}
        </section>
    );
}