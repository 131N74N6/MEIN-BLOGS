import { TBlogs } from "./model";
import blogService from "./service";

class BlogController {
    async changeOneBlog(body: Omit<TBlogs["change_raw"], "updated_at">) {
        const updated_at = new Date();

        await blogService.changeOneBlog({
            _id: body._id,
            blog_owner_id: body.blog_owner_id,
            content: body.content,
            language: body.language,
            media: body.media,
            title: body.title,
            updated_at: updated_at
        });

        return { message: "one blog changed", success: true };
    }

    async createNewBlog(body: Omit<TBlogs["add_raw"], "created_at" | "updated_at" | "blog_owner_name" | "blog_owner_profile_picture">) {
        const created_at = new Date();
        const updated_at = created_at;

        await blogService.createNewBlog({
            content: body.content,
            created_at: created_at,
            blog_owner_id: body.blog_owner_id,
            language: body.language,
            media: body.media,
            title: body.title,
            updated_at: updated_at
        });

        return { message: "new blog created", success: true };
    }

    async deleteAllBlogs(current_user_id: string) {
        await blogService.deleteAllBlogs(current_user_id);
        return { message: "all of your blogs has been deleted", success: true };
    }

    async deleteChosenBlogs(blogs_ids: string[], current_user_id: string) {
        await blogService.deleteChosenBlogs(blogs_ids, current_user_id);
        return { message: "blog deleted", success: true };
    }

    async generateNewBlog(body: TBlogs["generate"]) {
        const newGeneratedBlog = await blogService.generateNewBlog({
            language: body.language, title: body.title
        });

        return { message: newGeneratedBlog.contents, success: true };
    }

    async getAllBlogs(query: Omit<TBlogs["pagination"], "skip" | "blog_owner_id">) {
        const page = query.page;
        const limit = query.limit;
        const skip = (page - 1) * limit;

        const blogs = await blogService.getAllBlogs({ limit: limit, skip: skip });

        return blogs;
    }

    async getAllUserBlogs(query: Omit<TBlogs["pagination"], "skip">) {
        const page = query.page;
        const limit = query.limit;
        const skip = (page - 1) * limit;

        const blogs = await blogService.getAllCurrentUserBlogs({
            blog_owner_id: query.blog_owner_id, limit: limit, skip: skip
        });

        return blogs;
    }

    async getBlogContentById(id: string) {
        const blogContent = await blogService.getBlogContentById(id);
        return blogContent;
    }
}

const blogController = new BlogController();

export default blogController;