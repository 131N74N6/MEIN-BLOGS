import { AuthRequest } from "../middlewares/auth.middleware";
import { Request, Response } from "express";
import blogService from "../services/blog.service";

class BlogController {
    async createNewBlogController(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            const blogImage: Express.Multer.File | undefined = req.file;

            await blogService.createNewBlogService({
                content: req.body.content as string,
                current_user_id: currentUserId!,
                language: req.body.language as string,
                media: blogImage,
                title: req.body.title as string
            });

            res.json({ message: "blog created" });
        } catch (error) {
            res.json({ message: error });
        }
    }

    async deleteAllBlogsController(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (currentUserId) await blogService.deleteAllBlogsService(currentUserId);

            res.json({ message: "all blogs deleted" });
        } catch (error) {
            res.json({ message: error });
        }
    }

    async deleteOneBlogController(req: Request, res: Response) {
        try {
            const blogIdParams = req.params.blog_id;
            const blogId = Array.isArray(blogIdParams) ? blogIdParams[0] : blogIdParams;

            await blogService.deleteOneBlogService(blogId);
            res.json({ message: "blog deleted" });
        } catch (error) {
            res.json({ message: error });
        }
    }

    async generateNewBlogController(req: Request, res: Response) {
        try {
            const blogImage: Express.Multer.File | undefined = req.file;

            const generatedBlog = await blogService.generateNewBlogService({
                media: blogImage,
                language: req.body.language as string,
                title: req.body.title as string
            });

            res.json({ message: generatedBlog.contents });
        } catch (error) {
            res.json({ message: error })
        }
    }

    async getAllBlogsController(req: Request, res: Response) {
        try {
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 16;
            const skip = (page - 1) * limit;

            const blogs = await blogService.getAllBlogsService({
                limit: limit, skip: skip
            });

            res.json(blogs);
        } catch (error) {
            res.json({ message: "something went wrong" });
        }
    }

    async getAllUserBlogsController(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 16;
            const skip = (page - 1) * limit;

            const blogs = await blogService.getAllCurrentUserBlogsService({
                current_user_id: currentUserId!, limit: limit, skip: skip
            });

            res.json(blogs);
        } catch (error) {
            res.json({ message: "something went wrong" });
        }
    }

    async getBlogContentByIdController(req: Request, res: Response) {
        try {
            const blogIdParam = req.params.blog_id;
            const blogId = Array.isArray(blogIdParam) ? blogIdParam[0] : blogIdParam;

            const blogContent = await blogService.getBlogContentByIdService(blogId);
            if (!blogContent) throw new Error("blog not found");
            
            res.json(blogContent);
        } catch (error) {
            res.json({ message: error });
        }
    }
}

const blogController = new BlogController();

export default blogController;