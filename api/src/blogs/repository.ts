import { TBlogs } from "./model";
import { db } from "../mongodb/service";
import { ObjectId } from "mongodb";

type TAddBlogResult = Omit<TBlogs["add_result"], "_id" | "blog_owner_name" | "blog_owner_profile_picture">;

class BlogRepository {
    private blogs = db().collection("blogs");
    private comments = db().collection("comments");
    private views = db().collection("views");
    private users = db().collection("user");

    async createNewBlog(props: TAddBlogResult) {
        const user = await this.users.find(
            { _id: props.blog_owner_id }, 
            { projection: { password: 0, profile_picture: 0 }}
        ).toArray();

        return await this.blogs.insertOne({
            blog_owner_name: user[0].username,
            blog_owner_profile_picture: user[0].profile_picture,
            blog_owner_id: user[0]._id,
            content: props.content,
            created_at: props.created_at,
            media: props.media,
            title: props.title,
            updated_at: props.updated_at
        });
    }

    async changeOneBlog(props: TBlogs["change_result"]) {
        return await this.blogs.updateOne({ _id: props._id }, {
            $set: {
                content: props.content,
                language: props.language,
                media: props.media,
                title: props.title,
                updated_at: props.updated_at
            }
        });
    }

    async deleteAllBlogs(blogs_ids: ObjectId[], current_user_id: ObjectId) {
        return await Promise.all([
            this.views.deleteMany({ blog_id: { $in: blogs_ids } }),
            this.comments.deleteMany({ blog_id: { $in: blogs_ids } }),
            this.blogs.deleteMany({ blog_owner_id: current_user_id })
        ]);
    }

    async deleteChosenBlog(blogs_ids: ObjectId[]) {
        // const blogs_ids = blogsIds.map(id => new ObjectId(id));

        return await Promise.all([
            this.views.deleteMany({ blog_id: { $in: blogs_ids } }),
            this.comments.deleteMany({ blog_id: { $in: blogs_ids } }),
            this.blogs.deleteOne({ _id: { $in: blogs_ids } })
        ]);
    }

    async getAllCurrentUserBlogs(currentUserId: string) {
        return await this.blogs.find(
            { blog_owner_id: currentUserId },
            { projection: { 
                blog_owner_id: 0, 
                blog_owner_name: 0, blog_owner_profile_picture: 0, 
                viewers: 0 
            }}
        ).toArray();
    }

    async getChosenCurrentUserBlogs(blogs_ids: ObjectId[]) {
        return await this.blogs.find(
            { _id: { $in: blogs_ids } },
            { projection: {blog_owner_profile_picture: 0, blog_owner_name: 0, viewers: 0 }}
        ).toArray();
    }

    async getAllCurrentUserBlogsWithPagination(page: Omit<TBlogs["pagination"], "page">) {
        const blog_owner_id = new ObjectId(page.blog_owner_id);

        return await this.blogs.find(
            { blog_owner_id: blog_owner_id },
            { projection: { 
                blog_owner_id: 0, 
                blog_owner_name: 0, blog_owner_profile_picture: 0, 
                viewers: 0 
            }}
        )
        .limit(page.limit)
        .skip(page.skip)
        .toArray();
    }

    async getAllBlogsWithPagination(page: Omit<TBlogs["pagination"], "blog_owner_id" | "page">) {
        return await this.blogs.find(
            {},
            { projection: { 
                blog_owner_id: 0, 
                blog_owner_profile_picture: 0, 
                viewers: 0 
            }}
        )
        .limit(page.limit)
        .skip(page.skip)
        .toArray();
    }

    async getBlogById(blog_id: ObjectId) {
        return await this.blogs.findOne({ _id: blog_id });
    }
}

const blogRepository = new BlogRepository();

export default blogRepository;