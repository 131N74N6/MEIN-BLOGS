import "./styles/App.css";
import "quill/dist/quill.snow.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SignIn from "./auth/SignIn";
import SignUp from "./auth/SignUp";
import Home from "./blogs/Home";
import ProtectedRoute from "./auth/ProtectedRoute";
import UserBlog from "./users/UserBlog";
import Dashboard from "./users/Dashboard";
import EditProfile from "./users/EditProfile";
import BlogDetail from "./blogs/BlogDetail";
import CreateBlog from "./blogs/CreateBlog";
import EditBlog from "./blogs/EditBlog";
import Profile from "./users/Profile";
import Comments from "./comments/Comments";
import Viewers from "./viewers/Viewers";

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
                    <Route path="/users/blogs/:_id/comments" element={<ProtectedRoute><Comments/></ProtectedRoute>}/>
                    <Route path="/users/blogs/:_id/viewers" element={<ProtectedRoute><Viewers/></ProtectedRoute>}/>
                    <Route path="/users/blogs/create" element={<ProtectedRoute><CreateBlog/></ProtectedRoute>}/>
                    <Route path="/users/blogs/edit/:_id" element={<ProtectedRoute><EditBlog/></ProtectedRoute>}/>
                    <Route path="/users/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
                    <Route path="/users/:_id" element={<ProtectedRoute><Profile/></ProtectedRoute>}/>
                    <Route path="/users/edit" element={<ProtectedRoute><EditProfile/></ProtectedRoute>}/>
                    <Route path="*" element={<Navigate to="/sign-in" replace/>}/>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}