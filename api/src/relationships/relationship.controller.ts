import { errorHandling } from "../errors/api.error";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Request, Response } from "express";
import { followedUserIdSchema, followerPaginationSchema } from "./relationship.validation";
import relationshipService from "./relationship.service";

class RelationshipController {
    async getUserFollowers(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const pagination = followerPaginationSchema.safeParse(req.query);
            if (!pagination.success) return res.status(400).json({ message: "invalid pagination" });

            const followers = await relationshipService.getUserFollowers({
                current_user_id: currentUserId, limit: pagination.data.limit, skip: pagination.data.skip
            });

            res.status(200).json(followers);
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async getFollowedUser(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const pagination = followerPaginationSchema.safeParse(req.query);
            if (!pagination.success) return res.status(400).json({ message: "invalid pagination" });

            const following = await relationshipService.getFollowedUser({
                current_user_id: currentUserId, limit: pagination.data.limit, skip: pagination.data.skip
            });

            res.status(200).json(following);
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async getFollowersTotal(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const total = await relationshipService.getFollowersTotal({ current_user_id: currentUserId });
            res.status(200).json(total);
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async getFollowedUserTotal(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const total = await relationshipService.getFollowedUserTotal({ current_user_id: currentUserId });
            res.status(200).json(total);
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async hasUserFollowed(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const followedUserId = followedUserIdSchema.safeParse(req.params.followed_user_id);
            if (!followedUserId.success) return res.status(400).json({ message: "invalid followed user id" });

            const hasUserFollowed = await relationshipService.hasUserFollowed({
                current_user_id: currentUserId, followed_user_id: followedUserId.data
            });

            res.status(200).json(hasUserFollowed);
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async startFollowedOneUser(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const followedUserId = followedUserIdSchema.safeParse(req.params.followed_user_id);
            if (!followedUserId.success) return res.status(400).json({ message: "invalid followed user id"});

            await relationshipService.startFollowedOneUser({
                current_user_id: currentUserId, followed_user_id: followedUserId.data
            });

            res.status(200).json({ message: "successfully followed" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async stopFollowingAllUser(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            await relationshipService.stopFollowingAllUser({ current_user_id: currentUserId });
            res.status(200).json({ message: "successfully unfollowed" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async stopFollowingOneUser(req: Request, res: Response) {
        try {
            const followedUserId = followedUserIdSchema.safeParse(req.params.followed_user_id);
            if (!followedUserId.success) return res.status(400).json({ message: "invalid followed user id"});

            await relationshipService.stopFollowingOneUser({ followed_user_id: followedUserId.data });
            res.status(200).json({ message: "successfully unfollowed" });
        } catch (error) {
            return errorHandling(res, error);
        }
    }
}

const relationshipController = new RelationshipController();

export default relationshipController;