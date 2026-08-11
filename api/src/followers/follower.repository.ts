import { Users } from "../users/user.model";
import { Followers, FollowersUserIntrf } from "./follower.model";

class FollowerRepository {
    async getUserFollowers(props: Omit<FollowersUserIntrf, "followed_user_id">) {
        return await Followers.find({ followed_user_id: props.current_user_id }, { followed_user_id: 0 })
        .limit(props.limit)
        .skip(props.skip)
        .lean();
    }

    async getFollowedUsers(props: Omit<FollowersUserIntrf, "followed_user_id">) {
        return await Followers.find({ user_id: props.current_user_id }, { user_id: 0 })
        .limit(props.limit)
        .skip(props.skip)
        .lean();
    }

    async getFollowersTotal(props: Pick<FollowersUserIntrf, "current_user_id">) {
        return await Followers.find({ followed_user_id: props.current_user_id }).countDocuments();
    }

    async getFollowedUserTotal(props: Pick<FollowersUserIntrf, "current_user_id">) {
        return await Followers.find({ current_user_id: props.current_user_id }).countDocuments();
    }

    async startFollowedOneUser(props: Pick<FollowersUserIntrf, "current_user_id" | "followed_user_id">) {
        const user = await Users.find({ _id: props.current_user_id }, { email: 0, password: 0 });

        const newFollower = new Followers({
            current_user_id: user[0]._id,
            followed_user_id: props.followed_user_id,
            username: user[0].username,
            profile_picture: user[0].profile_picture
        });

        return newFollower.save();
    }
    
    async stopFollowingAllUser(props: Pick<FollowersUserIntrf, "current_user_id">) {
        return await Followers.deleteMany({ current_user_id: props.current_user_id });
    }
    
    async stopFollowingOneUser(props: Pick<FollowersUserIntrf, "followed_user_id">) {
        return await Followers.deleteOne({ followed_user_id: props.followed_user_id });
    }
}

const followerRepository = new FollowerRepository();

export default followerRepository;