import { Comments, IComment, ShowCommentIntrf } from "../models/comment.model";
import { Users } from "../models/user.model";

class CommentRepository {
    async sendCommentRepository(props: Pick<IComment, "blog_id" | "text" | "user_id">) {
        const user = await Users.find({ _id: props.user_id }).lean();

        const newComment = new Comments({
            blog_id: props.blog_id,
            profile_picture: user[0].profile_picture,
            user_id: user[0]._id,
            username: user[0].username,
            text: props.text,
        });

        await newComment.save();
    }

    async showAllCommentsRepository(props: ShowCommentIntrf) {
        const comments = await Comments.find({ blog_id: props.blog_id })
        .limit(props.limit)
        .skip(props.skip)
        .lean();

        return comments;
    }

    async showCommentsTotalRepository(blogId: string) {
        const comments = await Comments.find({ blog_id: blogId }).lean().countDocuments();
        return comments;
    }
}

const commentRepository = new CommentRepository();

export default commentRepository;