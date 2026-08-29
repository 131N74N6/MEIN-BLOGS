import { ObjectId } from "mongodb";
import relationRepository from "./repository";
import { TRelation } from "./model";
import { BlogApiError } from "../error/handler";

class RelationService {
    private checkIsIdValid(fieldName: string, value: unknown) {
        const isNotValid = value === "" || typeof value !== "string" || !ObjectId.isValid(value);
        if (isNotValid) throw new BlogApiError(400, `invalid ${fieldName}`);

        return value;
    }

    async getUserFollowers(props: Omit<TRelation["pagination"], "followed_user_id">) {
        const userId = this.checkIsIdValid("user id", props.user_id);

        return await relationRepository.getUserFollowers({
            user_id: userId, limit: props.limit, skip: props.skip
        });
    }

    async getFollowedUser(props: Omit<TRelation["pagination"], "followed_user_id">) {
        const userId = this.checkIsIdValid("user id", props.user_id);

        return await relationRepository.getFollowedUsers({
            user_id: userId, limit: props.limit, skip: props.skip
        });
    }

    async getFollowersTotal(props: Pick<TRelation["add"], "user_id">) {
        const userId = this.checkIsIdValid("user id", props.user_id);
        return await relationRepository.getFollowersTotal({ user_id: userId });
    }

    async getFollowedUserTotal(props: Pick<TRelation["add"], "user_id">) {
        const userId = this.checkIsIdValid("user id", props.user_id);
        return await relationRepository.getFollowedUserTotal({ user_id: userId });
    }

    async hasUserFollowed(props: Pick<TRelation["add"], "user_id" | "followed_user_id">) {
        const userId = this.checkIsIdValid("user id", props.user_id);
        const followedUserId = this.checkIsIdValid("followed user id", props.followed_user_id);
        
        return await relationRepository.hasUserFollowed({
            user_id: userId, followed_user_id: followedUserId
        });
    }

    async startFollowedOneUser(props: TRelation["add"]) {
        const userId = this.checkIsIdValid("user id", props.user_id);
        const followedUserId = this.checkIsIdValid("followed user id", props.followed_user_id);

        await relationRepository.startFollowedOneUser({
            user_id: userId, followed_user_id: followedUserId,
        });
    }

    async stopFollowingOneUser(props: Pick<TRelation["add"], "followed_user_id">) {
        const followedUserId = this.checkIsIdValid("followed user id", props.followed_user_id);
        await relationRepository.stopFollowingOneUser({ followed_user_id: followedUserId });
    }
}

const relationService = new RelationService();

export default relationService;