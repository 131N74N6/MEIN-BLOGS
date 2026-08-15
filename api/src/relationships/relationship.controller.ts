import { errorHandling } from "../errors/api.error";
import { Request, Response } from "express";
import { 
    followedUserIdSchema, 
    followerPaginationSchema, 
    userIdSchema 
} from "./relationship.validation";
import relationshipService from "./relationship.service";

class RelationshipController {
    async getUserFollowers(req: Request, res: Response) {
        try {
            const userId = userIdSchema.safeParse(req.params.user_id);
            if (!userId.success) return res.status(400).json({ message: "invalid data" });

            const pagination = followerPaginationSchema.safeParse(req.query);
            if (!pagination.success) return res.status(400).json({ message: "invalid data" });

            const followers = await relationshipService.getUserFollowers({
                user_id: userId.data, 
                limit: pagination.data.limit, 
                skip: pagination.data.skip
            });

            return res.status(200).json(followers);
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async getFollowedUser(req: Request, res: Response) {
        try {
            const userId = userIdSchema.safeParse(req.params.user_id);
            if (!userId.success) return res.status(400).json({ message: "invalid data" });

            const pagination = followerPaginationSchema.safeParse(req.query);
            if (!pagination.success) return res.status(400).json({ message: "invalid data" });

            const following = await relationshipService.getFollowedUser({
                user_id: userId.data, 
                limit: pagination.data.limit, 
                skip: pagination.data.skip
            });

            return res.status(200).json(following);
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async getFollowersTotal(req: Request, res: Response) {
        try {
            const userId = userIdSchema.safeParse(req.params.user_id);
            if (!userId.success) return res.status(400).json({ message: "invalid data" });

            const total = await relationshipService.getFollowersTotal({ 
                user_id: userId.data 
            });

            return res.status(200).json(total);
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async getFollowedUserTotal(req: Request, res: Response) {
        try {
            const userId = userIdSchema.safeParse(req.params.user_id);
            if (!userId.success) return res.status(400).json({ message: "invalid data" });

            const total = await relationshipService.getFollowedUserTotal({ 
                user_id: userId.data 
            });

            return res.status(200).json(total);
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async hasUserFollowed(req: Request, res: Response) {
        try {
            const userId = userIdSchema.safeParse(req.params.user_id);
            if (!userId.success) return res.status(400).json({ message: "invalid data" });

            const followedUserId = followedUserIdSchema.safeParse(req.params.followed_user_id);
            if (!followedUserId.success) return res.status(400).json({ message: "invalid data" });

            const hasUserFollowed = await relationshipService.hasUserFollowed({
                user_id: userId.data, followed_user_id: followedUserId.data
            });

            return res.status(200).json(hasUserFollowed);
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async startFollowedOneUser(req: Request, res: Response) {
        try {
            const userId = userIdSchema.safeParse(req.params.user_id);
            if (!userId.success) return res.status(400).json({ message: "invalid data" });

            const followedUserId = followedUserIdSchema.safeParse(req.params.followed_user_id);
            if (!followedUserId.success) return res.status(400).json({ message: "invalid data"});

            await relationshipService.startFollowedOneUser({
                user_id: userId.data, followed_user_id: followedUserId.data
            });

            return res.status(200).json({ message: "successfully followed" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async stopFollowingAllUser(req: Request, res: Response) {
        try {
            const userId = userIdSchema.safeParse(req.params.user_id);
            if (!userId.success) return res.status(400).json({ message: "invalid data" });

            await relationshipService.stopFollowingAllUser({ user_id: userId.data });
            return res.status(200).json({ message: "successfully unfollowed" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async stopFollowingOneUser(req: Request, res: Response) {
        try {
            const followedUserId = followedUserIdSchema.safeParse(req.params.followed_user_id);
            if (!followedUserId.success) return res.status(400).json({ message: "invalid data"});

            await relationshipService.stopFollowingOneUser({ followed_user_id: followedUserId.data });
            return res.status(200).json({ message: "successfully unfollowed" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }
}

const relationshipController = new RelationshipController();

export default relationshipController;