import { Blogs } from "../blogs/blog.model";
import { Users } from "../users/user.model";
import { ViewerPaginationIntrf, Viewers, VisitBlogIntrf } from "./viewer.model";

class ViewerRepository {
    async hasUserSeenThisBlog(props: VisitBlogIntrf) {
        return await Viewers.find({ blog_id: props.blog_id, user_id: props.current_user_id });
    }

    async getAllBlogViewers(props: ViewerPaginationIntrf) {
        return await Viewers.find({ blog_id: props.blog_id }, { blog_id: 0, blog_title: 0 })
        .limit(props.limit)
        .skip(props.skip)
        .lean();
    }

    async getAllBlogViewersTotal(props: Pick<VisitBlogIntrf, "blog_id">) {
        return await Viewers.find({ blog_id: props.blog_id }).countDocuments();
    }

    async seeOneBlog(props: VisitBlogIntrf) {
        const blog = await Blogs.find({ _id: props.blog_id }, { _id: 1, title: 1 });
        const user = await Users.find({ _id: props.current_user_id }, { password: 0, email: 0 });

        const newViewer = new Viewers({
            blog_id: blog[0]._id, 
            blog_title: blog[0].title, 
            user_id: user[0]._id, 
            username: user[0].username,
            profile_picture: user[0].profile_picture
        });

        return await newViewer.save();
    }
}

const viewerRepository = new ViewerRepository();

export default viewerRepository;