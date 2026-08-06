import { NewBlogIntrf, ShowAllBlogsIntrf, ShowAllUserBlogsIntrf } from "../models/blog.model";
import blogRepository from "../repositories/blog.repository";

class BlogService {
    async createNewBlogService(props: NewBlogIntrf) {
        await blogRepository.createNewBlogRepository(props);
    }

    async deleteAllBlogsService(currentUserId: string) {
        await blogRepository.deleteAllBlogsRepository(currentUserId);
    }

    async deleteBlogService(id: string) {
        await blogRepository.deleteBlogRepository(id);
    }

    async generateNewBlogService(props: Pick<NewBlogIntrf, 'language' | 'media' | 'title'>) {
        return await blogRepository.generateNewBlogRepository(props);
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