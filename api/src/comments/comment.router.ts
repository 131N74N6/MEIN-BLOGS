import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import commentController from "./comment.controller";

const commentRouters = Router();

commentRouters.get("/show-all/:blog_id", verifyToken, commentController.showAllCommentsController);

commentRouters.get("/total/:blog_id", verifyToken, commentController.showCommentsTotalController);

commentRouters.post("/make/:blog_id", verifyToken, commentController.sendCommentController);

export default commentRouters;