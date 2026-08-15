import mongoose from "mongoose";
import { ApiError } from "../errors/api.error";
import { UserRelationshipIntrf } from "./relationship.model";
import relationshipRepository from "./relationship.repository";

class RelationshipService {
    private checkIsIdValid(fieldName: string, value: unknown) {
        const isNotValid = value === undefined || value === null || value === "" || 
        typeof value === "undefined" || typeof value !== "string" || !mongoose.isValidObjectId(value);
        
        if (isNotValid) throw new ApiError(400, `invalid ${fieldName}`);

        return value;
    }

    async getUserFollowers(props: Omit<UserRelationshipIntrf, "followed_user_id">) {
        const userId = this.checkIsIdValid("user id", props.user_id);

        return await relationshipRepository.getUserFollowers({
            user_id: userId, limit: props.limit, skip: props.skip
        });
    }

    async getFollowedUser(props: Omit<UserRelationshipIntrf, "followed_user_id">) {
        const userId = this.checkIsIdValid("user id", props.user_id);

        return await relationshipRepository.getFollowedUsers({
            user_id: userId, limit: props.limit, skip: props.skip
        });
    }

    async getFollowersTotal(props: Pick<UserRelationshipIntrf, "user_id">) {
        const userId = this.checkIsIdValid("user id", props.user_id);
        return await relationshipRepository.getFollowersTotal({ user_id: userId });
    }

    async getFollowedUserTotal(props: Pick<UserRelationshipIntrf, "user_id">) {
        const userId = this.checkIsIdValid("user id", props.user_id);
        return await relationshipRepository.getFollowedUserTotal({ user_id: userId });
    }

    async hasUserFollowed(props: Pick<UserRelationshipIntrf, "user_id" | "followed_user_id">) {
        const userId = this.checkIsIdValid("user id", props.user_id);
        const followedUserId = this.checkIsIdValid("followed user id", props.followed_user_id);
        
        const hasFollowed = await relationshipRepository.hasUserFollowed({
            user_id: userId, followed_user_id: followedUserId
        });

        return Boolean(hasFollowed);
    }

    async startFollowedOneUser(props: Pick<UserRelationshipIntrf, "user_id" | "followed_user_id">) {
        const userId = this.checkIsIdValid("user id", props.user_id);
        const followedUserId = this.checkIsIdValid("followed user id", props.followed_user_id);

        await relationshipRepository.startFollowedOneUser({
            user_id: userId,
            followed_user_id: followedUserId
        });
    }

    async stopFollowingAllUser(props: Pick<UserRelationshipIntrf, "user_id">) {
        const userId = this.checkIsIdValid("user id", props.user_id);

        await relationshipRepository.stopFollowingAllUser({ user_id: userId });
    }

    async stopFollowingOneUser(props: Pick<UserRelationshipIntrf, "followed_user_id">) {
        const followedUserId = this.checkIsIdValid("followed user id", props.followed_user_id);

        await relationshipRepository.stopFollowingOneUser({ followed_user_id: followedUserId });
    }
}

const relationshipService = new RelationshipService();

export default relationshipService;