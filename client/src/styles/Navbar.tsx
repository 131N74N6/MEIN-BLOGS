import { useNavigate } from "react-router-dom"
import { useStyleStore } from "./store";
import type { UseMutationResult } from "@tanstack/react-query";
import { Settings, File, Home, Menu, PlusSquare, Power, User } from "lucide-react";
import { cn } from "./utils";

type NavbarIntrf = {
    is_processing: boolean;
    place: string;
    sign_out: UseMutationResult<any, Error, void, unknown>
}

const asideItems = [
    { label: "Home", path: "/home", place: "home", icon: Home },
    { label: "Create Blog", path: "/users/blogs/create", place: "create blog", icon: PlusSquare },
    { label: "Blogs", path: "/users/blogs", place: "your blogs", icon: File },
    { label: "Profile", path: "/users", place: "your profile", icon: User },
    { label: "Settings", path: "/users/settings", place: "your settings", icon: Settings },
];

export default function Navbar(info: NavbarIntrf) {
    const navigate = useNavigate();

    const isOpen = useStyleStore((state) => state.isOpen);
    const setIsOpen = useStyleStore((state) => state.setIsOpen);

    const navbarToggle = () => setIsOpen(!isOpen);
    
    return (
        <>
            <aside className="md:w-1/4 bg-zinc-700 md:flex flex-col gap-2.5 p-2.5 hidden h-full">
                {asideItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button 
                            className={cn(
                                "flex gap-2.5",
                                "font-normal text-left text-base text-white hover:bg-zinc-600 p-2", 
                                "disabled:cursor-not-allowed transition-colors cursor-pointer", 
                                `${info.place === item.place ? 'bg-zinc-500' : 'bg-zinc-700'} rounded-lg`
                            )}
                            disabled={info.is_processing}
                            key={item.path}
                            onClick={() => {
                                navigate(item.path);
                            }}
                            type="button"
                        >
                            <Icon size={22} />
                            <div>{item.label}</div>
                        </button>
                    );
                })}
                <button 
                    className={cn(
                        "flex gap-2.5 hover:bg-zinc-600 p-2 hover:rounded-lg",
                        "font-normal text-left text-base text-white ", 
                        "disabled:cursor-not-allowed transition-colors cursor-pointer", 
                    )}
                    disabled={info.is_processing}
                    onClick={() => info.sign_out.mutate()}
                    type="button"
                >
                    <Power size={22}/>
                    <div>Sign Out</div>
                </button>
            </aside>
            <header className="bg-zinc-700 p-2.5 flex md:hidden">
                <button
                    className="disabled:cursor-not-allowed cursor-pointer text-white font-normal"
                    disabled={info.is_processing}
                    onClick={navbarToggle}
                    type="button"
                >
                    <Menu size={22}/>
                </button>
            </header>
            {isOpen ? (
                <div className="cursor-pointer fixed inset-0 z-20 md:hidden" onClick={navbarToggle}></div>
            ) : null}
            <aside 
                className={cn(
                    "h-full w-4/5 z-30 md:hidden flex flex-col bg-zinc-700 gap-2.5 p-2.5 max-w-3xs",
                    "top-0 right-0 fixed transition-transform duration-300 ease-in-out",
                    `${isOpen ? "translate-x-0" : "translate-x-full"}`
                )}
            >
                {asideItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button 
                            className={cn(
                                "flex gap-2.5",
                                "font-normal text-left text-base text-white hover:bg-zinc-600 p-2", 
                                "disabled:cursor-not-allowed transition-colors cursor-pointer", 
                                `${info.place === item.place ? 'bg-zinc-500' : 'bg-zinc-700'} rounded-lg`
                            )}
                            disabled={info.is_processing}
                            key={item.path}
                            onClick={() => {
                                navigate(item.path);
                                setIsOpen(false);
                            }}
                            type="button"
                        >
                            <Icon size={22} />
                            <div>{item.label}</div>
                        </button>
                    );
                })}
                <button 
                    className={cn(
                        "flex gap-2.5 hover:bg-zinc-600 p-2 hover:rounded-lg",
                        "font-normal text-left text-base text-white ", 
                        "disabled:cursor-not-allowed transition-colors cursor-pointer", 
                    )}
                    disabled={info.is_processing}
                    onClick={() => {
                        info.sign_out.mutate();
                        setIsOpen(false);
                    }}
                    type="button"
                >
                    <Power size={22}/>
                    <div>Sign Out</div>
                </button>
            </aside>
        </>
    )
}