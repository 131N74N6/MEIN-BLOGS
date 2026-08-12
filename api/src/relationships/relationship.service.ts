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
        const currentUserId = this.checkIsIdValid("current user id", props.current_user_id);

        return await relationshipRepository.getUserFollowers({
            current_user_id: currentUserId, limit: props.limit, skip: props.skip
        });
    }

    async getFollowedUser(props: Omit<UserRelationshipIntrf, "followed_user_id">) {
        const currentUserId = this.checkIsIdValid("current user id", props.current_user_id);

        return await relationshipRepository.getFollowedUsers({
            current_user_id: currentUserId, limit: props.limit, skip: props.skip
        });
    }

    async getFollowersTotal(props: Pick<UserRelationshipIntrf, "current_user_id">) {
        const currentUserId = this.checkIsIdValid("current user id", props.current_user_id);
        return await relationshipRepository.getFollowersTotal({ current_user_id: currentUserId });
    }

    async getFollowedUserTotal(props: Pick<UserRelationshipIntrf, "current_user_id">) {
        const currentUserId = this.checkIsIdValid("current user id", props.current_user_id);
        return await relationshipRepository.getFollowedUserTotal({ current_user_id: currentUserId });
    }

    async hasUserFollowed(props: Pick<UserRelationshipIntrf, "current_user_id" | "followed_user_id">) {
        const currentUserId = this.checkIsIdValid("current user id", props.current_user_id);
        const followedUserId = this.checkIsIdValid("followed user id", props.followed_user_id);
        
        const hasFollowed = await relationshipRepository.hasUserFollowed({
            current_user_id: currentUserId, followed_user_id: followedUserId
        });

        return Boolean(hasFollowed);
    }

    async startFollowedOneUser(props: Pick<UserRelationshipIntrf, "current_user_id" | "followed_user_id">) {
        const currentUserId = this.checkIsIdValid("current user id", props.current_user_id);
        const followedUserId = this.checkIsIdValid("followed user id", props.followed_user_id);

        await relationshipRepository.startFollowedOneUser({
            current_user_id: currentUserId,
            followed_user_id: followedUserId
        });
    }

    async stopFollowingAllUser(props: Pick<UserRelationshipIntrf, "current_user_id">) {
        const currentUserId = this.checkIsIdValid("current user id", props.current_user_id);

        await relationshipRepository.stopFollowingAllUser({ current_user_id: currentUserId });
    }

    async stopFollowingOneUser(props: Pick<UserRelationshipIntrf, "followed_user_id">) {
        const followedUserId = this.checkIsIdValid("followed user id", props.followed_user_id);

        await relationshipRepository.stopFollowingOneUser({ followed_user_id: followedUserId });
    }
}

const relationshipService = new RelationshipService();

export default relationshipService;