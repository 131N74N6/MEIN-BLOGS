import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import viewerController from "./viewer.controller";

const viewerRouters = Router();

viewerRouters.get("/has-seen", verifyToken, viewerController.hasUserSeenThisBlog);

viewerRouters.get("/show-all/:blog_id", verifyToken, viewerController.getAllBlogViewers);

viewerRouters.get("/total/:blog_id", verifyToken, viewerController.getAllBlogViewersTotal);

viewerRouters.post("/blog/:blog_id", verifyToken, viewerController.seeOneBlog);

export default viewerRouters;