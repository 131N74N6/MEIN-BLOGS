import { Eye, File, MessageCircle, UserCheck, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../styles/Navbar";
import useRelationService from "../relations/service";
import useAuthService from "./service";
import useBlogService from "../blogs/service";

export default function CurrentUser() {
    const navigate = useNavigate();
    
    const auth = useAuthService();
    const blog = useBlogService();
    const relation = useRelationService();

    const isProcessing = auth.isProcessing || blog.processing || relation.isProcessing;
    const hasPicture = auth.getCurrentUser.data && auth.getCurrentUser.data.profile_picture.public_id;

    return (
        <section className="flex flex-col md:flex-row z-10 relative h-dvh">
            <Navbar is_processing={isProcessing} place="your profile" sign_out={auth.signOutMt}/>
            <main className="h-full w-full md:w-3/4 flex flex-col gap-2.5 p-2.5">
                <section className="grid md:grid-cols-2 grid-cols-1 gap-2.5">
                    <div className="flex bg-blue-100 flex-row gap-2 rounded-md bg-bg-blue-100 p-2">
                        {hasPicture ? (
                            <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-medium text-sm">
                                <img 
                                    className="w-full h-full object-cover rounded-full" 
                                    alt={`profile-picture-${auth.getCurrentUser.data?.user_id}`}
                                    src={auth.getCurrentUser.data?.profile_picture.url!}
                                />
                            </div>
                        ) : (
                            <div className="w-8 h-8 flex justify-center items-center rounded-full bg-purple-600 text-white font-medium text-sm">
                                {auth.getCurrentUser.data?.user_name[0]}
                            </div>
                        )}
                        <div className="flex flex-col gap-2">
                            <p className="font-medium text-base text-gray-700">
                                Username: {auth.getCurrentUser.data?.user_name}
                            </p>
                            <p className="font-medium text-base text-gray-700">
                                Email: {auth.getCurrentUser.data?.email}
                            </p>
                            <p className="font-medium text-base text-gray-700">
                                Joined at: {new Date(auth.getCurrentUser.data?.created_at!).toLocaleString()}
                            </p>
                            {auth.getCurrentUser.data && auth.getCurrentUser.data.description ? (
                                <p className="font-medium text-base text-gray-700">
                                    {auth.getCurrentUser.data.description}
                                </p>
                            ) : null}
                        </div>
                    </div>
                    <div className="flex flex-col gap-2">
                        <button 
                            className="bg-blue-100 rounded-md flex flex-row gap-3 items-center p-2 cursor-pointer disabled:cursor-not-allowed"
                            disabled={isProcessing}
                            onClick={() => navigate("/users/followers")}
                            type="button"
                        >
                            <div className="text-gray-700"><UserPlus size={30}/></div>
                            <div>
                                <h3 className="text-gray-700 text-base font-medium text-left">Followers</h3>
                                <h2 className="text-gray-700 text-lg font-medium text-left">
                                    {relation.getAllYourFollowersTotal.data ?? 0}
                                </h2>
                            </div>
                        </button>
                        <button 
                            className="bg-blue-100 rounded-md flex flex-row gap-3 items-center p-2 cursor-pointer disabled:cursor-not-allowed"
                            disabled={isProcessing}
                            onClick={() => navigate("/users/following")}
                            type="button"
                        >
                            <div className="text-gray-700"><UserCheck size={30}/></div>
                            <div>
                                <h3 className="text-gray-700 text-base font-medium text-left">Following</h3>
                                <h2 className="text-gray-700 text-lg font-medium text-left">
                                    {relation.getAllYourFollowedTotal.data ?? 0}
                                </h2>
                            </div>
                        </button>
                        <button 
                            className="bg-blue-100 rounded-md flex items-center gap-3 flex-row p-2 cursor-pointer disabled:cursor-not-allowed"
                            disabled={isProcessing}
                            onClick={() => navigate("/users/blogs")}
                            type="button"
                        >
                            <div className="text-gray-700"><File size={30}/></div>
                            <div>
                                <h3 className="text-gray-700 text-base font-medium">Blogs total</h3>
                                <h2 className="text-gray-700 text-left text-lg font-medium">
                                    {blog.getAllCurrentUserBlogsTotal.data ?? 0}
                                </h2>
                            </div>
                        </button>
                    </div>
                </section>
                <section className="md:grid-cols-2 grid grid-cols-1 gap-2.5">
                    <div className="bg-blue-100 rounded-md p-2 flex flex-row items-center gap-3">
                        <div className="text-gray-700"><MessageCircle size={30}/></div>
                        <div>
                            <h3 className="text-gray-700 text-base font-medium">Comment received total</h3>
                            <h2 className="text-gray-700 text-lg font-medium">
                                0
                            </h2>
                        </div>
                    </div>
                    <div className="bg-blue-100 rounded-md p-2 flex flex-row items-center gap-3">
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