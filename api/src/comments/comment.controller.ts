import commentService from "./comment.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Request, Response } from "express";
import { commentSchema, commentPaginationSchema } from "./comment.validation";
import { blogIdParamSchema } from "../blogs/blog.validation";

class CommentController {
    async sendCommentController(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const parsedBlog = blogIdParamSchema.safeParse(req.params);
            if (!parsedBlog.success) return res.status(400).json({ message: "invalid blog id" });

            const parsedComment = commentSchema.safeParse(req.body ?? {});
            if (!parsedComment.success) return res.status(400).json({ message: "invalid input" });

            await commentService.sendCommentService({
                blog_id: parsedBlog.data.blog_id,
                current_user_id: currentUserId,
                text: parsedComment.data
            });

            res.status(200).json({ message: "new comment added" });
        } catch (error) {
            res.json({ message: error || "something went wrong" });
        }
    }

    async showAllCommentsController(req: Request, res: Response) {
        try {
            const parsedBlog = blogIdParamSchema.safeParse(req.params);
            if (!parsedBlog.success) return res.status(400).json({ message: "invalid blog id" });

            const parsedPagination = commentPaginationSchema.safeParse(req.query ?? {});
            if (!parsedPagination.success) return res.status(400).json({ message: "invalid pagination" });

            const comments = await commentService.getAllCommentsInOneBlog({
                blog_id: parsedBlog.data.blog_id, 
                limit: parsedPagination.data.limit, 
                skip: parsedPagination.data.skip
            });

            res.status(200).json(comments);
        } catch (error) {
            res.json({ message: error || "something went wrong" });
        }
    }

    async showCommentsTotalController(req: Request, res: Response) {
        try {
            const parsedBlog = blogIdParamSchema.safeParse(req.params);
            if (!parsedBlog.success) return res.status(400).json({ message: "invalid blog id" });

            const total = await commentService.getCommentsTotalInOneBlog(parsedBlog.data.blog_id);
            res.status(200).json(total);
        } catch (error) {
            res.json({ message: error || "something went wrong" });
        }
    }
}

const commentController = new CommentController();

export default commentController;