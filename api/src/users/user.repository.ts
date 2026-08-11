import { UserIntrf, Users } from "./user.model";
import { Blogs } from "../blogs/blog.model";
import { Comments } from "../comments/comment.model";

class UserRepository {
    async changeUser(id: string, userData: Partial<UserIntrf>) {
        return await Promise.all([
            Blogs.updateMany({ blog_owner_id: id }, {
                $set: { 
                    blog_owner_profile_picture: userData.profile_picture,
                    blog_owner_name: userData.username
                }
            }),
            Blogs.updateMany({ "viewers.user_id": id }, {
                $set: { 
                    "viewers.$.profile_picture": userData.profile_picture,
                    "viewers.$.username": userData.username
                }
            }),
            Comments.updateMany({ user_id: id }, { 
                $set: { 
                    profile_picture: userData.profile_picture,
                    username: userData.username
                } 
            }),
            Users.updateOne({ _id: id }, { $set: userData })
        ]);
    }

    async createNewUser(userData: Partial<UserIntrf>) {
        const newUser = new Users(userData);
        return await newUser.save();
    }

    async deleteCurrentUserOldProfile(id: string) {
        return await Promise.all([
            Blogs.updateMany({ "viewers.user_id": id }, { $set: { "viewers.$.profile_picture": null } }),
            Blogs.updateMany({ blog_owner_id: id }, { $set: { blog_owner_profile_picture: null } }),
            Comments.updateMany({ user_id: id }, { $set: { profile_picture: null } }),
            Users.updateOne({ _id: id }, { $set: { profile_picture: null } })
        ]);
    }

    async deleteUser(id: string) {
        return await Promise.all([
            Blogs.updateMany({ "viewers.user_id": id }, {
                $pull: { viewers: { user_id: id } }
            }),
            Blogs.deleteMany({ blog_owner_id: id }),
            Comments.deleteMany({ user_id: id }),
            Users.deleteOne({ _id: id })
        ]);
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
}

const userRepository = new UserRepository();

export default userRepository;