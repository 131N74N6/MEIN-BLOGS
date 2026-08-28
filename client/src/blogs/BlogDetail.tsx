import useAuthService from "../auth/service";
import Navbar from "../styles/Navbar";
import useBlogService from "./service";

export default function BlogDetail() {
    const auth = useAuthService();
    const blog = useBlogService();

    const isProcessing = auth.isProcessing || blog.processing;

    return (
        <section className="h-dvh flex flex-col md:flex-row z-10 relative">
            <Navbar is_processing={isProcessing} place="" sign_out={auth.signOutMt}/>
            <main></main>
        </section>
    );
}