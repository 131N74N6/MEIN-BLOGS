import useAuthService from "../auth/service";
import Navbar from "../styles/Navbar";
import useBlogService from "./service";

export default function EditBlog() {
    const auth = useAuthService();
    const blog = useBlogService();

    const isProcessing = auth.isProcessing || blog.processing;

    return (
        <section className="flex flex-col md:flex-row h-dvh z-10 relative">
            <Navbar is_processing={isProcessing} place="" sign_out={auth.signOutMt}/>
            <main className="w-full h-full overflow-y-auto md:w-3/4 flex flex-col"></main>
        </section>
    );
}