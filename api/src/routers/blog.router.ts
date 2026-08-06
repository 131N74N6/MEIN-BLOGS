import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import blogController from "../controllers/blog.controller";

const blogRouters = Router();

blogRouters.delete("/rm-all", verifyToken, blogController.deleteAllBlogsController);

blogRouters.delete("/rm:blog_id", verifyToken, blogController.deleteBlogController);

blogRouters.get("/show-all", verifyToken, blogController.showAllBlogsController);

blogRouters.get("/show", verifyToken, blogController.showAllUserBlogsController);

blogRouters.post("/create", verifyToken, blogController.createNewBlogController);

blogRouters.post("/show-all", verifyToken, blogController.generateNewBlogController);

export default blogRouters;