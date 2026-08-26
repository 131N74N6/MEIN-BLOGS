import { ObjectId } from "mongodb";
import commentRepository from "./repository";
import { TComment } from "./model";
import { BlogApiError } from "../error/message";

class CommentService {
    private checkIsIdValid(value: unknown, fieldName: string) {
        const isNotValid = !value || value === "" || typeof value !== "string" || !ObjectId.isValid(value);
        if (isNotValid) throw new BlogApiError(400, `invalid ${fieldName}`);

        return value;
    }

    private checkIsInputValid(value: unknown, min: number) {
        if (!value || value === "" || typeof value !== "string") throw new BlogApiError(400, "invalid text");

        const trimmed = value.trim();
        if (trimmed.length < min) throw new BlogApiError(400, "invalid text");

        return trimmed;
    }

    async createComment(new_comment: TComment["add"]) {
        const blogId = this.checkIsIdValid(new_comment.blog_id, "blog id");
        const currentUserId = this.checkIsIdValid(new_comment.blog_owner_id, "current user id");
        const commentText = this.checkIsInputValid(new_comment.text, 1);
        
        const created_at = new Date();

        await commentRepository.createComment({
            blog_id: blogId, 
            blog_owner_id: currentUserId,
            text: commentText,
            user_id: new_comment.user_id
        });
    }

    async getAllCommentsInOneBlog(config: Omit<TComment["pagination"], "page">) {
        const blogId = this.checkIsIdValid(config.blog_id, "blog id");
        
        return await commentRepository.getAllCommentsInOneBlog({
            blog_id: blogId, limit: config.limit, skip: config.skip
        });
    }

    async getCommentsTotalInOneBlog(blog_id: string) {
        const blogId = this.checkIsIdValid(blog_id, "blog id");
        return await commentRepository.getCommentsTotalInOneBlog(blogId);
    }
}

const commentService = new CommentService();

export default commentService;