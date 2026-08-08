import { UserIntrf, Users } from "../models/user.model";
import { Blogs } from "../models/blog.model";
import { Comments } from "../models/comment.model";

class UserRepository {
    async changeUser(id: string, userData: Partial<UserIntrf>) {
        return await Users.updateOne({ _id: id }, { $set: userData });
    }

    async createNewUser(userData: Partial<UserIntrf>) {
        const newUser = new Users(userData);
        return await newUser.save();
    }

    async deleteCurrentUserOldProfile(id: string) {
        return await Users.updateOne({ _id: id }, { $set: { profile_picture: null } });
    }

    async deleteUser(id: string) {
        return await Users.deleteOne({ _id: id });
    }

    async deleteUserBlogs(userId: string) {
        return await Blogs.deleteMany({ blog_owner_id: userId });
    }

    async deleteUserOldProfile(id: string) {
        return await Users.updateOne({ _id: id }, { $set: { profile_picture: null } });
    }

    async deleteCommentsInUserBlogs(blogsIds: string[]) {
        return await Comments.deleteMany({ _id: { $in: blogsIds }});
    }

    async getCurrentUser(currentUserId: string) {
        const user = await Users.findOne({ _id: currentUserId }, { password: 0 }).lean();
        return user;
    }

    async getCurrentUserBlogs(userId: string) {
        return await Blogs.find({ blog_owner_id: userId }).lean();
    }

    async getCurrentUserByEmail(email: string) {
        const currentEmail = await Users.findOne({ email: { $eq: email } }).lean();
        return currentEmail;
    }

    async getCurrentUserByUsername(username: string) {
        const currentUsername = await Users.findOne({ username: { $eq: username } }).lean();
        return currentUsername;
    }

    async getCurrentUserWithPasword(currentUserId: string) {
        const user = await Users.findOne({ _id: currentUserId }).lean();
        if (!user) throw new Error("user not found");
        return user;
    }
}

const userRepository = new UserRepository();

export default userRepository;