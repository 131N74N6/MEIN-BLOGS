import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import blogController from "../controllers/blog.controller";
import { uploadFile } from "../middlewares/upload.middleware";

const blogRouters = Router();

blogRouters.delete("/rm-all", verifyToken, blogController.deleteAllBlogsController);

blogRouters.delete("/rm/:blog_id", verifyToken, blogController.deleteOneBlogController);

blogRouters.get("/show-all", verifyToken, blogController.getAllBlogsController);

blogRouters.get("/show", verifyToken, blogController.getAllUserBlogsController);

blogRouters.get("/detail/:blog_id", verifyToken, blogController.getBlogContentByIdController);

blogRouters.post("/create", verifyToken, uploadFile, blogController.createNewBlogController);

blogRouters.post("/generate", verifyToken, blogController.generateNewBlogController);

export default blogRouters;