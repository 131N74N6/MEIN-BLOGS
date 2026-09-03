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
        const blogId = this.checkIsIdValid("blog id", query.blog_id);

        return await viewerRepository.getAllBlogViewers({
            blog_id: blogId, limit: query.limit, skip: query.skip
        });
    }

    async getAllBlogViewersTotal(params: Pick<TViewer["data"], "blog_id">) {
        const blogId = this.checkIsIdValid("blog id", params.blog_id);
        return viewerRepository.getAllBlogViewersTotal({ blog_id: blogId });
    }

    async seeOneBlog(props: Omit<TViewer["data"], "created_at" | "username" | "profile_picture">) {
        const blog_id = this.checkIsIdValid("blog id", props.blog_id);
        const user_id = this.checkIsIdValid("current user id", props.user_id);

        const hasSeen = await viewerRepository.hasUserSeenThisBlog({ blog_id: blog_id, user_id: user_id });
        
        if (hasSeen === false) {
            await viewerRepository.seeOneBlog({ blog_id: blog_id, user_id: user_id });
        }
    }
}

const viewerService = new ViewerService();

export default viewerService;