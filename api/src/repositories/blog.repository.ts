import { Blogs, NewBlogIntrf, ShowAllBlogsIntrf, ShowAllUserBlogsIntrf } from "../models/blog.model";
import { uploadToCloudinary } from "../utils/cloudinary.utility";
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
            blog_owner_name: user[0].username,
            blog_owner_profile_picture: user[0].profile_picture,
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
        return await Blogs.find(
            { blog_owner_id: currentUserId },
            { blog_owner_id: 0, blog_owner_profile_picture: 0 }
        ).lean();
    }

    async getAllCurrentUserBlogsWithPagination(props: ShowAllUserBlogsIntrf) {
        return await Blogs.find(
            { blog_owner_id: props.current_user_id },
            { blog_owner_id: 0, blog_owner_profile_picture: 0 }
        )
        .limit(props.limit)
        .skip(props.skip)
        .lean();
    }

    async getAllBlogsWithPagination(props: ShowAllBlogsIntrf) {
        return await Blogs.find(
            {},
            { blog_owner_id: 0, blog_owner_profile_picture: 0 }
        )
        .limit(props.limit)
        .skip(props.skip)
        .lean();
    }

    async getBlogById(id: string) {
        return await Blogs.findOne({ _id: id }).lean();
    }
}

const blogRepository = new BlogRepository();

export default blogRepository;