import { TComment } from "./model";
import commentService from "./service";

class CommentController {
    async createComment(new_comment: TComment["add"]) {
        await commentService.createComment({
            blog_id: new_comment.blog_id,
            blog_owner_id: new_comment.blog_owner_id,
            user_id: new_comment.user_id,
            text: new_comment.text
        });

        return { message: "new comment added", success: true };
    }

    async getAllCommentsInOneBlog(query: Omit<TComment["pagination"], "skip">) {
        const page = query.page;
        const limit = query.limit;
        const skip = (page - 1) * limit;

        const comments = await commentService.getAllCommentsInOneBlog({
            blog_id: query.blog_id, limit: limit, skip: skip
        });

        return { data: comments, success: true };
    }

    async getCommentsTotalInOneBlog(blog_id: string) {
        const total = await commentService.getCommentsTotalInOneBlog(blog_id);
        return { data: total, success: true};
    }
}

const commentController = new CommentController();

export default commentController;