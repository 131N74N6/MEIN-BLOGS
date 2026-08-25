import "./styles/App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SignIn from "./auth/SignIn";
import SignUp from "./auth/SignUp";
import Home from "./blogs/Home";
import ProtectedRoute from "./auth/ProtectedRoute";
import UserBlog from "./blogs/UserBlog";
import Dashboard from "./users/Dashboard";
import EditProfile from "./users/EditProfile";
import BlogDetail from "./blogs/BlogDetail";

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
                    <Route path="/" element={<Navigate to="/home" replace/>}/>
                    <Route path="/sign-in" element={<SignIn/>}/>
                    <Route path="/sign-up" element={<SignUp/>}/>
                    <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
                    <Route path="/users/blogs" element={<ProtectedRoute><UserBlog/></ProtectedRoute>}/>
                    <Route path="/users/blogs/:_id" element={<ProtectedRoute><BlogDetail/></ProtectedRoute>}/>
                    <Route path="/users/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
                    <Route path="/users/edit" element={<ProtectedRoute><EditProfile/></ProtectedRoute>}/>
                    <Route path="*" element={<Navigate to="/sign-in" replace/>}/>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}