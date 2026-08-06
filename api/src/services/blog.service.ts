import { NewBlogIntrf, ShowAllBlogsIntrf, ShowAllUserBlogsIntrf } from "../models/blog.model";
import blogRepository from "../repositories/blog.repository";

class BlogService {
    async createNewBlogService(props: NewBlogIntrf) {
        try {
            const allowedMedia = ["image/jpeg", "image/png", "image/webp", "image/avif"];
        
            if (!props.content && !props.media && !props.title) throw new Error("all fields are required");
            if (!props.content) throw new Error("pleasa provide content");
            if (!props.media) throw new Error("pleasa provide media");
            if (!props.title) throw new Error("pleasa provide title");
            if (!allowedMedia.includes(props.media.mimetype)) {
                throw new Error("only images are allowed such as .jpg, .jpeg, .png, .webp, and .avif");
            }

            await blogRepository.createNewBlogRepository(props);
        } catch (error) {
            throw error;
        }
    }

    async deleteAllBlogsService(currentUserId: string) {
        await blogRepository.deleteAllBlogsRepository(currentUserId);
    }

    async deleteBlogService(id: string) {
        await blogRepository.deleteBlogRepository(id);
    }

    async generateNewBlogService(props: Pick<NewBlogIntrf, 'language' | 'media' | 'title'>) {
        try {
            const allowedMedia = ["image/jpeg", "image/png", "image/webp", "image/avif"];

            if (!props.media && !props.title) throw new Error("please provide image and title");
            if (!props.title) throw new Error("pleasa provide title");
            if (!props.media) throw new Error("pleasa provide media");
            if (!allowedMedia.includes(props.media.mimetype)) {
                throw new Error("only images are allowed such as .jpg, .jpeg, .png, .webp, and .avif");
            }

            return await blogRepository.generateNewBlogRepository(props);
        } catch (error) {
            throw error;
        }
    }

    async showAllBlogsService(props: ShowAllBlogsIntrf) {
        return await blogRepository.showAllBlogsRepository(props);
    }

    async showAllUserBlogsService(props: ShowAllUserBlogsIntrf) {
        return await blogRepository.showAllUserBlogsRepository(props);
    }
}

const blogService = new BlogService();

export default blogService;