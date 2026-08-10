import { Blogs, BlogViewerIntrf, NewBlogIntrf, ShowAllBlogsIntrf, ShowAllUserBlogsIntrf } from "../models/blog.model";
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
            title: props.title,
        });

        return await Promise.all([
            newBlog.save(),
            Blogs.updateOne({ _id: newBlog._id }, {
                $addToSet: {
                    viewers: {
                        user_id: user[0]._id,
                        username: user[0].username,
                        profile_picture: user[0].profile_picture,
                    }
                }
            })
        ]);
    }

    async deleteAllBlogs(blogId: string[], currentUserId: string) {
        return await Promise.all([
            Comments.deleteMany({ blog_id: { $in: blogId } }),
            Blogs.deleteMany({ blog_owner_id: currentUserId })
        ]);
    }

    async deleteOneBlog(blogId: string) {
        return await Promise.all([
            Comments.deleteMany({ blog_id: blogId }),
            Blogs.deleteOne({ _id: blogId })
        ]);
    }

    async getAllCurrentUserBlogs(currentUserId: string) {
        return await Blogs.find(
            { blog_owner_id: currentUserId },
            { blog_owner_id: 0, blog_owner_profile_picture: 0, viewers: 0 }
        ).lean();
    }

    async getAllCurrentUserBlogsWithPagination(props: ShowAllUserBlogsIntrf) {
        return await Blogs.find(
            { blog_owner_id: props.current_user_id },
            { blog_owner_id: 0, blog_owner_profile_picture: 0, viewers: 0 }
        )
        .limit(props.limit)
        .skip(props.skip)
        .lean();
    }

    async getAllBlogsWithPagination(props: ShowAllBlogsIntrf) {
        return await Blogs.find(
            {},
            { blog_owner_id: 0, blog_owner_profile_picture: 0, viewers: 0 }
        )
        .limit(props.limit)
        .skip(props.skip)
        .lean();
    }

    async getBlogById(blogId: string) {
        return await Blogs.findOne({ _id: blogId }).lean();
    }

    async getBlogViewerWithPagination(props: BlogViewerIntrf) {
        return await Blogs.find({ _id: props.blog_id }, { viewers: 1 })
        .limit(props.limit)
        .skip(props.skip)
        .lean();
    }

    async getBlogViewerTotal(blogId: string) {
        return await Blogs.aggregate([
            { $match: { _id: blogId } },
            { $project: {
                viewers: 1,
                viewers_total: { $size: "$viewers" }
            }}
        ]);
    }

    async updateBlogViewer(blogId: string, currentUserId: string) {
        const blog = await Blogs.find({ _id: blogId }, { _id: 1 });
        const user = await Users.find({ _id: currentUserId }, { email: 0, password: 0 });

        return await Blogs.updateOne({ _id: blog[0]._id }, {
            $addToSet: { 
                viewers: {
                    user_id: user[0]._id,
                    username: user[0].username,
                    profile_picture: user[0].profile_picture,
                }
            }
        });
    }
}

const blogRepository = new BlogRepository();

export default blogRepository;