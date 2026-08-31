import { useEffect } from "react";
import useAuthService from "../auth/service";
import Navbar from "../styles/Navbar";
import useUserService from "./service";
import { useUserStore } from "./store";
import { Camera, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EditProfile() {
    const navigate = useNavigate();

    const auth = useAuthService();
    const user = useUserService();

    const currentUserId = useUserStore((state) => state.currentUserId);

    const newDescription = useUserStore((state) => state.newDescription);
    const setNewDescription = useUserStore((state) => state.setNewDescription);

    const newUserName = useUserStore((state) => state.newUserName);
    const setNewUserName = useUserStore((state) => state.setNewUserName);
    
    const setNewProfilePcture = useUserStore((state) => state.setNewProfilePcture);

    const newProfilePctureUrl = useUserStore((state) => state.newProfilePctureUrl);
    const setNewProfilePctureUrl = useUserStore((state) => state.setNewProfilePctureUrl);

    useEffect(() => {
        if (auth.getCurrentUser && auth.getCurrentUser.data && currentUserId) {
            setNewUserName(auth.getCurrentUser.data.user_name);
            
            if (auth.getCurrentUser.data.description) {
                setNewDescription(auth.getCurrentUser.data.description);
            } else {
                setNewDescription("");
            }

            if (auth.getCurrentUser.data.profile_picture.url) {
                setNewProfilePctureUrl(auth.getCurrentUser.data.profile_picture.url);
            } else {
                setNewProfilePctureUrl(null);
            }
        } else {
            setNewUserName("");
            setNewDescription("");
            setNewProfilePctureUrl(null);
        }
    }, [currentUserId, auth.getCurrentUser.data]);

    const isProcessing = auth.isProcessing || user.isProcessing;

    const removePreviewImage = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();
        setNewProfilePctureUrl(null);
        setNewProfilePcture(null);
        if (newProfilePctureUrl) URL.revokeObjectURL(newProfilePctureUrl);
    }

    const saveChanges = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        user.changeUserMt.mutate();
    }

    return (
        <section className="flex flex-col md:flex-row h-dvh relative z-10">
            <Navbar is_processing={isProcessing} place="your settings" sign_out={auth.signOutMt}/>
            <form className="flex flex-col w-full md:w-3/4 h-full overflow-y-auto p-2.5 gap-3" onSubmit={saveChanges}>
                <section className="flex flex-col justify-center gap-1.5">
                    <label className="text-base font-medium text-gray-600" htmlFor="profile_picture">Profile Picture</label>
                    <input className="hidden" type="file" onChange={user.handleUserProfilePicture} ref={user.profilePictureRef}/>
                    {newProfilePctureUrl ? (
                        <div className="w-28 h-28 rounded-full group relative">
                            <img className="w-full h-full object-cover rounded-full" src={newProfilePctureUrl}/>
                            <button
                                className="absolute top-[36%] left-[36%] w-8 h-8 rounded-full flex justify-center items-center bg-amber-500 text-black font-medium cursor-pointer opacity-0 group-hover:opacity-100"
                                disabled={isProcessing}
                                onClick={removePreviewImage}
                                type="button"
                            >
                                <X size={18}/>
                            </button>
                        </div>
                    ) : (
                        <div className="bg-gray-900 flex cursor-pointer justify-center items-center w-28 h-28 rounded-full" onClick={() => user.profilePictureRef.current?.click()}>
                            <div className="text-white font-medium text-sm"><Camera size={25}/></div>
                        </div>
                    )}
                </section>
                <section className="flex flex-col gap-1.5">
                    <label className="text-base font-medium text-gray-600" htmlFor="username">Username</label>
                    <input
                        className="border border-gray-500 md:p-2 p-1.5 font-medium text-base text-gray-600 outline-0"
                        id="username"
                        name="username"
                        onChange={(event) => setNewUserName(event.target.value)}
                        type="text"
                        value={newUserName}
                    />
                </section>
                <section className="flex flex-col gap-1.5">
                    <label className="text-base font-medium text-gray-600" htmlFor="description">Description</label>
                    <textarea
                        className="border resize-none h-[20dvh] overflow-y-auto border-gray-500 md:p-2 p-1.5 font-medium text-base text-gray-600 outline-0"
                        id="description"
                        name="description"
                        onChange={(event) => setNewDescription(event.target.value)}
                        value={newDescription}
                    />
                </section>
                <section className="flex justify-end gap-2.5">
                    <button
                        className="cursor-pointer disabled:cursor-not-allowed bg-blue-700 text-white font-medium text-sm p-2 w-30 rounded-md hover:bg-blue-500 transition-colors"
                        disabled={isProcessing}
                        type="submit"
                    >
                        Save Changes
                    </button>
                    <button
                        className="cursor-pointer disabled:cursor-not-allowed bg-gray-700 text-white font-medium text-sm p-2 w-35 rounded-md hover:bg-gray-500 transition-colors"
                        disabled={isProcessing}
                        onClick={() => navigate("/users/settings")}
                        type="button"
                    >
                        Back to settings
                    </button>
                </section>
            </form>
        </section>
    );
}