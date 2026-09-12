import { TViewer } from "./model";
import viewerRepository from "./repository";
import { ObjectId } from "mongodb";
import { BlogApiError } from "../error/service";

class ViewerService {
    private checkIsIdValid(fieldName: string, value: unknown) {
        const isNotValid = !value || value === "" || typeof value !== "string" || !ObjectId.isValid(value);
        if (isNotValid) throw new BlogApiError(400, `invalid ${fieldName}`);

        return value;
    }

    async getAllBlogViewers(query: Omit<TViewer["pagination"], "page">) {
        const blogId = this.checkIsIdValid("blog", query.blog_id);

        return await viewerRepository.getAllBlogViewers({
            blog_id: blogId, limit: query.limit, skip: query.skip
        });
    }

    async getAllBlogViewersTotal(params: Pick<TViewer["data"], "blog_id">) {
        const blogId = this.checkIsIdValid("blog", params.blog_id);
        return viewerRepository.getAllBlogViewersTotal({ blog_id: blogId });
    }

    async getReceivedBlogViewersTotalForCurrentUser(blog_owner_id: string) {
        const blogOwnerId = this.checkIsIdValid("blog owner", blog_owner_id);
        const total = await viewerRepository.getReceivedBlogViewersTotalForCurrentUser(blogOwnerId);
        return total;
    }

    async seeOneBlog(props: Omit<TViewer["data"], "created_at" | "username" | "profile_picture">) {
        const blogId = this.checkIsIdValid("blog", props.blog_id);
        const blogOwnerId = this.checkIsIdValid("blog owner", props.blog_owner_id);
        const userId = this.checkIsIdValid("current user", props.user_id);

        const hasSeen = await viewerRepository.hasUserSeenThisBlog({ blog_id: blogId, user_id: userId });
        
        if (hasSeen === false) {
            await viewerRepository.seeOneBlog({ blog_id: blogId, user_id: userId, blog_owner_id: blogOwnerId });
        }
    }
}

const viewerService = new ViewerService();

export default viewerService;