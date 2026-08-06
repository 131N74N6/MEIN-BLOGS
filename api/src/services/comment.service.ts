import { IComment, ShowCommentIntrf } from "../models/comment.model";
import commentRepository from "../repositories/comment.repository";

class CommentService {
    async sendCommentService(props: Pick<IComment, "blog_id" | "text" | "user_id">) {
        try {
            if (!props.text) throw new Error("all fields are required");
            await commentRepository.sendCommentRepository(props);
        } catch (error) {
            throw error;
        }
    }

    async showAllCommentsService(props: ShowCommentIntrf) {
        return await commentRepository.showAllCommentsRepository(props);
    }

    async showCommentsTotalService(blogId: string) {
        return await commentRepository.showCommentsTotalRepository(blogId);
    }
}

const commentService = new CommentService();

export default commentService;