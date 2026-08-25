import { ObjectId } from "mongodb";
import { db } from "../mongodb/service";
import { TViewer } from "./model";

class ViewerRepository {
    private blogs = db().collection("blogs");
    private users = db().collection("user");
    private viewers = db().collection("viewers");

    async hasUserSeenThisBlog(props: Pick<TViewer["data"], "blog_id" | "user_id">) {
        const user = await this.viewers.find({ 
            blog_id: new ObjectId(props.blog_id), user_id: new ObjectId(props.user_id) 
        }).toArray();

        const hasSeen = user.length > 0 ? true : false;
        return hasSeen;
    }

    async getAllBlogViewers(query: Omit<TViewer["pagination"], "page">) {
        return await this.viewers.find(
            { blog_id: new ObjectId(query.blog_id) }, { projection: { _id: 0, blog_id: 0 }}
        )
        .limit(query.limit)
        .skip(query.skip)
        .toArray();
    }

    async getAllBlogViewersTotal(params: Pick<TViewer["data"], "blog_id">) {
        const viewer = await this.viewers.find({ blog_id: new ObjectId(params.blog_id) }).toArray();
        return viewer.length;
    }

    async seeOneBlog(props: Omit<TViewer["data"], "created_at" | "username" | "profile_picture">) {
        const blog = await this.blogs.find({ _id: new ObjectId(props.blog_id) }).toArray();

        const user = await this.users.find(
            { _id: new ObjectId(props.user_id) }, 
            { projection: { password: 0, email: 0 }}
        ).toArray();

        return await this.viewers.insertOne({
            created_at: new Date(),
            blog_id: blog[0]._id, 
            user_id: user[0]._id, 
            username: user[0].username,
            profile_picture: user[0].profile_picture
        });
    }
}

const viewerRepository = new ViewerRepository();

export default viewerRepository;