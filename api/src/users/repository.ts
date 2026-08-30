import { ObjectId } from "mongodb";
import { db } from "../mongodb/service";
import { TUser } from "./model";

class UserRepository {
    private blogs = db().collection("blogs");
    private comments = db().collection("comments");
    private relations = db().collection("relations");
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
            this.users.updateOne({ _id: new ObjectId(user.id) }, { $set: user })
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
            this.users.deleteOne({ _id: new ObjectId(id) })
        ]);
    }

    async getCurrentUser(current_user_id: string) {
        const user = await this.users.findOne(
            { _id: new ObjectId(current_user_id) }, 
            { projection: { createdAt: 1, email: 1, image:1, name: 1 } }
        );

        console.log(user);
        return user;
    }

    async getCurrentUserBlogs(userId: string) {
        return await this.blogs.find({ blog_owner_id: userId }).toArray();
    }
}

const userRepository = new UserRepository();

export default userRepository;