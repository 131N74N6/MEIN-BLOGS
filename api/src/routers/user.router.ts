import { Router } from "express";
import { authRateLimiter, verifyToken } from "../middlewares/auth.middleware";
import userController from "../controllers/user.controller";
import { uploadFile } from "../middlewares/upload.middleware";

const userRouters = Router();

userRouters.delete("/rm", verifyToken, userController.deleteUserController);

userRouters.delete("/rm-picture", verifyToken, userController.deleteOldProfileController);

userRouters.get("/show", verifyToken, userController.showProfileController);

userRouters.post("/sign-in", authRateLimiter, userController.signInController);

userRouters.post("/sign-out", verifyToken, userController.signOutController);

userRouters.post("/sign-up", authRateLimiter, userController.signUpController);

userRouters.put("/remake", verifyToken, uploadFile, userController.changeUserController);

export default userRouters;