import useAuthService from "../auth/service";
import Navbar from "../styles/Navbar";
import BlogList from "./BlogList";
import useBlogService from "./service";

export default function Home() {
    const auth = useAuthService();
    const blog = useBlogService();

    return (
        <section className="flex md:flex-row flex-col h-dvh">
            <Navbar place="home" sign_out={auth.signOutMt} is_processing={blog.processing}/>
            <main className="h-full flex flex-col">
                <header></header>
                <section>
                    <BlogList/>
                </section>
            </main>
        </section>
    );
}