import { Users } from "../users/user.model";
import { Relationships, UserRelationshipIntrf } from "./relationship.model";

class RelationshipRepository {
    async getUserFollowers(props: Omit<UserRelationshipIntrf, "followed_user_id">) {
        return await Relationships.find({ followed_user_id: props.user_id }, { followed_user_id: 0 })
        .limit(props.limit)
        .skip(props.skip)
        .lean();
    }

    async getFollowedUsers(props: Omit<UserRelationshipIntrf, "followed_user_id">) {
        return await Relationships.find({ user_id: props.user_id }, { user_id: 0 })
        .limit(props.limit)
        .skip(props.skip)
        .lean();
    }

    async getFollowersTotal(props: Pick<UserRelationshipIntrf, "user_id">) {
        return await Relationships.find({ followed_user_id: props.user_id }).countDocuments();
    }

    async getFollowedUserTotal(props: Pick<UserRelationshipIntrf, "user_id">) {
        return await Relationships.find({ user_id: props.user_id }).countDocuments();
    }

    async hasUserFollowed(props: Pick<UserRelationshipIntrf, "user_id" | "followed_user_id">) {
        return await Relationships.findOne({ 
            user_id: props.user_id, followed_user_id: props.followed_user_id 
        });
    }

    async startFollowedOneUser(props: Pick<UserRelationshipIntrf, "user_id" | "followed_user_id">) {
        const user = await Users.find({ _id: props.user_id }, { email: 0, password: 0 });

        return await Relationships.insertOne({
            user_id: user[0]._id,
            followed_user_id: props.followed_user_id,
            username: user[0].username,
            profile_picture: user[0].profile_picture
        });
    }
    
    async stopFollowingAllUser(props: Pick<UserRelationshipIntrf, "user_id">) {
        return await Relationships.deleteMany({ user_id: props.user_id });
    }
    
    async stopFollowingOneUser(props: Pick<UserRelationshipIntrf, "followed_user_id">) {
        return await Relationships.deleteOne({ followed_user_id: props.followed_user_id });
    }
}

const relationshipRepository = new RelationshipRepository();

export default relationshipRepository;