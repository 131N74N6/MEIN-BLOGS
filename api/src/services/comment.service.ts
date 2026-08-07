import { NewCommentIntrf, ShowCommentIntrf } from "../models/comment.model";
import commentRepository from "../repositories/comment.repository";

class CommentService {
    async sendCommentService(props: NewCommentIntrf) {
        try {
            if (!props.text) throw new Error("please fill this input");
            await commentRepository.createComment(props);
        } catch (error) {
            throw error;
        }
    }

    async getAllCommentsInOneBlog(props: ShowCommentIntrf) {
        return await commentRepository.getAllCommentsInOneBlog(props);
    }

    async getCommentsTotalInOneBlog(blogId: string) {
        return await commentRepository.getCommentsTotalInOneBlog(blogId);
    }
}

const commentService = new CommentService();

export default commentService;