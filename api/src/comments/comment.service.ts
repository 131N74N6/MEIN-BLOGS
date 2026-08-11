import commentRepository from "./comment.repository";
import mongoose from "mongoose";
import { NewCommentIntrf, ShowCommentIntrf } from "./comment.model";
import { ApiError } from "../errors/api.error";

class CommentService {
    private assertObjectId(id: unknown, fieldName: string): string {
        if (typeof id !== "string" || !mongoose.isValidObjectId(id)) {
            throw new ApiError(400, `invalid ${fieldName}`);
        }

        return id;
    }

    private assertText(value: unknown, min: number): string {
        if (value === undefined || value === null || value === "" || typeof value !== "string") {
            throw new ApiError(400, "invalid text");
        }

        const trimmed = value.trim();
        if (trimmed.length < min) throw new ApiError(400, "invalid text");

        return trimmed;
    }

    async sendCommentService(props: NewCommentIntrf) {
        const blogId = this.assertObjectId(props.blog_id, "blog id");
        const currentUserId = this.assertObjectId(props.current_user_id, "current user id");
        const commentText = this.assertText(props.text, 1);
        
        await commentRepository.createComment({
            blog_id: blogId, current_user_id: currentUserId, text: commentText
        });
    }

    async getAllCommentsInOneBlog(props: ShowCommentIntrf) {
        const blogId = this.assertObjectId(props.blog_id, "blog id");
        
        return await commentRepository.getAllCommentsInOneBlog({
            blog_id: blogId, limit: props.limit, skip: props.skip
        });
    }

    async getCommentsTotalInOneBlog(blog_id: string) {
        const blogId = this.assertObjectId(blog_id, "blog id");
        return await commentRepository.getCommentsTotalInOneBlog(blogId);
    }
}

const commentService = new CommentService();

export default commentService;