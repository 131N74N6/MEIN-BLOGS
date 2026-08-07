import userService from "../services/user.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Request, Response } from "express";
import { ProfilePictureIntrf } from "../models/user.model";

class UserController {
    async changeUserController(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            const newProfileImage: Express.Multer.File | undefined = req.file;

            if (!currentUserId) return res.json({ message: "user not found" });

            await userService.changeUserService({
                currentUserId: currentUserId,
                username: req.body.username as string,
                selectedImage: newProfileImage
            });

            res.json({ message: "this user profile has changed" });
        } catch (error) {
            res.json({ message: error || "something went wrong" });
        }
    }

    async deleteOldProfileController(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.user_id;
            const profilePicture = req.body.profilePicture as ProfilePictureIntrf;

            if (userId) {
                await userService.deleteCurrentUserOldProfile(userId, profilePicture);
            }

            res.json({ message: "successfully delete old image profile" });
        } catch (error) {
            res.json({ message: error || "something went wrong" });
        }
    }

    async deleteUserController(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (currentUserId) await userService.deleteUserService(currentUserId);

            res.json({ message: "successfully delete user" });
        } catch (error) {
            res.json({ message: error || "something went wrong" });
        }
    }

    async signInController(req: Request, res: Response) {
        try {
            const token = await userService.signInService({
                password: req.body.password as string,
                username: req.body.username as string
            });

            res.cookie("token", token, {
                httpOnly: true,
                maxAge: 86400000,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                secure: process.env.NODE_ENV === "production"
            });

            res.json({ message: "sign in confirmed" });
        } catch (error) {
            res.json({ message: error || "something went wrong" });
        }
    }

    async signOutController(_: Request, res: Response) {
        try {
            res.clearCookie("token", {
                httpOnly: true,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                secure: process.env.NODE_ENV === "production"
            });

            res.json({ message: "user sign out successfully" });
        } catch (error) {
            res.json({ message: error || "something went wrong" });
        }
    }

    async signUpController(req: Request, res: Response) {
        try {
            const token = await userService.signUpService({
                email: req.body.email as string,
                password: req.body.password as string,
                username: req.body.username as string,
            });

            res.cookie("token", token, {
                httpOnly: true,
                maxAge: 86400000,
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                secure: process.env.NODE_ENV === "production"
            });

            res.json({ message: "sign up confirmed" });
        } catch (error) {
            res.json({ message: error || "something went wrong" });
        }
    }

    async showProfileController(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) throw new Error("user not found");

            const user = await userService.showProfileService(currentUserId);

            res.json({
                user_id: user._id,
                username: user.username,
                profile_picture: user.profile_picture
            });
        } catch (error: any) {
            res.json({ message: error || "something went wrong" });
        }
    }
}

const userController = new UserController();

export default userController;