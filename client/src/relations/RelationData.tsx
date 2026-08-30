import { useNavigate } from "react-router-dom";
import type { RelationDetail } from "./model";
import { useUserStore } from "../users/store";

export default function RelationData(relation: RelationDetail) {
    const navigate = useNavigate();

    const currentUserId = useUserStore((state) => state.currentUserId);
    const setOtherUserId = useUserStore((state) => state.setOtherUserId);

    const isOwner = currentUserId === relation.user_id;

    const visitUser = () => {
        if (isOwner) {
            navigate("/users");
        } else {
            setOtherUserId(relation.user_id);
            navigate(`/users/others/${relation.user_id}`);
        }
    }

    return (
        <div className="flex cursor-pointer flex-row p-2 rounded-lg bg-zinc-100 gap-2" key={`relation-${relation._id}`}>
            {relation.profile_picture !== null ? (
                <button 
                    className="w-8 h-8 rounded-full bg-purple-600 text-white font-medium text-sm" 
                    disabled={relation.is_processing}
                    onClick={visitUser}
                    type="button"
                >
                    <img 
                        className="w-full h-full object-cover rounded-full" 
                        alt={`profile-picture-${relation.user_id}`}
                        src={relation.profile_picture}
                    />
                </button>) : (
                <button 
                    className="w-8 h-8 rounded-full bg-purple-600 text-white font-medium text-sm" 
                    disabled={relation.is_processing}
                    onClick={visitUser}
                    type="button"
                >
                    {relation.username[0]}
                </button>
            )}
            <div className="flex flex-col gap-2">
                <p className="font-medium text-base text-gray-700">{relation.username}</p>
                <p className="font-normal text-sm text-gray-700">followed you at {new Date(relation.created_at).toISOString()}</p>
            </div>
        </div>
    )
}
