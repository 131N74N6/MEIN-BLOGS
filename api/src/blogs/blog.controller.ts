import { AuthRequest } from "../middlewares/auth.middleware";
import { errorHandling } from "../errors/api.error";
import { Request, Response } from "express";
import {
    blogPaginationSchema,
    blogIdParamSchema,
    createBlogSchema,
    generateBlogSchema
} from "../blogs/blog.validation";
import blogService from "./blog.service";

class BlogController {
    async createNewBlog(req: AuthRequest, res: Response) {
        try {
            const blogImage: Express.Multer.File | undefined = req.file;
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const parsed = createBlogSchema.safeParse(req.body ?? {});
            if (!parsed.success) return res.status(400).json({ message: "invali input" });

            await blogService.createNewBlog({
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

    async deleteAllBlogs(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });
            
            await blogService.deleteAllBlogs(currentUserId);

            res.status(200).json({ message: "all of your blogs has been deleted" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async deleteOneBlog(req: AuthRequest, res: Response) {
        try {
            const parsed = blogIdParamSchema.safeParse(req.params ?? {});
            if (!parsed.success) return res.status(400).json({ message: "invalid blog id" });

            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            await blogService.deleteOneBlog(currentUserId, parsed.data.blog_id);
            res.status(200).json({ message: "blog deleted" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async generateNewBlog(req: Request, res: Response) {
        try {
            const parsed = generateBlogSchema.safeParse(req.body ?? {});
            const blogImage: Express.Multer.File | undefined = req.file;

            if (!parsed.success) return res.status(400).json({ message: "invalid input" });

            const generatedBlog = await blogService.generateNewBlog({
                media: blogImage,
                language: parsed.data.language,
                title: parsed.data.title
            });

            res.status(200).json({ message: generatedBlog.contents });
        } catch (error) {
            res.json({ message: error })
        }
    }

    async getAllBlogs(req: Request, res: Response) {
        try {
            const parsed = blogPaginationSchema.safeParse(req.query ?? {});
            if (!parsed.success) return res.status(400).json({ message: "invalid pagination" });

            const blogs = await blogService.getAllBlogs({
                limit: parsed.data.limit, skip: parsed.data.skip
            });

            res.status(200).json(blogs);
        } catch (error) {
            res.json({ message: "something went wrong" });
        }
    }

    async getAllUserBlogs(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const parsed = blogPaginationSchema.safeParse(req.query ?? {});
            if (!parsed.success) return res.status(400).json({ message: "invalid pagination" });

            const blogs = await blogService.getAllCurrentUserBlogs({
                current_user_id: currentUserId, limit: parsed.data.limit, skip: parsed.data.skip
            });

            res.status(200).json(blogs);
        } catch (error) {
            res.json({ message: "something went wrong" });
        }
    }

    async getBlogContentById(req: Request, res: Response) {
        try {
            const parsed = blogIdParamSchema.safeParse(req.params ?? {});
            if (!parsed.success) return res.status(400).json({ message: "invalid blog id" });

            const blogContent = await blogService.getBlogContentById(parsed.data.blog_id);
            if (!blogContent) return res.status(404).json({ message: "blog not found" });
            
            res.status(200).json(blogContent);
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async getBlogViewerByPagination(req: Request, res: Response) {
        try {
            const blog = blogIdParamSchema.safeParse(req.params ?? {});
            if (!blog.success) return res.status(400).json({ message: "invalid blog id" });

            const pagination = blogPaginationSchema.safeParse(req.query ?? {});
            if (!pagination.success) return res.status(400).json({ message: "invalid pagination" });

            const blogViewers = await blogService.getBlogViewerWithPagination({ 
                blog_id: blog.data.blog_id, limit: pagination.data.limit, skip: pagination.data.skip
            });

            res.status(200).json(blogViewers);
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async getBlogViewerTotal(req: Request, res: Response) {
        try {
            const parsed = blogIdParamSchema.safeParse(req.params ?? {});
            if (!parsed.success) return res.status(400).json({ message: "invalid blog id" });

            const total = await blogService.getBlogViewerTotal(parsed.data.blog_id);
            res.status(200).json(total);
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async updateBlogView(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const parsed = blogIdParamSchema.safeParse(req.params ?? {});
            if (!parsed.success) return res.status(400).json({ message: "invalid blog id" });

            await blogService.updateBlogView(parsed.data.blog_id, currentUserId);

            res.status(200).json({ message: "blog view updated" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }
}

const blogController = new BlogController();

export default blogController;