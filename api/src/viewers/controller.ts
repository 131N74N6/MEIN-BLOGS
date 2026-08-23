import { TViewer } from "./model";
import viewerService from "./service";

class ViewerController {
    async getAllBlogViewers(query: Omit<TViewer["pagination"], "skip">) {
        const page = query.page;
        const limit = query.limit;
        const skip = (page - 1) * limit;

        const viewers = await viewerService.getAllBlogViewers({ 
            blog_id: query.blog_id, limit: limit, skip: skip
        });

        return { data: viewers, success: true };
    }

    async getAllBlogViewersTotal(params: Pick<TViewer["data"], "blog_id">) {
        const total = await viewerService.getAllBlogViewersTotal({ blog_id: params.blog_id });
        return { data: total, success: true };
    }

    async seeOneBlog(props: Omit<TViewer["data"], "created_at" | "username" | "profile_picture">) {
        await viewerService.seeOneBlog({ blog_id: props.blog_id, user_id: props.user_id });
        return { message: "successfully access blog", success: true };
    }
}

const viewerController = new ViewerController();

export default viewerController;