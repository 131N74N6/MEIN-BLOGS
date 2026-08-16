import { Blogs, EditBlogIntrf, NewBlogIntrf } from "./blog.model";
import { Users } from "../users/user.model";
import { Comments } from "../comments/comment.model";
import { Viewers } from "../viewers/viewer.model";
import { BlogPaginationIntrf } from "./blog.validation";

class BlogRepository {
    async createNewBlog(props: NewBlogIntrf) {
        const user = await Users.find(
            { _id: props.current_user_id }, 
            { password: 0, profile_picture: 0 }
        ).lean();

        return await Blogs.insertOne({
            blog_owner_name: user[0].username,
            blog_owner_profile_picture: user[0].profile_picture,
            blog_owner_id: user[0]._id,
            content: props.content,
            media: props.media,
            title: props.title,
        });
    }

    async changeOneBlog(props: EditBlogIntrf) {
        return await Promise.all([
            Viewers.updateMany({ blog_id: props.blog_id }, {
                $set: { blog_title: props.title }
            }),

            Blogs.updateOne({ _id: props.blog_id }, {
                $set: {
                    content: props.content,
                    media: props.media,
                    title: props.title,
                }
            })
        ]);
    }

    async deleteAllBlogs(blogId: string[], currentUserId: string) {
        return await Promise.all([
            Viewers.deleteMany({ blog_id: { $in: blogId } }),
            Comments.deleteMany({ blog_id: { $in: blogId } }),
            Blogs.deleteMany({ blog_owner_id: currentUserId })
        ]);
    }

    async deleteOneBlog(blogId: string) {
        return await Promise.all([
            Viewers.deleteMany({ blog_id: blogId }),
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

    async getAllCurrentUserBlogsWithPagination(props: Omit<BlogPaginationIntrf, "page">) {
        return await Blogs.find(
            { blog_owner_id: props.current_user_id },
            { blog_owner_id: 0, blog_owner_profile_picture: 0, viewers: 0 }
        )
        .limit(props.limit)
        .skip(props.skip)
        .lean();
    }

    async getAllBlogsWithPagination(props: Omit<BlogPaginationIntrf, "current_user_id" | "page">) {
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
}

const blogRepository = new BlogRepository();

export default blogRepository;