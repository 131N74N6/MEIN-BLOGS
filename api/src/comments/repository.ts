import { ObjectId } from "mongodb";
import { db } from "../mongodb/service";
import { TComment } from "./model";

class CommentRepository {
    private comments = db().collection("comments");
    private users = db().collection("user");

    async createComment(new_comment: TComment["add"]) {
        const user = await this.users.find(
            { _id: new ObjectId(new_comment.user_id) },
            { projection: { image: 1, name: 1, _id: 1 }}
        ).toArray();

        return await this.comments.insertOne({
            blog_id: new ObjectId(new_comment.blog_id),
            blog_owner_id: new ObjectId(new_comment.blog_owner_id),
            profile_picture: user[0].image || null,
            created_at: new Date(),
            user_id: new ObjectId(user[0]._id),
            username: user[0].username,
            text: new_comment.text,
        });
    }

    async getAllCommentsInOneBlog(config: Omit<TComment["pagination"], "page">) {
        const comments = await this.comments.find(
            { blog_id: new ObjectId(config.blog_id) }, { projection: { blog_id: 0, blog_owner_id: 0 }}
        )
        .limit(config.limit)
        .skip(config.skip)
        .toArray();

        return comments;
    }

    async getCommentsTotalInOneBlog(blogId: string) {
        const comments = await this.comments.find({ blog_id: new ObjectId(blogId) }).toArray();
        const total = comments.length;
        return total;
    }
}

const commentRepository = new CommentRepository();

export default commentRepository;