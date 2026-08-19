import { useNavigate } from "react-router-dom";
import { useNavbarStore } from "../stores/useNavbarStore";
import type { UseMutationResult } from "@tanstack/react-query";
import { ChartBar, File, Menu, PlusSquare, Power, User } from "lucide-react";
import { cn } from "../lib/utils";

interface NavbarIntrf {
    is_processing: boolean;
    place: string;
    sign_out: UseMutationResult<any, Error, void, unknown>
}

export default function Navbar(props: NavbarIntrf) {
    const navigate = useNavigate();
    
    const isOpen = useNavbarStore((state) => state.isOpen);
    const setIsOpen = useNavbarStore((state) => state.setIsOpen);
    const navbarToggle = () => setIsOpen(!isOpen);

    return (
        <>
            <nav className="h-full md:w-1/5 md:flex flex-col p-2.5 gap-2.5 bg-zinc-700 hidden">
                <button 
                    className={cn(
                        "flex gap-2.5",
                        "font-normal text-left text-base text-white hover:bg-zinc-600 p-2", 
                        "disabled:cursor-not-allowed transition-colors cursor-pointer", 
                        `${props.place === "create blog" ? 'bg-zinc-500' : 'bg-zinc-700'} rounded-lg`
                    )}
                    disabled={props.is_processing}
                    onClick={() => navigate("/users/blogs/create")}
                    type="button"
                >
                    <PlusSquare size={22}/>
                    <div>Create Blog</div>
                </button>
                <button 
                    className={cn(
                        "flex gap-2.5",
                        "font-normal text-left text-base text-white hover:bg-zinc-600 p-2", 
                        "disabled:cursor-not-allowed transition-colors cursor-pointer", 
                        `${props.place === "your blogs" ? 'bg-zinc-500' : 'bg-zinc-700'} rounded-lg`
                    )}
                    disabled={props.is_processing}
                    onClick={() => navigate("/users/blogs")}
                    type="button"
                >
                    <File size={22}/>
                    <div>Blogs</div>
                </button>
                <button 
                    className={cn(
                        "flex gap-2.5",
                        "font-normal text-left text-base text-white hover:bg-zinc-600 p-2", 
                        "disabled:cursor-not-allowed transition-colors cursor-pointer", 
                        `${props.place === "your profile" ? 'bg-zinc-500' : 'bg-zinc-700'} rounded-lg`
                    )}
                    disabled={props.is_processing}
                    onClick={() => navigate("/users")}
                    type="button"
                >
                    <User size={22}/>
                    <div>Profile</div>
                </button>
                <button 
                    className={cn(
                        "flex gap-2.5",
                        "font-normal text-left text-base text-white hover:bg-zinc-600 p-2", 
                        "disabled:cursor-not-allowed transition-colors cursor-pointer", 
                        `${props.place === "your dashboard" ? 'bg-zinc-500' : 'bg-zinc-700'} rounded-lg`
                    )}
                    disabled={props.is_processing}
                    onClick={() => navigate("/users/dashboard")}
                    type="button"
                >
                    <ChartBar size={22}/>
                    <div>Dashboard</div>
                </button>
                <button 
                    className={cn(
                        "flex gap-2.5 hover:bg-zinc-600 p-2 hover:rounded-lg",
                        "font-normal text-left text-base text-white ", 
                        "disabled:cursor-not-allowed transition-colors cursor-pointer", 
                    )}
                    disabled={props.is_processing}
                    onClick={() => props.sign_out.mutate()}
                    type="button"
                >
                    <Power size={22}/>
                    <div>Sign Out</div>
                </button>
            </nav>
            <nav className="bg-zinc-700 p-2.5 flex md:hidden">
                <button
                    className="disabled:cursor-not-allowed cursor-pointer text-white font-normal"
                    disabled={props.is_processing}
                    onClick={navbarToggle}
                    type="button"
                >
                    <Menu size={22}/>
                </button>
            </nav>
            {isOpen ? (
                <div className="cursor-pointer fixed inset-0 z-20 md:hidden" onClick={navbarToggle}></div>
            ) : null}
            <aside 
                className={cn(
                    "h-full w-4/5 z-30 md:hidden flex flex-col bg-zinc-700 gap-2.5 p-2.5 max-w-3xs",
                    "top-0 right-0 fixed inset-0 transition-transform duration-300 ease-in-out",
                    `${isOpen ? "translate-x-0" : "translate-x-full"}`
                )}
            >
                <button 
                    className={cn(
                        "flex gap-2.5",
                        "font-normal text-left text-base text-white hover:bg-zinc-600 p-2", 
                        "disabled:cursor-not-allowed transition-colors cursor-pointer", 
                        `${props.place === "create blog" ? 'bg-zinc-500' : 'bg-zinc-700'} rounded-lg`
                    )}
                    disabled={props.is_processing}
                    onClick={() => navigate("/users/blogs/create")}
                    type="button"
                >
                    <PlusSquare size={22}/>
                    <div>Create Blog</div>
                </button>
                <button 
                    className={cn(
                        "flex gap-2.5",
                        "font-normal text-left text-base text-white hover:bg-zinc-600 p-2", 
                        "disabled:cursor-not-allowed transition-colors cursor-pointer", 
                        `${props.place === "your blogs" ? 'bg-zinc-500' : 'bg-zinc-700'} rounded-lg`
                    )}
                    disabled={props.is_processing}
                    onClick={() => navigate("/users/blogs")}
                    type="button"
                >
                    <File size={22}/>
                    <div>Blogs</div>
                </button>
                <button 
                    className={cn(
                        "flex gap-2.5",
                        "font-normal text-left text-base text-white hover:bg-zinc-600 p-2", 
                        "disabled:cursor-not-allowed transition-colors cursor-pointer", 
                        `${props.place === "your profile" ? 'bg-zinc-500' : 'bg-zinc-700'} rounded-lg`
                    )}
                    disabled={props.is_processing}
                    onClick={() => navigate("/users")}
                    type="button"
                >
                    <User size={22}/>
                    <div>Profile</div>
                </button>
                <button 
                    className={cn(
                        "flex gap-2.5",
                        "font-normal text-left text-base text-white hover:bg-zinc-600 p-2", 
                        "disabled:cursor-not-allowed transition-colors cursor-pointer", 
                        `${props.place === "your dashboard" ? 'bg-zinc-500' : 'bg-zinc-700'} rounded-lg`
                    )}
                    disabled={props.is_processing}
                    onClick={() => navigate("/users/dashboard")}
                    type="button"
                >
                    <ChartBar size={22}/>
                    <div>Dashboard</div>
                </button>
                <button 
                    className={cn(
                        "flex gap-2.5 hover:bg-zinc-600 p-2 hover:rounded-lg",
                        "font-normal text-left text-base text-white ", 
                        "disabled:cursor-not-allowed transition-colors cursor-pointer", 
                    )}
                    disabled={props.is_processing}
                    onClick={() => props.sign_out.mutate()}
                    type="button"
                >
                    <Power size={22}/>
                    <div>Sign Out</div>
                </button>
            </aside>
        </>
    );
}
