import { useNavigate } from "react-router-dom";
import type { RelationDetail } from "./model";

export default function RelationData(relation: RelationDetail) {
    const navigate = useNavigate();

    return (
        <div 
            className="flex cursor-pointer flex-row p-2 rounded-lg bg-zinc-100 gap-2" key={`relation-${relation._id}`}>
            {relation.profile_picture !== null ? (
                <div 
                    className="w-8 h-8 rounded-full bg-purple-600 text-white font-medium text-sm" 
                    onClick={() => (`/users/${relation.user_id}`)}
                >
                    <img className="w-full h-full object-cover rounded-full" alt={`profile-picture-${relation.user_id}`}/>
                </div>) : (
                <div 
                    className="w-8 h-8 rounded-full bg-purple-600 text-white font-medium text-sm" 
                    onClick={() => navigate(`/users/${relation.user_id}`)}
                >
                    {relation.username[0]}
                </div>
            )}
            <div className="flex flex-col gap-2">
                <p className="font-medium text-base text-gray-700">{relation.username}</p>
                <p className="font-normal text-sm text-gray-700">followed you at {new Date(relation.created_at).toISOString()}</p>
            </div>
        </div>
    )
}
