import { ObjectId } from "mongodb";
import { db } from "../mongodb/service";
import { TRelation } from "./model";

class RelationRepository {
    private relations = db().collection("relations");
    private users = db().collection("user");

    async getUserFollowers(props: Omit<TRelation["pagination"], "followed_user_id" | "page">) {
        return await this.relations.find(
            { followed_user_id: new ObjectId(props.user_id) }, 
            { projection: { followed_user_id: 0 }}
        )
        .limit(props.limit)
        .skip(props.skip)
        .toArray();
    }

    async getFollowedUsers(props: Omit<TRelation["pagination"], "followed_user_id" | "page">) {
        return await this.relations.find(
            { user_id: new ObjectId(props.user_id) }, 
            { projection: { followed_user_id: 0 }}
        )
        .limit(props.limit)
        .skip(props.skip)
        .toArray();
    }

    async getFollowersTotal(props: Pick<TRelation["add"], "user_id">) {
        const followers = await this.relations.find({ followed_user_id: new ObjectId(props.user_id) }).toArray();
        return followers.length;
    }

    async getFollowedUserTotal(props: Pick<TRelation["add"], "user_id">) {
        const followed = await this.relations.find({ user_id: new ObjectId(props.user_id) }).toArray();
        return followed.length;
    }

    async hasUserFollowed(data: TRelation["add"]) {
        const followed = await this.relations.find({ 
            user_id: new ObjectId(data.user_id), followed_user_id: new ObjectId(data.followed_user_id) 
        }).toArray();

        const hasFollowed = followed.length > 0 ? true : false;
        return hasFollowed;
    }

    async startFollowedOneUser(data: TRelation["add"]) {
        const user = await this.users.find(
            { _id: new ObjectId(data.user_id) }, { projection: { email: 0, password: 0 }}
        ).toArray();

        return await this.relations.insertOne({
            created_at: new Date(),
            user_id: user[0]._id,
            followed_user_id: new ObjectId(data.followed_user_id),
            username: user[0].username,
            profile_picture: user[0].profile_picture
        });
    }
    
    async stopFollowingOneUser(props: Pick<TRelation["add"], "followed_user_id">) {
        return await this.relations.deleteOne({ followed_user_id: new ObjectId(props.followed_user_id) });
    }
}

const relationRepository = new RelationRepository();

export default relationRepository;