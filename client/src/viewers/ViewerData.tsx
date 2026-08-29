import { useNavigate } from "react-router-dom";
import type { ViewerDetail } from "./model";

export default function ViewerData(viewer: ViewerDetail) {
    const navigate = useNavigate();

    return (
        <div className="bg-zinc-100 p-2 rounded-lg flex flex-row items-center gap-2" key={`viewer-${viewer._id}`}>
            <button
                className="cursor-pointer disabled:cursor-not-allowed"
                disabled={viewer.is_processing}
                onClick={() => navigate(`/users/${viewer.user_id}`)}
                type="button"
            >
                {viewer.profile_picture !== null ? (
                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-medium text-sm">
                        <img className="w-full h-full object-cover rounded-full" alt={`profile-picture-${viewer.user_id}`}/>
                    </div>
                ) : (
                    <div className="w-8 h-8 flex justify-center items-center rounded-full bg-purple-600 text-white font-medium text-sm">
                        {viewer.username[0]}
                    </div>
                )}
            </button>
            <p className="text-base font-normal text-gray-700">{viewer.username} visited your blog at {new Date(viewer.created_at).toLocaleString()}</p>
        </div>
    );
}