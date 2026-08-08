import { AuthRequest } from "../middlewares/auth.middleware";
import { errorHandling } from "../errors/api.error";
import { Request, Response } from "express";
import {
    blogPaginationSchema,
    blogIdParamSchema,
    createBlogSchema,
    generateBlogSchema
} from "../validations/blog.validation";
import blogService from "../services/blog.service";

class BlogController {
    async createNewBlogController(req: AuthRequest, res: Response) {
        try {
            const blogImage: Express.Multer.File | undefined = req.file;
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const parsed = createBlogSchema.safeParse(req.body ?? {});
            if (!parsed.success) return res.status(400).json({ message: "invali input" });

            await blogService.createNewBlogService({
                content: parsed.data.content,
                current_user_id: currentUserId,
                language: parsed.data.language,
                media: blogImage,
                title: parsed.data.title
            });

            res.status(200).json({ message: "new blog created" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async deleteAllBlogsController(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });
            
            await blogService.deleteAllBlogsService(currentUserId);

            res.status(200).json({ message: "all of your blogs has been deleted" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async deleteOneBlogController(req: AuthRequest, res: Response) {
        try {
            const parsed = blogIdParamSchema.safeParse(req.params ?? {});
            if (!parsed.success) return res.status(400).json({ message: "invalid blog id" });

            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            await blogService.deleteOneBlogService(currentUserId, parsed.data.blog_id);
            res.status(200).json({ message: "blog deleted" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async generateNewBlogController(req: Request, res: Response) {
        try {
            const parsed = generateBlogSchema.safeParse(req.body ?? {});
            const blogImage: Express.Multer.File | undefined = req.file;

            if (!parsed.success) return res.status(400).json({ message: "invalid input" });

            const generatedBlog = await blogService.generateNewBlogService({
                media: blogImage,
                language: parsed.data.language,
                title: parsed.data.title
            });

            res.status(200).json({ message: generatedBlog.contents });
        } catch (error) {
            res.json({ message: error })
        }
    }

    async getAllBlogsController(req: Request, res: Response) {
        try {
            const parsed = blogPaginationSchema.safeParse(req.query ?? {});
            if (!parsed.success) return res.status(400).json({ message: "invalid pagination" });

            const blogs = await blogService.getAllBlogsService({
                limit: parsed.data.limit, skip: parsed.data.skip
            });

            res.status(200).json(blogs);
        } catch (error) {
            res.json({ message: "something went wrong" });
        }
    }

    async getAllUserBlogsController(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const parsed = blogPaginationSchema.safeParse(req.query ?? {});
            if (!parsed.success) return res.status(400).json({ message: "invalid pagination" });

            const blogs = await blogService.getAllCurrentUserBlogsService({
                current_user_id: currentUserId, limit: parsed.data.limit, skip: parsed.data.skip
            });

            res.status(200).json(blogs);
        } catch (error) {
            res.json({ message: "something went wrong" });
        }
    }

    async getBlogContentByIdController(req: Request, res: Response) {
        try {
            const parsed = blogIdParamSchema.safeParse(req.params ?? {});
            if (!parsed.success) return res.status(400).json({ message: "invalid blog id" });

            const blogContent = await blogService.getBlogContentByIdService(parsed.data.blog_id);
            if (!blogContent) throw new Error("blog not found");
            
            res.status(200).json(blogContent);
        } catch (error) {
            return errorHandling(res, error);
        }
    }
}

const blogController = new BlogController();

export default blogController;