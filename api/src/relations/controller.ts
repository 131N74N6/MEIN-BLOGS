import { TRelation } from "./model";
import relationService from "./service";

class RelationController {
    async getUserFollowers(query: Omit<TRelation["pagination"], "skip" | "followed_user_id">) {
        const page = query.page;
        const limit = query.limit;
        const skip = (page - 1) * limit;

        const followers = await relationService.getUserFollowers({
            user_id: query.user_id, page: page, limit: limit, skip: skip
        });

        return { data: followers, message: "followers retrieved successfully", success: true };
    }

    async getFollowedUser(query: Omit<TRelation["pagination"], "skip" | "followed_user_id">) {
        const page = query.page;
        const limit = query.limit;
        const skip = (page - 1) * limit;

        const following = await relationService.getFollowedUser({
            user_id: query.user_id, page: page, limit: limit, skip: skip
        });

        return { data: following, message: "followed user retrieved successfully", success: true };
    }

    async getFollowersTotal(params: Pick<TRelation["add"], "user_id">) {
        const total = await relationService.getFollowersTotal({ user_id: params.user_id });
        return { data: total, message: "followers total retrieved successfully", success: true };
    }

    async getFollowedUserTotal(params: Pick<TRelation["add"], "user_id">) {
        const total = await relationService.getFollowedUserTotal({ user_id: params.user_id });
        return { data: total, message: "followed total retrieved successfully", success: true };
    }

    async hasUserFollowed(props: Pick<TRelation["add"], "user_id" | "followed_user_id">) {
        const hasUserFollowed = await relationService.hasUserFollowed({
            user_id: props.user_id, followed_user_id: props.followed_user_id
        });

        return { data: hasUserFollowed, message: "verification retrieved successfully", success: true };
    }

    async startFollowedOneUser(body: TRelation["add"]) {
        await relationService.startFollowedOneUser({
            user_id: body.user_id, followed_user_id: body.followed_user_id
        });

        return { message: "successfully followed", success: true };
    }

    async stopFollowingOneUser(props: Pick<TRelation["add"], "followed_user_id">) {
        await relationService.stopFollowingOneUser({ followed_user_id: props.followed_user_id });
        return { message: "successfully unfollowed", success: true };
    }
}

const relationController = new RelationController();

export default relationController;