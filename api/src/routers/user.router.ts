import { Router } from "express";
import { authRateLimiter, verifyToken } from "../middlewares/auth.middleware";
import userController from "../controllers/user.controller";

const userRouters = Router();

userRouters.delete("/rm", verifyToken, userController.deleteUserController);

userRouters.delete("/rm-picture", verifyToken, userController.deleteOldProfileController);

userRouters.get("/show", verifyToken, userController.showProfileController);

userRouters.post("/sign-in", authRateLimiter, userController.signInController);

userRouters.post("/sign-out", userController.signOutController);

userRouters.post("/sign-up", authRateLimiter, userController.signUpController);

userRouters.post("/remake", userController.changeUserController);

export default userRouters;