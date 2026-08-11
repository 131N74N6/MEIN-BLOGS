import { ApiError } from "../errors/api.error";
import { FollowersUserIntrf } from "./follower.model";
import followerRepository from "./follower.repository";

class FollowerService {
    private checkIsObjectId(fieldName: string, value: unknown) {
        const isValid = value === "" || typeof value === "undefined" || typeof value !== "string" || 
        value === null;
        
        if (isValid) throw new ApiError(400, `invalid ${fieldName}`);

        return value;
    }

    async getUserFollowers(props: Omit<FollowersUserIntrf, "followed_user_id">) {
        const currentUserId = this.checkIsObjectId("current user id", props.current_user_id);

        return await followerRepository.getUserFollowers({
            current_user_id: currentUserId, limit: props.limit, skip: props.skip
        });
    }

    async getFollowedUser(props: Omit<FollowersUserIntrf, "followed_user_id">) {
        const currentUserId = this.checkIsObjectId("current user id", props.current_user_id);

        return await followerRepository.getFollowedUsers({
            current_user_id: currentUserId, limit: props.limit, skip: props.skip
        });
    }

    async getFollowersTotal(props: Pick<FollowersUserIntrf, "current_user_id">) {
        const currentUserId = this.checkIsObjectId("current user id", props.current_user_id);
        return await followerRepository.getFollowersTotal({ current_user_id: currentUserId });
    }

    async getFollowedUserTotal(props: Pick<FollowersUserIntrf, "current_user_id">) {
        const currentUserId = this.checkIsObjectId("current user id", props.current_user_id);
        return await followerRepository.getFollowedUserTotal({ current_user_id: currentUserId });
    }

    async startFollowedOneUser(props: Pick<FollowersUserIntrf, "current_user_id" | "followed_user_id">) {
        const currentUserId = this.checkIsObjectId("current user id", props.current_user_id);
        const followedUserId = this.checkIsObjectId("followed user id", props.followed_user_id);

        await followerRepository.startFollowedOneUser({
            current_user_id: currentUserId,
            followed_user_id: followedUserId
        });
    }

    async stopFollowingAllUser(props: Pick<FollowersUserIntrf, "current_user_id">) {
        const currentUserId = this.checkIsObjectId("current user id", props.current_user_id);

        await followerRepository.stopFollowingAllUser({ current_user_id: currentUserId });
    }

    async stopFollowingOneUser(props: Pick<FollowersUserIntrf, "followed_user_id">) {
        const followedUserId = this.checkIsObjectId("followed user id", props.followed_user_id);

        await followerRepository.stopFollowingOneUser({ followed_user_id: followedUserId });
    }
}

const followerService = new FollowerService();

export default followerService;