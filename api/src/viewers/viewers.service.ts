import mongoose from "mongoose";
import { ApiError } from "../errors/api.error";
import { ViewerPaginationIntrf, VisitBlogIntrf } from "./viewer.model";
import viewerRepository from "./viewer.repository";

class ViewerService {
    private checkIsIdValid(fieldName: string, value: unknown) {
        const isNotValid = value === undefined || value === null || value === "" || 
        typeof value === "undefined" || typeof value !== "string" || !mongoose.isValidObjectId(value);

        if (isNotValid) throw new ApiError(400, `invalid ${fieldName}`);

        return value;
    }

    async hasUserSeenThisBlog(props: VisitBlogIntrf) {
        const blogId = this.checkIsIdValid("blog id", props.blog_id);
        const currentUserId = this.checkIsIdValid("current user id", props.current_user_id);

        const hasSeen = await viewerRepository.hasUserSeenThisBlog({
            blog_id: blogId, current_user_id: currentUserId
        });

        return Boolean(hasSeen);
    }

    async getAllBlogViewers(props: ViewerPaginationIntrf) {
        const blogId = this.checkIsIdValid("blog id", props.blog_id);

        return await viewerRepository.getAllBlogViewers({
            blog_id: blogId, limit: props.limit, skip: props.skip
        });
    }

    async getAllBlogViewersTotal(props: Pick<VisitBlogIntrf, "blog_id">) {
        const blogId = this.checkIsIdValid("blog id", props.blog_id);
        return viewerRepository.getAllBlogViewersTotal({ blog_id: blogId });
    }

    async seeOneBlog(props: VisitBlogIntrf) {
        const blogId = this.checkIsIdValid("blog id", props.blog_id);
        const currentUserId = this.checkIsIdValid("current user id", props.current_user_id);

        await viewerRepository.seeOneBlog({
            blog_id: blogId, current_user_id: currentUserId
        });
    }
}

const viewerService = new ViewerService();

export default viewerService;