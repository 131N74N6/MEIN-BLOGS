import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import blogController from "./blog.controller";
import { uploadFile } from "../middlewares/upload.middleware";

const blogRouters = Router();

blogRouters.delete("/rm-all", verifyToken, blogController.deleteAllBlogs);

blogRouters.delete("/rm/:blog_id", verifyToken, blogController.deleteOneBlog);

blogRouters.get("/show-all", verifyToken, blogController.getAllBlogs);

blogRouters.get("/mine/show-all", verifyToken, blogController.getAllUserBlogs);

blogRouters.get("/show/:blog_id", verifyToken, blogController.getBlogContentById);

blogRouters.post("/create", verifyToken, uploadFile, blogController.createNewBlog);

blogRouters.post("/generate", verifyToken, blogController.generateNewBlog);

export default blogRouters;