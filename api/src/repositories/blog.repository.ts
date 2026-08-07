import { Blogs, NewBlogIntrf, ShowAllBlogsIntrf, ShowAllUserBlogsIntrf } from "../models/blog.model";
import { uploadToCloudinary } from "../services/cloudinary.service";
import { Users } from "../models/user.model";
import { Comments } from "../models/comment.model";

class BlogRepository {
    async createNewBlog(props: NewBlogIntrf) {
        const user = await Users.find(
            { _id: props.current_user_id }, 
            { password: 0, profile_picture: 0 }
        ).lean();

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

        return await newBlog.save();
    }

    async deleteAllBlogs(currentUserId: string) {
        return await Blogs.deleteMany({ blog_owner_id: currentUserId });
    }

    async deleteAllComments(blogsIds: string[]) {
        return await Comments.deleteMany({ blog_id: { $in: blogsIds } });
    }

    async deleteAllCommentsInOneBlog(blogId: string) {
        return await Comments.deleteMany({ blog_id: blogId });
    }

    async deleteOneBlog(id: string) {
        return await Blogs.deleteOne({ _id: id });
    }

    async getAllCurrentUserBlogs(currentUserId: string) {
        return await Blogs.find({ blog_owner_id: currentUserId }).lean();
    }

    async getAllCurrentUserBlogsWithPagination(props: ShowAllUserBlogsIntrf) {
        const blogs = await Blogs.find({ blog_owner_id: props.current_user_id })
        .limit(props.limit)
        .skip(props.skip)
        .lean();

        return blogs;
    }

    async getAllBlogsWithPagination(props: ShowAllBlogsIntrf) {
        const blogs = await Blogs.find()
        .limit(props.limit)
        .skip(props.skip)
        .lean();
        
        return blogs;
    }

    async getBlogById(id: string) {
        return await Blogs.findOne({ _id: id }).lean();
    }
}

const blogRepository = new BlogRepository();

export default blogRepository;