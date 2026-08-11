import { errorHandling } from "../errors/api.error";
import { AuthRequest } from "../middlewares/auth.middleware";
import { Response } from "express";
import { followerPaginationSchema } from "./follower.validation";
import followerService from "./follower.service";

class FollowerController {
    async getUserFollowers(req: AuthRequest, res: Response) {
        try {
            const currentUserId = req.user?.user_id;
            if (!currentUserId) return res.status(401).json({ message: "unauthorized" });

            const pagination = followerPaginationSchema.safeParse(req.query ?? {});
            if (!pagination.success) return res.status(400).json({ message: "invalid pagination" });

            const followers = await followerService.getUserFollowers({
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

            const pagination = followerPaginationSchema.safeParse(req.query ?? {});
            if (!pagination.success) return res.status(400).json({ message: "invalid pagination" });

            const following = await followerService.getFollowedUser({
                current_user_id: currentUserId, limit: pagination.data.limit, skip: pagination.data.skip
            });

            res.status(200).json(following);
        } catch (error) {
            return errorHandling(res, error);
        }
    }

    async getFollowersTotal(req: AuthRequest, res: Response) {}

    async getFollowedUserTotal(req: AuthRequest, res: Response) {}

    async startFollowedOneUser(req: AuthRequest, res: Response) {}

    async stopFollowingAllUser(req: AuthRequest, res: Response) {}

    async stopFollowingOneUser(req: AuthRequest, res: Response) {}
}

const followerController = new FollowerController();

export default followerController;