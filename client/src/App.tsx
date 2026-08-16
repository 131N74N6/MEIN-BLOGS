import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./views/SignUp";
import SignIn from "./views/SignIn";
import User from "./views/User";
import Blogs from "./views/Blogs";
import MakeBlog from "./views/CreateBlog";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./views/Home";
import Personal from "./views/Personal";
import Dashboard from "./views/Dashboard";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnMount: false,
            refetchOnWindowFocus: false,
            staleTime: Infinity
        }
    }
});

export default function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Routes>
                    <Route element={<Home/>} path="/"/>
                    <Route element={<SignIn/>} path="/sign-in"/>
                    <Route element={<SignUp/>} path="/sign-up"/>
                    <Route element={<ProtectedRoute><Blogs/></ProtectedRoute>} path="/users/blogs"/>
                    <Route element={<ProtectedRoute><User/></ProtectedRoute>} path="/users"/>
                    <Route element={<ProtectedRoute><Dashboard/></ProtectedRoute>} path="/users/dashboard"/>
                    <Route element={<ProtectedRoute><Personal/></ProtectedRoute>} path="/person"/>
                    <Route element={<ProtectedRoute><MakeBlog/></ProtectedRoute>} path="/users/blogs/create"/>
                    <Route path="*" element={<Navigate to="/sign-in" replace/>}/>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}