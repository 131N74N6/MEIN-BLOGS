import userService from "./user.service";
import { errorHandling } from "../errors/api.error";
import { AuthRequest } from "./user.middleware";
import { changeUserSchema, signInSchema, signUpSchema } from "./user.validation";
import { Request, Response } from "express";

class UserController {
    async changeUser(req: AuthRequest, res: Response) {
        try {
            const newProfileImage = req.file;
            
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const newProfile = changeUserSchema.safeParse(req.body);
            if (!newProfile.success) return res.status(400).json({ message: newProfile.error.issues[0].message });


            if (!newProfile.data.username && !newProfileImage) {
                return res.status(400).json({ message: "no profile data to update" });
            }

            await userService.changeUserService({
                currentUserId: currentUserId,
                username: newProfile.data.username,
                selectedImage: newProfileImage
            });

            return res.status(200).json({ message: "this user profile has changed" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async deleteOldProfile(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            await userService.deleteCurrentUserOldProfile(currentUserId);

            return res.status(200).json({ message: "successfully delete old profile picture" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async deleteUser(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });
            
            await userService.deleteUserService(currentUserId);

            return res.status(200).json({ message: "successfully delete user" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async signIn(req: Request, res: Response) {
        try {
            const signIn = signInSchema.safeParse(req.body);
            if (!signIn.success) return res.status(400).json({ message: signIn.error.issues[0].message });

            const signInToken = await userService.signInService(signIn.data);

            res.cookie("token", signInToken, {
                httpOnly: true,
                maxAge: 86400000,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                secure: process.env.NODE_ENV === "production"
            });

            return res.status(200).json({ message: "sign in success" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async signOut(_: Request, res: Response) {
        try {
            res.clearCookie("token", {
                httpOnly: true,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                secure: process.env.NODE_ENV === "production"
            });

            return res.status(200).json({ message: "user sign out successfully" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async signUp(req: Request, res: Response) {
        try {
            const signUp = signUpSchema.safeParse(req.body);
            if (!signUp.success) return res.status(400).json({ message: signUp.error.issues[0].message });

            const token = await userService.signUpService(signUp.data);

            res.cookie("token", token, {
                httpOnly: true,
                maxAge: 86400000,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                secure: process.env.NODE_ENV === "production"
            });

            return res.status(200).json({ message: "sign up confirmed" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async showProfile(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const user = await userService.showProfileService(currentUserId);

            return res.status(200).json({
                email: user.email,
                user_id: user._id,
                username: user.username,
                profile_picture: user.profile_picture
            });
        } catch (error: any) {
            return errorHandling(res, error);
        }
    }
}

const userController = new UserController();

export default userController;