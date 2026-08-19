import blogController from "./blog.controller";
import { Router } from "express";
import { verifyToken } from "../users/user.middleware";
import { verifyBlogFile } from "./blog.middleware";

const blogRouters = Router();

blogRouters.delete("/rm-all", verifyToken, blogController.deleteAllBlogs);

blogRouters.delete("/rm-chosen", verifyToken, blogController.deleteChosenBlogs);

blogRouters.get("/show-all", blogController.getAllBlogs);

blogRouters.get("/mine/show-all", verifyToken, blogController.getAllUserBlogs);

blogRouters.get("/show/:blog_id", blogController.getBlogContentById);

blogRouters.post("/create", verifyToken, verifyBlogFile, blogController.createNewBlog);

blogRouters.post("/generate", verifyToken, blogController.generateNewBlog);

blogRouters.put("/remake/:blog_id", verifyToken, blogController.changeOneBlog);

export default blogRouters;