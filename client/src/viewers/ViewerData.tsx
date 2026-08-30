import { useNavigate } from "react-router-dom";
import type { ViewerDetail } from "./model";
import { useUserStore } from "../users/store";

export default function ViewerData(viewer: ViewerDetail) {
    const navigate = useNavigate();

    const currentUserId = useUserStore((state) => state.currentUserId);
    const setOtherUserId = useUserStore((state) => state.setOtherUserId);

    const isOwner = viewer.user_id === currentUserId;

    const visitUser = () => {
        if (isOwner) {
            navigate("/users");
        } else {
            setOtherUserId(viewer.user_id);
            navigate(`/users/others/${viewer.user_id}`);
        }
    };

    return (
        <div className="bg-zinc-100 p-2 rounded-lg flex flex-row items-center gap-2" key={`viewer-${viewer._id}`}>
            {viewer.profile_picture !== null ? (
                <button 
                    className="w-8 h-8 cursor-pointer disabled:cursor-not-allowed rounded-full bg-purple-600 text-white font-medium text-sm"
                    disabled={viewer.is_processing}
                    onClick={visitUser}
                    type="button"
                >
                    <img 
                        src={viewer.profile_picture} 
                        className="w-full h-full object-cover rounded-full" 
                        alt={`profile-picture-${viewer.user_id}`}
                    />
                </button>
            ) : (
                <button 
                    className="w-8 h-8 cursor-pointer disabled:cursor-not-allowed flex justify-center items-center rounded-full bg-purple-600 text-white font-medium text-sm"
                    disabled={viewer.is_processing}
                    onClick={visitUser}
                    type="button"
                >
                    {viewer.username[0]}
                </button>
            )}
            <p className="text-base font-normal text-gray-700">{viewer.username} visited your blog at {new Date(viewer.created_at).toLocaleString()}</p>
        </div>
    );
}