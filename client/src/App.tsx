import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Guest from "./pages/Guest";
import Owner from "./pages/Owner";
import Blogs from "./pages/Blogs";
import MakeBlog from "./pages/MakeBlog";

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
                    <Route element={<Guest/>} path="/guest"/>
                    <Route element={<Owner/>} path="/owner"/>
                    <Route element={<Blogs/>} path="/blogs"/>
                    <Route element={<MakeBlog/>} path="/blogs/create"/>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}