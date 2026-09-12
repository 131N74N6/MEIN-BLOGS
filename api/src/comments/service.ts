import { ObjectId } from "mongodb";
import commentRepository from "./repository";
import { TComment } from "./model";
import { BlogApiError } from "../error/service";

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
        const blogId = this.checkIsIdValid(new_comment.blog_id, "blog");
        const blogOwnerId = this.checkIsIdValid(new_comment.blog_owner_id, "blog owner");
        const commentText = this.checkIsInputValid(new_comment.text, 1);

        await commentRepository.createComment({
            blog_id: blogId, 
            blog_owner_id: blogOwnerId,
            text: commentText,
            user_id: new_comment.user_id
        });
    }

    async getAllCommentsInOneBlog(config: Omit<TComment["pagination"], "page">) {
        const blogId = this.checkIsIdValid(config.blog_id, "blog");
        
        return await commentRepository.getAllCommentsInOneBlog({
            blog_id: blogId, limit: config.limit, skip: config.skip
        });
    }

    async getCommentsTotalInOneBlog(blog_id: string) {
        const blogId = this.checkIsIdValid(blog_id, "blog");
        return await commentRepository.getCommentsTotalInOneBlog(blogId);
    }

    async getReceivedCommentsTotalForCurrentUser(blog_owner_id: string) {
        const owner_id = this.checkIsIdValid(blog_owner_id, "blog owner")
        const total = await commentRepository.getReceivedCommentsTotalForCurrentUser(owner_id);
        return total;
    }
}

const commentService = new CommentService();

export default commentService;