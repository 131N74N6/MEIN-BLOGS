import Navbar from "../components/Navbar";
import useRelationshipService from "../services/useRelationService";
import useUserService from "../services/useUserService";
import useViewerService from "../services/useViewerService";

export default function Dashboard() {
    const relationship = useRelationshipService();
    const viewer = useViewerService();
    const user = useUserService();

    const is_processing = relationship.relationProcess || viewer.seeOneBlogMt.isPending || user.userProcessing;

    return (
        <section className="flex md:flex-row flex-col h-dvh">
            <Navbar is_processing={is_processing} place="your dashboard" sign_out={user.signOutMt}/>
            <div className="h-full md:w-4/5 flex flex-col p-2.5 gap-2.5"></div>
        </section>
    );
}