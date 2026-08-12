import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./views/SignUp";
import SignIn from "./views/SignIn";
import User from "./views/User";
import Blogs from "./views/Blogs";
import MakeBlog from "./views/CreateBlog";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnMount: false,
            refetchOnWindowFocus: false
        }
    }
});

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route element={<SignIn/>} path="/sign-in"/>
                    <Route element={<SignUp/>} path="/"/>
                    <Route element={<User/>} path="/user"/>
                    <Route element={<Blogs/>} path="/blogs"/>
                    <Route element={<MakeBlog/>} path="/blogs/create"/>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}