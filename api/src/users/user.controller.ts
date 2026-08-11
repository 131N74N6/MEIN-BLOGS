import userService from "./user.service";
import { errorHandling } from "../errors/api.error";
import { AuthRequest } from "../middlewares/auth.middleware";
import { changeUserSchema, signInSchema, signUpSchema } from "./user.validation";
import { Request, Response } from "express";

class UserController {
    async changeUserController(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const parsed = changeUserSchema.safeParse(req.body ?? {});
            if (!parsed.success) return res.status(400).json({ message: "invalid input" });

            const username = parsed.data.username;
            const newProfileImage: Express.Multer.File | undefined = req.file;

            if (!username && !newProfileImage) {
                return res.status(400).json({ message: "no profile data to update" });
            }

            await userService.changeUserService({
                currentUserId: currentUserId,
                username: username,
                selectedImage: newProfileImage
            });

            res.status(200).json({ message: "this user profile has changed" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async deleteOldProfileController(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            await userService.deleteCurrentUserOldProfile(currentUserId);

            res.status(200).json({ message: "successfully delete old profile picture" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async deleteUserController(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });
            
            await userService.deleteUserService(currentUserId);

            res.status(200).json({ message: "successfully delete user" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async signInController(req: Request, res: Response) {
        try {
            const parsed = signInSchema.safeParse(req.body ?? {});
            if (!parsed.success) return res.status(400).json({ message: "invalid input" });

            const signInToken = await userService.signInService(parsed.data);

            res.cookie("token", signInToken, {
                httpOnly: true,
                maxAge: 86400000,
                path: "/",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                secure: process.env.NODE_ENV === "production"
            });

            res.status(200).json({ message: "sign in success" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async signOutController(_: Request, res: Response) {
        try {
            res.clearCookie("token", {
                httpOnly: true,
                path: "/",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                secure: process.env.NODE_ENV === "production"
            });

            res.status(200).json({ message: "user sign out successfully" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async signUpController(req: Request, res: Response) {
        try {
            const parsed = signUpSchema.safeParse(req.body ?? {});
            if (!parsed.success) return res.status(400).json({ message: "invalid input" });

            const token = await userService.signUpService(parsed.data);

            res.cookie("token", token, {
                httpOnly: true,
                maxAge: 86400000,
                path: "/",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                secure: process.env.NODE_ENV === "production"
            });

            res.status(200).json({ message: "sign up confirmed" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async showProfileController(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const user = await userService.showProfileService(currentUserId);

            res.status(200).json({
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