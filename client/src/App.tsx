import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./styles/App.css";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import SignIn from "./auth/SignIn";
import SignUp from "./auth/SignIn";
import Home from "./users/Home";
import ProtectedRoute from "./auth/ProtectedRoute";

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
                    <Route path="/home" element={<ProtectedRoute><Home/></ProtectedRoute>}/>
                    <Route path="*" element={<Navigate to="/sign-in" replace/>}/>
                </Routes>
            </BrowserRouter>
        </QueryClientProvider>
    );
}