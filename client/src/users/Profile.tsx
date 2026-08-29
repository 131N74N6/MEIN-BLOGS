import useAuthService from "../auth/service";
import Navbar from "../styles/Navbar";

export default function Profile() {
    const auth = useAuthService();
    
    const isProcessing = auth.isProcessing;

    return (
        <section className="h-dvh flex md:flex-row flex-col z-10 relative">
            <Navbar is_processing={isProcessing} place="your profile" sign_out={auth.signOutMt}/>
            <main className="h-full w-full md:w-3/4 flex flex-col"></main>
        </section>
    )
}