import { Eye, File, MessageCircle, UserCheck, UserPlus } from "lucide-react";
import useAuthService from "../auth/service";
import useRelationService from "../relations/service";
import Navbar from "../styles/Navbar";
import useUserService from "./service";
import { useNavigate } from "react-router-dom";
import { useUserStore } from "./store";
import useBlogService from "../blogs/service";

export default function OtherUser() {
    const navigate = useNavigate();

    const auth = useAuthService();
    const blog = useBlogService();
    const relation = useRelationService();
    const user = useUserService();
    
    const otherUserId = useUserStore((state) => state.otherUserId);

    const isProcessing = auth.isProcessing || blog.processing || relation.isProcessing || user.isProcessing;

    const hasPicture = user.getCurrentUser.data && user.getCurrentUser.data.profile_picture && 
    user.getCurrentUser.data.profile_picture.public_id;

    return (
        <section className="flex flex-col md:flex-row z-10 relative h-dvh">
            <Navbar is_processing={isProcessing} place="" sign_out={auth.signOutMt}/>
            <main className="h-full w-full md:w-3/4 flex flex-col gap-2.5 p-2.5">
                <section className="grid md:grid-cols-2 grid-cols-1 gap-2.5">
                    <div className="flex flex-row gap-2 rounded-md bg-amber-100 p-2">
                        {hasPicture ? (
                            <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-medium text-sm">
                                <img 
                                    className="w-full h-full object-cover rounded-full" 
                                    alt={`profile-picture-${user.getCurrentUser.data?.user_id}`}
                                    src={user.getCurrentUser.data?.profile_picture?.url!}
                                />
                            </div>
                        ) : (
                            <div className="w-8 h-8 flex justify-center items-center rounded-full bg-purple-600 text-white font-medium text-sm">
                                {user.getCurrentUser.data?.user_name[0]}
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <p className="font-medium text-base text-gray-700">
                                Username: {user.getCurrentUser.data?.user_name}
                            </p>
                            <p className="font-medium text-base text-gray-700">
                                Email: {user.getCurrentUser.data?.email}
                            </p>
                            <p className="font-medium text-base text-gray-700">
                                Joined at: {new Date(user.getCurrentUser.data?.created_at!).toLocaleString()}
                            </p>
                            {user.getCurrentUser.data && user.getCurrentUser.data.description ? (
                                <p className="font-medium text-base text-gray-700">
                                    {user.getCurrentUser.data.description}
                                </p>
                            ) : null}
                            {relation.hasUserFollowed.data ? (
                                <div className="flex">
                                    <button
                                        className="cursor-pointer disabled:cursor-not-allowed bg-gray-800 text-white font-medium text-sm p-2 w-40 rounded-md hover:bg-gray-600 transition-colors"
                                        disabled={isProcessing}
                                        onClick={() => relation.unfollowOneUserMt.mutate(otherUserId!)}
                                        type="button"
                                    >
                                        Unfollow
                                    </button>
                                </div>
                            ) : (
                                <div className="flex">
                                    <button
                                        className="cursor-pointer disabled:cursor-not-allowed bg-blue-700 text-white font-medium text-sm p-2 w-22 rounded-md hover:bg-blue-500 transition-colors"
                                        disabled={isProcessing}
                                        onClick={() => relation.startFollowOneUserMt.mutate()}
                                        type="button"
                                    >
                                        Follow
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button 
                            className="bg-amber-100 rounded-md flex flex-row gap-3 items-center p-2 cursor-pointer disabled:cursor-not-allowed"
                            disabled={isProcessing}
                            onClick={() => navigate(`/users/followers/${otherUserId}`)}
                            type="button"
                        >
                            <div className="text-gray-700"><UserPlus size={30}/></div>
                            <div>
                                <h3 className="text-gray-700 text-base font-medium text-left">Followers</h3>
                                <h2 className="text-gray-700 text-lg font-medium text-left">
                                    {relation.getAllOtherFollowersTotal.data ?? 0}
                                </h2>
                            </div>
                        </button>
                        <button 
                            className="bg-amber-100 rounded-md flex flex-row gap-3 items-center p-2 cursor-pointer disabled:cursor-not-allowed"
                            disabled={isProcessing}
                            onClick={() => navigate(`/users/following/${otherUserId}`)}
                            type="button"
                        >
                            <div className="text-gray-700"><UserCheck size={30}/></div>
                            <div>
                                <h3 className="text-gray-700 text-base font-medium text-left">Following</h3>
                                <h2 className="text-gray-700 text-lg font-medium text-left">
                                    {relation.getAllOtherFollowedTotal.data ?? 0}
                                </h2>
                            </div>
                        </button>
                        <button 
                            className="bg-amber-100 rounded-md flex items-center gap-3 flex-row p-2 cursor-pointer disabled:cursor-not-allowed"
                            disabled={isProcessing}
                            onClick={() => navigate(`/users/blogs/${otherUserId}`)}
                            type="button"
                        >
                            <div className="text-gray-700"><File size={30}/></div>
                            <div>
                                <h3 className="text-gray-700 text-base font-medium">Blogs total</h3>
                                <h2 className="text-gray-700 text-left text-lg font-medium">
                                    {blog.getAllOtherUserBlogsTotal.data ?? 0}
                                </h2>
                            </div>
                        </button>
                    </div>
                </section>
                <section className="md:grid-cols-2 grid grid-cols-1 gap-2.5">
                    <div className="bg-amber-100 rounded-md p-2 flex flex-row items-center gap-3">
                        <div className="text-gray-700"><MessageCircle size={30}/></div>
                        <div>
                            <h3 className="text-gray-700 text-base font-medium">Comment received total</h3>
                            <h2 className="text-gray-700 text-lg font-medium">
                                0
                            </h2>
                        </div>
                    </div>
                    <div className="bg-amber-100 rounded-md p-2 flex flex-row items-center gap-3">
                        <div className="text-gray-700"><Eye size={30}/></div>
                        <div>
                            <h3 className="text-gray-700 text-base font-medium">Viewers total</h3>
                            <h2 className="text-gray-700 text-lg font-medium">
                                0
                            </h2>
                        </div>
                    </div>
                </section>
            </main>
        </section>
    );
}