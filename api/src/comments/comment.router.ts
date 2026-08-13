import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import commentController from "./comment.controller";

const commentRouters = Router();

commentRouters.get("/show-all/:blog_id", verifyToken, commentController.showAllComments);

commentRouters.get("/total/:blog_id", verifyToken, commentController.showCommentsTotal);

commentRouters.post("/make/:blog_id", verifyToken, commentController.sendComment);

export default commentRouters;