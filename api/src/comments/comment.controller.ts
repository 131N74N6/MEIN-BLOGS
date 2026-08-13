import commentService from "./comment.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Request, Response } from "express";
import { commentSchema, commentPaginationSchema } from "./comment.validation";
import { blogIdParamSchema } from "../blogs/blog.validation";
import { errorHandling } from "../errors/api.error";

class CommentController {
    async sendComment(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const blogId = blogIdParamSchema.safeParse(req.params);
            if (!blogId.success) return res.status(400).json({ message: "invalid blog id" });

            const newComment = commentSchema.safeParse(req.body ?? {});
            if (!newComment.success) return res.status(400).json({ message: "invalid input" });

            await commentService.sendComment({
                blog_id: blogId.data,
                current_user_id: currentUserId,
                text: newComment.data
            });

            return res.status(200).json({ message: "new comment added" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async showAllComments(req: Request, res: Response) {
        try {
            const blogId = blogIdParamSchema.safeParse(req.params);
            if (!blogId.success) return res.status(400).json({ message: "invalid blog id" });

            const commentPagination = commentPaginationSchema.safeParse(req.query ?? {});
            if (!commentPagination.success) return res.status(400).json({ message: "invalid pagination" });

            const comments = await commentService.getAllCommentsInOneBlog({
                blog_id: blogId.data, 
                limit: commentPagination.data.limit, 
                skip: commentPagination.data.skip
            });

            return res.status(200).json(comments);
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async showCommentsTotal(req: Request, res: Response) {
        try {
            const blogId = blogIdParamSchema.safeParse(req.params);
            if (!blogId.success) return res.status(400).json({ message: "invalid blog id" });

            const total = await commentService.getCommentsTotalInOneBlog(blogId.data);
            return res.status(200).json(total);
        } catch (error) {
            return errorHandling(res, error);
        }
    }
}

const commentController = new CommentController();

export default commentController;