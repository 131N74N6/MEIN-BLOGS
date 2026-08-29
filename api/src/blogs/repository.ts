import { TBlogs } from "./model";
import { db } from "../mongodb/service";
import { ObjectId } from "mongodb";

class BlogRepository {
    private blogs = db().collection("blogs");
    private comments = db().collection("comments");
    private viewers = db().collection("viewers");
    private users = db().collection("user");

    private escapeRegex(text: string): string {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }

    async changeOneBlog(blog: TBlogs["change_result"]) {
        return await this.blogs.updateOne({ _id: new ObjectId(blog._id) }, {
            $set: {
                content: blog.content,
                language: blog.language,
                media: blog.media,
                title: blog.title,
                updated_at: new Date()
            }
        });
    }

    async createNewBlog(data: TBlogs["add_result"]) {
        const user = await this.users.find(
            { _id: new ObjectId(data.blog_owner_id) }, 
            { projection: { image: 1, name: 1, _id: 1 }}
        ).toArray();

        if (!user || user.length === 0) {
            throw new Error(`User dengan ID ${data.blog_owner_id} tidak ditemukan di database`);
        }

        return await this.blogs.insertOne({
            blog_owner_name: user[0].name,
            blog_owner_profile_picture: user[0].image || null,
            blog_owner_id: user[0]._id,
            content: data.content,
            created_at: new Date(),
            language: data.language,
            media: data.media,
            title: data.title,
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

    async getAllCurrentUserBlogs(user_id: string) {
        return await this.blogs.find({ blog_owner_id: new ObjectId(user_id) }).toArray();
    }

    async getChosenCurrentUserBlogs(blogs_ids: string[]) {
        const ids = blogs_ids.map(id => new ObjectId(id));
        return await this.blogs.find({ _id: { $in: ids } }).toArray();
    }

    async getAllBlogsWithPagination(page: Omit<TBlogs["pagination"], "blog_owner_id" | "page">) {
        if (page.title === undefined) {
            const blogs = await this.blogs.find({})
            .limit(page.limit)
            .skip(page.skip)
            .toArray();

            return blogs;
        } else {
            const safeTitleInput = this.escapeRegex(page.title);
            const regexPattern = new RegExp(safeTitleInput, 'i');

            const blogs = await this.blogs.find({ title: regexPattern })
            .limit(page.limit)
            .skip(page.skip)
            .toArray();

            return blogs
        }
    }

    async getAllCurrentUserBlogsWithPagination(page: Omit<TBlogs["pagination"], "page">) {
        if (page.title === undefined) {
            const blog = await this.blogs.find({ blog_owner_id: new ObjectId(page.blog_owner_id) })
            .limit(page.limit)
            .skip(page.skip)
            .toArray();

            return blog;
        } else {
            const safeTitleInput = this.escapeRegex(page.title);
            const regexPattern = new RegExp(safeTitleInput, 'i');
            
            const blog = await this.blogs.find({ 
                blog_owner_id: new ObjectId(page.blog_owner_id), title: regexPattern 
            })
            .limit(page.limit)
            .skip(page.skip)
            .toArray();

            return blog;
        }
    }

    async getBlogContentById(blog_id: string) {
        return await this.blogs.findOne({ _id: new ObjectId(blog_id) });
    }
}

const blogRepository = new BlogRepository();

export default blogRepository;