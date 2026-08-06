import { Comments, IComment } from "../models/comment.model";

class CommentRepository {
    async sendComment(props: IComment) {
        try {
            if (!props.text) throw new Error("all fields are required");
            
            const newComment = new Comments({
                blog_id: props.blog_id,
                profile_picture: props.profile_picture,
                user_id: props.user_id,
                username: props.username,
                text: props.text,
            });

            await newComment.save();
        } catch (error) {
            throw error;
        }
    }

    async showAllComments(blogId: string) {
        const comments = await Comments.find({ blog_id: blogId });
        return comments;
    }
}

const commentRepository = new CommentRepository();

export default commentRepository;