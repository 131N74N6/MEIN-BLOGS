import { v2 } from "cloudinary";
import { Blogs, NewBlogIntrf, ShowAllBlogsIntrf, ShowAllUserBlogsIntrf } from "../models/blog.model";
import { uploadToCloudinary } from "../services/cloudinary.service";
import { generateBlogContent } from "../services/ai.service";
import { Users } from "../models/user.model";

class BlogRepository {
    async createNewBlogRepository(props: NewBlogIntrf) {
        try {
            const allowedMedia = ["image/jpeg", "image/png", "image/webp", "image/avif"];
            if (!props.content && !props.media && !props.title) throw new Error("all fields are required");
            if (!props.content) throw new Error("pleasa provide content");
            if (!props.media) throw new Error("pleasa provide media");
            if (!props.title) throw new Error("pleasa provide title");
            if (!allowedMedia.includes(props.media.mimetype)) {
                throw new Error("only images are allowed such as .jpg, .jpeg, .png, .webp, and .avif");
            }

            const user = await Users.findOne({ _id: props.current_user_id }).lean();
            if (!user) throw new Error("user not found");

            const blogMedia = await uploadToCloudinary({
                file_buffer: props.media.buffer,
                foldername: "blogs_media",
                mimetype: props.media.mimetype,
                original_name: props.media.originalname,
            });

            const newBlog = new Blogs({
                blog_owner: user.username,
                blog_owner_id: user._id,
                content: props.content,
                media: blogMedia,
                title: props.title
            });

            await newBlog.save();
        } catch (error) {
            throw error;
        }
    }

    async deleteAllBlogsRepository(currentUserId: string) {
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
            const allowedMedia = ["image/jpeg", "image/png", "image/webp", "image/avif"];
            if (!props.media && !props.title) throw new Error("please provide image and title");
            if (!props.title) throw new Error("pleasa provide title");
            if (!props.media) throw new Error("pleasa provide media");
            if (!allowedMedia.includes(props.media.mimetype)) {
                throw new Error("only images are allowed such as .jpg, .jpeg, .png, .webp, and .avif");
            }
            const generatedContent = await generateBlogContent({
                imageBuffer: props.media.buffer,
                language: props.language,
                mimeType: props.media.mimetype,
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