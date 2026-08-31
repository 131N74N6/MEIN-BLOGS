import { ObjectId } from "mongodb";
import { db } from "../mongodb/service";
import { TUser } from "./model";

class UserRepository {
    private accounts = db().collection("account");
    private blogs = db().collection("blogs");
    private comments = db().collection("comments");
    private relations = db().collection("relations");
    private sessions = db().collection("session");
    private users = db().collection("user");
    private viewers = db().collection("viewers");
    
    async changeUser(user: Partial<TUser["change_result"]>) {
        return await Promise.all([
            this.viewers.updateMany({ user_id: new ObjectId(user.id) }, {
                $set: {
                    username: user.name,
                    profile_picture: user.image
                }
            }),
            this.relations.updateMany({ user_id: new ObjectId(user.id) }, {
                $set: { 
                    profile_picture: user.image,
                    username: user.name
                }
            }),
            this.relations.updateMany({ followed_user_id: new ObjectId(user.id) }, {
                $set: { 
                    profile_picture: user.image,
                    username: user.name
                }
            }),
            this.comments.updateMany({ user_id: new ObjectId(user.id) }, { 
                $set: { 
                    profile_picture: user.image,
                    username: user.name
                } 
            }),
            this.blogs.updateMany({ blog_owner_id: new ObjectId(user.id) }, {
                $set: { 
                    blog_owner_profile_picture: user.image,
                    blog_owner_name: user.name
                }
            }),
            this.users.updateOne({ _id: new ObjectId(user.id) }, { $set: {
                description: user.description,
                name: user.name,
                image: user.image,
                image_public_id: user.image_public_id,
                image_filename: user.image_filename,
                image_filetype: user.image_filetype,
                image_resource_type: user.image_resource_type,
                updatedAt: new Date()
            }})
        ]);
    }

    async deleteCurrentUserOldProfile(id: string) {
        return await Promise.all([
            this.viewers.updateMany({ user_id: new ObjectId(id) }, { $set: { image: null } }),
            this.relations.updateMany({ user_id: new ObjectId(id) }, { $set: { image: null } }),
            this.relations.updateMany({ followed_user_id: new ObjectId(id) }, { $set: { image: null } }),
            this.comments.updateMany({ user_id: new ObjectId(id) }, { $set: { image: null } }),
            this.blogs.updateMany({ blog_owner_id: new ObjectId(id) }, { $set: { blog_owner_image: null } }),
            this.users.updateOne({ _id: new ObjectId(id) }, { 
                $set: { 
                    image: null,
                    image_public_id: null,
                    image_filename: null,
                    image_filetype: null,
                    image_resource_type: null
                } 
            })
        ]);
    }

    async deleteUser(id: string) {
        return await Promise.all([
            this.viewers.deleteMany({ user_id: new ObjectId(id) }),
            this.relations.deleteMany({ user_id: new ObjectId(id) }),
            this.relations.deleteMany({ followed_user_id: new ObjectId(id) }),
            this.comments.deleteMany({ user_id: new ObjectId(id) }),
            this.blogs.deleteMany({ blog_owner_id: new ObjectId(id) }),
            this.sessions.deleteMany({ userId: new ObjectId(id) }),
            this.accounts.deleteOne({ userId: new ObjectId(id) }),
            this.users.deleteOne({ _id: new ObjectId(id) })
        ]);
    }

    async getCurrentUser(current_user_id: string) {
        const user = await this.users.findOne(
            { _id: new ObjectId(current_user_id) }, 
            { projection: { createdAt: 1, email: 1, image:1, name: 1 } }
        );

        return user;
    }

    async getCurrentUserForEdit(current_user_id: string) {
        const user = await this.users.findOne(
            { _id: new ObjectId(current_user_id) }, 
            { projection: { 
                createdAt: 1, 
                email: 1, 
                image:1, 
                image_filename: 1, 
                image_filetype: 1, 
                image_public_id: 1, 
                image_resource_type: 1, 
                name: 1 
            }}
        );

        return user;
    }

    async getCurrentUserBlogs(userId: string) {
        return await this.blogs.find({ blog_owner_id: userId }).toArray();
    }
}

const userRepository = new UserRepository();

export default userRepository;