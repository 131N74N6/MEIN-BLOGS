import commentService from "../services/comment.service";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Request, Response } from "express";

class CommentController {
    async sendCommentController(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            const blogIdParam = req.params.blog_id;
            const blogId = Array.isArray(blogIdParam) ? blogIdParam[0] : blogIdParam;

            await commentService.sendCommentService({
                blog_id: blogId,
                current_user_id: currentUserId!,
                text: req.body.text as string
            });

            res.json({ message: "new comment added" });
        } catch (error) {
            res.json({ message: error || "something went wrong" });
        }
    }

    async showAllCommentsController(req: Request, res: Response) {
        try {
            const blogIdParam = req.params.blog_id;
            const stringBlogId = Array.isArray(blogIdParam) ? blogIdParam[0] : blogIdParam;

            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 16;
            const skip = (page - 1) * limit;

            const comments = await commentService.getAllCommentsInOneBlog({
                blog_id: stringBlogId, limit: limit, skip: skip
            });

            res.json(comments);
        } catch (error) {
            res.json({ message: error || "something went wrong" });
        }
    }

    async showCommentsTotalController(req: Request, res: Response) {
        try {
            const blogIdParam = req.params.blog_id;
            const stringBlogId = Array.isArray(blogIdParam) ? blogIdParam[0] : blogIdParam;

            const total = await commentService.getCommentsTotalInOneBlog(stringBlogId);
            res.json(total);
        } catch (error) {
            res.json({ message: error || "something went wrong" });
        }
    }
}

const commentController = new CommentController();

export default commentController;