import { TBlogs } from "./model";
import { db } from "../mongodb/service";
import { ObjectId } from "mongodb";

class BlogRepository {
    private blogs = db().collection("blogs");
    private comments = db().collection("comments");
    private viewers = db().collection("viewers");
    private users = db().collection("user");

    async changeOneBlog(props: Omit<TBlogs["change_result"], "updated_at">) {
        return await this.blogs.updateOne({ _id: new ObjectId(props._id) }, {
            $set: {
                content: props.content,
                language: props.language,
                media: props.media,
                title: props.title,
                updated_at: new Date()
            }
        });
    }

    async createNewBlog(props: Omit<TBlogs["add_result"], "blog_owner_name" | "blog_owner_profile_picture" | "created_at" | "updated_at">) {
        const user = await this.users.find(
            { _id: new ObjectId(props.blog_owner_id) }, 
            { projection: { password: 0, profile_picture: 0 }}
        ).toArray();

        return await this.blogs.insertOne({
            blog_owner_name: user[0].username,
            blog_owner_profile_picture: user[0].profile_picture,
            blog_owner_id: user[0]._id,
            content: props.content,
            created_at: new Date(),
            media: props.media,
            title: props.title,
            updated_at: new Date(),
        });
    }

    async deleteAllBlogs(blogs_ids: string[], current_user_id: string) {
        return await Promise.all([
            this.viewers.deleteMany({ blog_id: { $in: blogs_ids } }),
            this.comments.deleteMany({ blog_id: { $in: blogs_ids } }),
            this.blogs.deleteMany({ blog_owner_id: current_user_id })
        ]);
    }

    async deleteChosenBlog(blogs_ids: string[]) {
        const ids = blogs_ids.map(id => new ObjectId(id));

        return await Promise.all([
            this.viewers.deleteMany({ blog_id: { $in: ids } }),
            this.comments.deleteMany({ blog_id: { $in: ids } }),
            this.blogs.deleteOne({ _id: { $in: ids } })
        ]);
    }

    async getAllCurrentUserBlogs(currentUserId: string) {
        return await this.blogs.find({ blog_owner_id: currentUserId }).toArray();
    }

    async getChosenCurrentUserBlogs(blogs_ids: string[]) {
        const ids = blogs_ids.map(id => new ObjectId(id));
        return await this.blogs.find({ _id: { $in: ids } }).toArray();
    }

    async getAllCurrentUserBlogsWithPagination(page: Omit<TBlogs["pagination"], "page">) {
        return await this.blogs.find({ blog_owner_id: new ObjectId(page.blog_owner_id) })
        .limit(page.limit)
        .skip(page.skip)
        .toArray();
    }

    async getAllBlogsWithPagination(page: Omit<TBlogs["pagination"], "blog_owner_id" | "page">) {
        return await this.blogs.find({})
        .limit(page.limit)
        .skip(page.skip)
        .toArray();
    }

    async getBlogContentById(blog_id: string) {
        return await this.blogs.findOne({ _id: new ObjectId(blog_id) });
    }
}

const blogRepository = new BlogRepository();

export default blogRepository;