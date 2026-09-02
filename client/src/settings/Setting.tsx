import { ImageMinus, UserMinus, UserPen } from "lucide-react";
import useAuthService from "../auth/service";
import Navbar from "../styles/Navbar";
import useUserService from "../users/service";
import { useNavigate } from "react-router-dom";

export default function Setting() {
    const navigate = useNavigate();

    const auth = useAuthService();
    const user = useUserService();

    const isProcessing = auth.isProcessing || user.isProcessing;

    return (
        <section className="flex-col md:flex-row relative z-10 flex h-dvh">
            <Navbar is_processing={isProcessing} place="your settings" sign_out={auth.signOutMt}/>
            <main className="flex flex-col gap-2.5 p-2.5 w-full md:w-3/4 h-full overflow-y-auto">
                <button
                    className="cursor-pointer disabled:cursor-not-allowed flex flex-col gap-3 p-3 rounded-md bg-amber-200"
                    disabled={isProcessing}
                    onClick={() => user.deleteUserMt.mutate()}
                    type="button"
                >
                    <section className="flex flex-row gap-3 items-center">
                        <div className="text-gray-800"><UserMinus size={24}/></div>
                        <div className="flex flex-col gap-2">
                            <p className="text-gray-800 font-medium text-left text-base">Delete this account</p>
                            <p className="text-gray-800 text-left font-medium text-sm">
                                Once you click this, your blogs, your viewers, your followers, other user you followed, your comments will dissapear permanently.
                                You cannot access this account forever.
                            </p>
                        </div>
                    </section>
                </button>
                <button
                    className="cursor-pointer disabled:cursor-not-allowed flex flex-col gap-3 p-3 rounded-md bg-green-200"
                    disabled={isProcessing}
                    onClick={() => navigate("/users/edit")}
                    type="button"
                >
                    <section className="flex flex-row gap-3 items-center">
                        <div className="text-gray-800"><UserPen size={24}/></div>
                        <div className="flex flex-col gap-2">
                            <p className="text-gray-800 font-medium text-left text-base">Edit Profile</p>
                            <p className="text-gray-800 text-left font-medium text-sm">
                                Change your account profile here
                            </p>
                        </div>
                    </section>
                </button>
                <button
                    className="cursor-pointer disabled:cursor-not-allowed flex flex-col gap-3 p-3 rounded-md bg-gray-700"
                    disabled={isProcessing}
                    onClick={() => user.deleteOldProfilePictureMt.mutate()}
                    type="button"
                >
                    <section className="flex flex-row gap-3 items-center">
                        <div className="text-gray-100"><ImageMinus size={24}/></div>
                        <div className="flex flex-col gap-2">
                            <p className="text-gray-100 font-medium text-left text-base">Remove Profile Picture</p>
                            <p className="text-gray-100 text-left font-medium text-sm">
                                Remove your current profile picture with one click
                            </p>
                        </div>
                    </section>
                </button>
            </main>
        </section>
    );
}