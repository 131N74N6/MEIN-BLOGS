import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import userController from "./user.controller";
import { uploadFile } from "../middlewares/upload.middleware";

const userRouters = Router();

userRouters.delete("/rm", verifyToken, userController.deleteUserController);

userRouters.delete("/rm-picture", verifyToken, userController.deleteOldProfileController);

userRouters.get("/show", verifyToken, userController.showProfileController);

userRouters.post("/sign-in", userController.signInController);

userRouters.post("/sign-out", verifyToken, userController.signOutController);

userRouters.post("/sign-up", userController.signUpController);

userRouters.put("/remake", verifyToken, uploadFile, userController.changeUserController);

export default userRouters;