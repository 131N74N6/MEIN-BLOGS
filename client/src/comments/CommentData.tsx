import { useNavigate } from "react-router-dom";
import type { CommentDetail } from "./model";

export default function CommentData(comment: CommentDetail) {
    const navigate = useNavigate();

    const seeThisUser = () => {
        navigate(`/users/${comment.user_id}`);
    }

    return (
        <div className="flex flex-row gap-2.5 bg-zinc-100 p-2.5 rounded-lg" key={`comment-${comment._id}`}>
            {comment.profile_picture !== null ? (
                <button 
                    className="w-8 h-8 cursor-pointer disabled:cursor-not-allowed rounded-full bg-purple-600 text-white font-medium text-sm" 
                    disabled={comment.isProcessing}
                    onClick={seeThisUser}
                    type="button"
                >
                    <img 
                        className="w-full h-full object-cover rounded-full" 
                        alt={`profile-picture-${comment.user_id}`}
                        src={comment.profile_picture}
                    />
                </button>) : (
                <button 
                    className="w-8 h-8 cursor-pointer disabled:cursor-not-allowed flex justify-center items-center rounded-full bg-purple-600 text-white font-medium text-sm" 
                    disabled={comment.isProcessing}
                    onClick={seeThisUser}
                    type="button"
                >
                    {comment.username[0]}
                </button>
            )}
            <div className="flex flex-col gap-1.5">
                <div className="flex flex-row gap-2.5">
                    <p className="text-base font-medium text-gray-700">{comment.username}</p>
                    <p>|</p>
                    <p className="text-base font-normal text-gray-700">{new Date(comment.created_at).toLocaleString()}</p>
                </div>
                <p className="text-base font-normal text-gray-700">{comment.text}</p>
            </div>
        </div>
    );
}