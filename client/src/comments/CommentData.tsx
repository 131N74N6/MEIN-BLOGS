import type { CommentDetail } from "./model";

export default function CommentData(comment: CommentDetail) {
    return (
        <div className="flex flex-row gap-2.5 bg-zinc-100 p-2" key={`comment-${comment._id}`}>
            {comment.profile_picture !== null ? (
                <div 
                    className="w-8 h-8 rounded-full bg-purple-600 text-white font-medium text-sm" 
                    onClick={() => (`/users/${comment.user_id}`)}
                >
                    <img className="w-full h-full object-cover rounded-full" alt={`profile-picture-${comment.user_id}`}/>
                </div>) : (
                <div 
                    className="w-8 h-8 rounded-full bg-purple-600 text-white font-medium text-sm" 
                    onClick={() => (`/users/${comment.user_id}`)}
                >
                    {comment.username[0]}
                </div>
            )}
            <div className="flex flex-col gap-1.5">
                <p className="text-base font-normal text-gray-700">{new Date(comment.created_at).toLocaleString()}</p>
                <p className="text-base font-medium text-gray-700">{comment.username}</p>
                <p className="text-base font-normal text-gray-700">{comment.text}</p>
            </div>
        </div>
    );
}