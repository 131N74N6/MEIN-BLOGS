import { Comments, NewCommentIntrf, ShowCommentIntrf } from "./comment.model";
import { Users } from "../users/user.model";

class CommentRepository {
    async createComment(props: NewCommentIntrf) {
        const user = await Users.find({ _id: props.current_user_id }).lean();

        return await Comments.insertOne({
            blog_id: props.blog_id,
            profile_picture: user[0].profile_picture,
            user_id: user[0]._id,
            username: user[0].username,
            text: props.text,
        });
    }

    async getAllCommentsInOneBlog(props: ShowCommentIntrf) {
        const comments = await Comments.find({ blog_id: props.blog_id })
        .limit(props.limit)
        .skip(props.skip)
        .lean();

        return comments;
    }

    async getCommentsTotalInOneBlog(blogId: string) {
        const comments = await Comments.find({ blog_id: blogId }).lean().countDocuments();
        return comments;
    }
}

const commentRepository = new CommentRepository();

export default commentRepository;