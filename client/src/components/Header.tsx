import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/useUserStore";
import { cn } from "../lib/utils";

interface HeaderIntrf {
    is_processing: boolean;
    profile_picture?: {
        filename: string;
        filetype: string;
        public_id: string;
        resource_type: string;
        url: string;
    } | null;
    username?: string;
}

export default function Header(props: HeaderIntrf) {
    const navigate = useNavigate();
    const currentUserId = useUserStore((state) => state.currentUserId);

    return (
        <header className="bg-gray-800 p-4 w-full flex justify-end">
            {currentUserId !== "" ? (
                <div className="w-8 h-8 rounded-full" onClick={() => navigate("/user")}>
                    {props.profile_picture && 
                    props.profile_picture !== null && 
                    props.profile_picture.public_id !== null ? (
                        <div className="w-full h-full">
                            <img 
                                className="w-full h-full object-cover rounded-full" 
                                src={props.profile_picture.url} 
                                alt={props.profile_picture.public_id}
                            />
                        </div>
                    ) : (
                        <div className={cn(
                            "w-full h-full rounded-full flex items-center text-[0.9rem]", 
                            "justify-center bg-purple-500 text-white font-medium"
                        )}>
                            {props.username?.[0]}
                        </div>
                    )}
                </div>
            ) : (
                <button 
                    className={cn(
                        "rounded-2xl p-1.5 bg-blue-500 text-white hover:bg-blue-600 transition-colors", 
                        "w-24 font-medium disabled:cursor-not-allowed cursor-pointer text-base"
                    )}
                    disabled={props.is_processing}
                    onClick={() => navigate("/sign-in")}
                    type="button"
                >
                    Sign In
                </button>
            )}
        </header>
    );
}