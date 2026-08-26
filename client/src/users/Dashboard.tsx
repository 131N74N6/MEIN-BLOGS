import useAuthService from "../auth/service";
import Navbar from "../styles/Navbar";

export default function Dashboard() {
    const auth = useAuthService();

    const isProcessing = auth.isProcessing;

    return (
        <section className="h-dvh flex-col md:flex-row relative">
            <Navbar place="your dashboard" is_processing={isProcessing} sign_out={auth.signOutMt}/>
            <main className="flex flex-col p-2.5 h-full w-full md:w-3/4"></main>
        </section>
    );
}