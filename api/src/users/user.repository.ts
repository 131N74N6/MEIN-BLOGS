import { UserIntrf, Users } from "./user.model";
import { Blogs } from "../blogs/blog.model";
import { Comments } from "../comments/comment.model";
import { Viewers } from "../viewers/viewer.model";
import { Relationships } from "../relationships/relationship.model";

class UserRepository {
    async changeUser(id: string, userData: Partial<UserIntrf>) {
        return await Promise.all([
            Viewers.updateMany({ user_id: id }, {
                $set: {
                    username: userData.username,
                    profile_picture: userData.profile_picture
                }
            }),
            Relationships.updateMany({ user_id: id }, {
                $set: { 
                    profile_picture: userData.profile_picture,
                    username: userData.username
                }
            }),
            Relationships.updateMany({ followed_user_id: id }, {
                $set: { 
                    profile_picture: userData.profile_picture,
                    username: userData.username
                }
            }),
            Comments.updateMany({ user_id: id }, { 
                $set: { 
                    profile_picture: userData.profile_picture,
                    username: userData.username
                } 
            }),
            Blogs.updateMany({ blog_owner_id: id }, {
                $set: { 
                    blog_owner_profile_picture: userData.profile_picture,
                    blog_owner_name: userData.username
                }
            }),
            Users.updateOne({ _id: id }, { $set: userData })
        ]);
    }

    async createNewUser(userData: Partial<UserIntrf>) {
        return await Users.insertOne(userData);
    }

    async deleteCurrentUserOldProfile(id: string) {
        return await Promise.all([
            Viewers.updateMany({ user_id: id }, { $set: { profile_picture: null } }),
            Relationships.updateMany({ user_id: id }, { $set: { profile_picture: null } }),
            Relationships.updateMany({ followed_user_id: id }, { $set: { profile_picture: null } }),
            Comments.updateMany({ user_id: id }, { $set: { profile_picture: null } }),
            Blogs.updateMany({ blog_owner_id: id }, { $set: { blog_owner_profile_picture: null } }),
            Users.updateOne({ _id: id }, { $set: { profile_picture: null } })
        ]);
    }

    async deleteUser(id: string) {
        return await Promise.all([
            Viewers.deleteMany({ user_id: id }),
            Relationships.deleteMany({ user_id: id }),
            Relationships.deleteMany({ followed_user_id: id }),
            Comments.deleteMany({ user_id: id }),
            Blogs.deleteMany({ blog_owner_id: id }),
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