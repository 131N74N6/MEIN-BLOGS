import { ObjectId } from "mongodb";
import { db } from "../mongodb/service";
import { TRelation } from "./model";

class RelationRepository {
    private relations = db().collection("relations");
    private users = db().collection("user");

    private escapeRegex(text: string): string {
        return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }

    async getUserFollowers(props: Omit<TRelation["pagination"], "followed_user_id" | "page">) {
        if (props.username === undefined || props.username === "") {
            return await this.relations.find(
                { followed_user_id: new ObjectId(props.user_id) }, 
                { projection: { followed_user_id: 0 }}
            )
            .limit(props.limit)
            .skip(props.skip)
            .toArray();
        } else {
            const sanitizeUserName = this.escapeRegex(props.username);
            const regexPattern = new RegExp(sanitizeUserName, 'i');

            return await this.relations.find(
                { followed_user_id: new ObjectId(props.user_id), username: regexPattern }, 
                { projection: { followed_user_id: 0 }}
            )
            .limit(props.limit)
            .skip(props.skip)
            .toArray();
        }
    }

    async getFollowedUsers(props: Omit<TRelation["pagination"], "followed_user_id" | "page">) {
        if (props.username === undefined || props.username === "") {
            return await this.relations.find(
                { user_id: new ObjectId(props.user_id) }, 
                { projection: { followed_user_id: 0 }}
            )
            .limit(props.limit)
            .skip(props.skip)
            .toArray();
        } else {
            const sanitizeUserName = this.escapeRegex(props.username);
            const regexPattern = new RegExp(sanitizeUserName, 'i');

            return await this.relations.find(
                { user_id: new ObjectId(props.user_id), username: regexPattern }, 
                { projection: { followed_user_id: 0 }}
            )
            .limit(props.limit)
            .skip(props.skip)
            .toArray();
        }
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
            { _id: new ObjectId(data.user_id) }, 
            { projection: { image: 1, name: 1, _id: 1 }}
        ).toArray();

        return await this.relations.insertOne({
            created_at: new Date(),
            user_id: user[0]._id,
            followed_user_id: new ObjectId(data.followed_user_id),
            username: user[0].name,
            profile_picture: user[0].image
        });
    }
    
    async stopFollowingOneUser(props: Pick<TRelation["add"], "followed_user_id">) {
        return await this.relations.deleteOne({ followed_user_id: new ObjectId(props.followed_user_id) });
    }
}

const relationRepository = new RelationRepository();

export default relationRepository;