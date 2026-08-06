import { v2 } from "cloudinary";
import { Blogs, NewBlogIntrf, ShowAllBlogsIntrf, ShowAllUserBlogsIntrf } from "../models/blog.model";
import { uploadToCloudinary } from "../services/cloudinary.service";
import { generateBlogContent } from "../services/ai.service";
import { Users } from "../models/user.model";
import { Comments } from "../models/comment.model";

class BlogRepository {
    async createNewBlogRepository(props: NewBlogIntrf) {
        const user = await Users.find({ _id: props.current_user_id }).lean();

        const blogMedia = await uploadToCloudinary({
            file_buffer: props.media?.buffer!,
            foldername: "blogs_media",
            mimetype: props.media?.mimetype!,
            original_name: props.media?.originalname!,
        });

        const newBlog = new Blogs({
            blog_owner: user[0].username,
            blog_owner_id: user[0]._id,
            content: props.content,
            media: blogMedia,
            title: props.title
        });

        await newBlog.save();
    }

    async deleteAllBlogsRepository(currentUserId: string) {
        try {
            const blogs = await Blogs.find({ blog_owner_id: currentUserId });
            if (blogs.length === 0) throw new Error("blogs not found");

            const blogsIds = blogs.map(blog => blog._id);
            const blogsMedia = blogs.map(blog => blog.media);
            
            const deleteFromCloudinary = blogsMedia.map(blogMedia => {
                return v2.uploader.destroy(blogMedia.public_id, { resource_type: blogMedia.resource_type });
            });

            await Promise.all([
                ...deleteFromCloudinary,
                Comments.deleteMany({ blog_id: { $in: blogsIds } }),
                Blogs.deleteMany({ blog_owner_id: currentUserId })
            ]);
        } catch (error) {
            throw error;
        }
    }

    async deleteBlogRepository(id: string) {
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

    async generateNewBlogRepository(props: Pick<NewBlogIntrf, 'language' | 'media' | 'title'>) {
        try {
            const generatedContent = await generateBlogContent({
                imageBuffer: props.media?.buffer!,
                language: props.language,
                mimeType: props.media?.mimetype!,
                title: props.title,
            });

            return generatedContent;
        } catch (error) {
            throw error;    
        }
    }

    async showAllBlogsRepository(props: ShowAllBlogsIntrf) {
        const blogs = await Blogs.find()
        .limit(props.limit)
        .skip(props.skip)
        .lean();
        
        return blogs;
    }

    async showAllUserBlogsRepository(props: ShowAllUserBlogsIntrf) {
        const blogs = await Blogs.find({ blog_owner_id: props.current_user_id })
        .limit(props.limit)
        .skip(props.skip)
        .lean();

        return blogs;
    }
}

const blogRepository = new BlogRepository();

export default blogRepository;