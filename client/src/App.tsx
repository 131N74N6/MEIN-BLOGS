import "./styles/App.css";
import "quill/dist/quill.snow.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SignIn from "./auth/SignIn";
import SignUp from "./auth/SignUp";
import Home from "./blogs/Home";
import ProtectedRoute from "./auth/ProtectedRoute";
import CurrentUserBlog from "./users/CurrentUserBlog";
import EditProfile from "./users/EditProfile";
import BlogDetail from "./blogs/BlogDetail";
import CreateBlog from "./blogs/CreateBlog";
import EditBlog from "./blogs/EditBlog";
import Comments from "./comments/Comments";
import Viewers from "./viewers/Viewers";
import Setting from "./settings/Setting";
import CurrentUser from "./auth/CurrentUser";
import OtherUser from "./users/OtherUser";
import OtherUserBlogs from "./users/OtherUserBlogs";
import YourFollowers from "./relations/YourFollowers";
import YourFollowed from "./relations/YourFollowed";
import OtherFollowers from "./relations/OtherFollowers";
import OtherFollowed from "./relations/OtherFollowed";

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
                    <Route path="/users" element={<ProtectedRoute><CurrentUser/></ProtectedRoute>}/>
                    <Route path="/users/:_id" element={<ProtectedRoute><OtherUser/></ProtectedRoute>}/>
                    <Route path="/users/edit" element={<ProtectedRoute><EditProfile/></ProtectedRoute>}/>
                    <Route path="/users/settings" element={<ProtectedRoute><Setting/></ProtectedRoute>}/>
                    <Route path="/users/blogs" element={<ProtectedRoute><CurrentUserBlog/></ProtectedRoute>}/>
                    <Route path="/users/blogs/:user_id" element={<ProtectedRoute><OtherUserBlogs/></ProtectedRoute>}/>
                    <Route path="/users/blogs/contains/:_id" element={<ProtectedRoute><BlogDetail/></ProtectedRoute>}/>
                    <Route path="/users/blogs/contains/:_id/comments" element={<ProtectedRoute><Comments/></ProtectedRoute>}/>
                    <Route path="/users/blogs/contains/:_id/viewers" element={<ProtectedRoute><Viewers/></ProtectedRoute>}/>
                    <Route path="/users/blogs/create" element={<ProtectedRoute><CreateBlog/></ProtectedRoute>}/>
                    <Route path="/users/blogs/edit/:_id" element={<ProtectedRoute><EditBlog/></ProtectedRoute>}/>
                    <Route path="/users/followers" element={<ProtectedRoute><YourFollowers/></ProtectedRoute>}/>
                    <Route path="/users/following" element={<ProtectedRoute><YourFollowed/></ProtectedRoute>}/>
                    <Route path="/users/followers/:user_id" element={<ProtectedRoute><OtherFollowers/></ProtectedRoute>}/>
                    <Route path="/users/following/:user_id" element={<ProtectedRoute><OtherFollowed/></ProtectedRoute>}/>
                    <Route path="*" element={<Navigate to="/sign-in" replace/>}/>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}