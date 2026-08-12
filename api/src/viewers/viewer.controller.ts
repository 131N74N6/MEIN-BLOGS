import { Request, Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware";
import { errorHandling } from "../errors/api.error";
import { blogIdParamSchema } from "../blogs/blog.validation";
import viewerService from "./viewers.service";
import { viewerPaginationSchema } from "./viewers.validation";

class ViewerController {
    async hasUserSeenThisBlog(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const blogId = blogIdParamSchema.safeParse(req.params);
            if (!blogId.success) return res.status(400).json({ message: "invalid blog id" });

            const hasSeen = await viewerService.hasUserSeenThisBlog({
                blog_id: blogId.data, current_user_id: currentUserId
            });

            return res.status(200).json(hasSeen);
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async getAllBlogViewers(req: Request, res: Response) {
        try {
            const blogId = blogIdParamSchema.safeParse(req.params);
            if (!blogId.success) return res.status(400).json({ message: "invalid blog id" });

            const pagination = viewerPaginationSchema.safeParse(req.query);
            if (!pagination.success) return res.status(400).json({ message: "invalid pagination" });

            const viewers = await viewerService.getAllBlogViewers({ 
                blog_id: blogId.data, limit: pagination.data.limit, skip: pagination.data.skip
            });

            return res.status(200).json(viewers)
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async getAllBlogViewersTotal(req: Request, res: Response) {
        try {
            const blogId = blogIdParamSchema.safeParse(req.params);
            if (!blogId.success) return res.status(400).json({ message: "invalid blog id" });

            const total = await viewerService.getAllBlogViewersTotal({ blog_id: blogId.data });
            return res.status(200).json(total);
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async seeOneBlog(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const blogId = blogIdParamSchema.safeParse(req.params);
            if (!blogId.success) return res.status(400).json({ message: "invalid blog id" });

            await viewerService.seeOneBlog({ 
                blog_id: blogId.data, 
                current_user_id: currentUserId 
            });

            return res.status(200).json({ message: "successfully access blog" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }
}

const viewerController = new ViewerController();

export default viewerController;