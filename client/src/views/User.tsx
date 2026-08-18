import Navbar from "../components/Navbar";
import useUserService from "../services/useUserService";

export default function User() {
    const user = useUserService();
    
    return (
        <section className="h-dvh md:flex-row flex-col flex">
            <Navbar is_processing={user.userProcessing} sign_out={user.signOutMt} place="your profile"/>
            <div className="flex flex-col gap-2.5 p-2.5 w-full h-full md:w-4/5"></div>
        </section>
    )
}