import { Router } from "express";
import { verifyProfilePicture, verifyToken } from "./user.middleware";
import userController from "./user.controller";

const userRouters = Router();

userRouters.delete("/rm", verifyToken, userController.deleteUser);

userRouters.delete("/rm-picture", verifyToken, userController.deleteOldProfile);

userRouters.get("/show", verifyToken, userController.showProfile);

userRouters.post("/sign-in", userController.signIn);

userRouters.post("/sign-out", verifyToken, userController.signOut);

userRouters.post("/sign-up", userController.signUp);

userRouters.put("/remake", verifyToken, verifyProfilePicture, userController.changeUser);

export default userRouters;