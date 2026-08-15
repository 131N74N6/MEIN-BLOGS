import { AuthRequest } from "../users/user.middleware";
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
            const blogImage = req.file;

            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const createBlog = createBlogSchema.safeParse(req.body);
            if (!createBlog.success) return res.status(400).json({ message: "invali input" });

            await blogService.createNewBlog({
                content: createBlog.data.content,
                current_user_id: currentUserId,
                language: createBlog.data.language,
                media: blogImage,
                title: createBlog.data.title
            });

            return res.status(200).json({ message: "new blog created" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async changeOneBlog(req: AuthRequest, res: Response) {
        try {
            const blogImage = req.file;

            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const blogId = blogIdParamSchema.safeParse(req.params.blog_id);
            if (!blogId.success) return res.status(400).json({ message: "invalid blog id" });

            const createBlog = createBlogSchema.safeParse(req.body);
            if (!createBlog.success) return res.status(400).json({ message: "invali input" });

            await blogService.changeOneBlog(blogId.data, {
                content: createBlog.data.content,
                current_user_id: currentUserId,
                language: createBlog.data.language,
                media: blogImage,
                title: createBlog.data.title
            });
            return res.status(200).json({ message: "one blog changed" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async deleteAllBlogs(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });
            
            await blogService.deleteAllBlogs(currentUserId);

            return res.status(200).json({ message: "all of your blogs has been deleted" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async deleteOneBlog(req: AuthRequest, res: Response) {
        try {
            const blogId = blogIdParamSchema.safeParse(req.params.blog_id);
            if (!blogId.success) return res.status(400).json({ message: "invalid blog id" });

            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            await blogService.deleteOneBlog(currentUserId, blogId.data);
            return res.status(200).json({ message: "blog deleted" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async generateNewBlog(req: Request, res: Response) {
        try {
            const generatedBlog = generateBlogSchema.safeParse(req.body);
            if (!generatedBlog.success) return res.status(400).json({ message: "invalid input" });

            const newGeneratedBlog = await blogService.generateNewBlog({
                language: generatedBlog.data.language,
                title: generatedBlog.data.title
            });

            return res.status(200).json({ message: newGeneratedBlog.contents });
        } catch (error) {
            res.json({ message: error })
        }
    }

    async getAllBlogs(req: Request, res: Response) {
        try {
            const blogPagination = blogPaginationSchema.safeParse(req.query);
            if (!blogPagination.success) return res.status(400).json({ message: "invalid pagination" });

            const blogs = await blogService.getAllBlogs({
                limit: blogPagination.data.limit, skip: blogPagination.data.skip, 
            });

            return res.status(200).json(blogs);
        } catch (error) {
            res.json({ message: "something went wrong" });
        }
    }

    async getAllUserBlogs(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const blogPagination = blogPaginationSchema.safeParse(req.query);
            if (!blogPagination.success) return res.status(400).json({ message: "invalid pagination" });

            const blogs = await blogService.getAllCurrentUserBlogs({
                current_user_id: currentUserId, 
                limit: blogPagination.data.limit, 
                skip: blogPagination.data.skip
            });

            return res.status(200).json(blogs);
        } catch (error) {
            res.json({ message: "something went wrong" });
        }
    }

    async getBlogContentById(req: Request, res: Response) {
        try {
            const blogId = blogIdParamSchema.safeParse(req.params.blog_id);
            if (!blogId.success) return res.status(400).json({ message: "invalid blog id" });

            const blogContent = await blogService.getBlogContentById(blogId.data);
            if (!blogContent) return res.status(404).json({ message: "blog not found" });
            
            return res.status(200).json(blogContent);
        } catch (error) {
            return errorHandling(res, error);
        }
    }
}

const blogController = new BlogController();

export default blogController;