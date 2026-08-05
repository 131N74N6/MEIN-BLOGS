import { v2 } from "cloudinary";
import { Blogs } from "../models/blog.model";

class BlogRepository {
    async deleteAllBlogs(currentUserId: string) {
        try {
            const blogs = await Blogs.find({ blog_owner_id: currentUserId });
            if (blogs.length === 0) throw new Error("blogs not found");

            const blogsMedia = blogs.map(blog => blog.media);
            const deleteFromCloudinary = blogsMedia.map(blogMedia => {
                return v2.uploader.destroy(blogMedia.public_id, { resource_type: blogMedia.resource_type });
            });

            await Promise.all([
                ...deleteFromCloudinary,
                Blogs.deleteMany({ blog_owner_id: currentUserId })
            ]);
        } catch (error) {
            throw error;
        }
    }

    async deleteBlog(id: string) {
        try {
            const blog = await Blogs.findOne({ _id: id });
            if (!blog) throw new Error("blog not found");

            await Promise.all([
                v2.uploader.destroy(blog.media.public_id, { resource_type: blog.media.resource_type }),
                Blogs.deleteMany({ _id: blog._id })
            ]);
        } catch (error) {
            throw error;
        }
    }

    async showAllBlogs() {
        const blogs = await Blogs.find().lean();
        return blogs;
    }

    async showAllUserBlogs(currentUserId: string) {
        const blogs = await Blogs.find({ blog_owner_id: currentUserId }).lean();
        return blogs;
    }
}

const blogRepository = new BlogRepository();

export default blogRepository;