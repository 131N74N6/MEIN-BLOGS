import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import relationshipController from "./relationship.controller";

const relationshipRouters = Router();

relationshipRouters.get("/followers", verifyToken, relationshipController.getUserFollowers);

relationshipRouters.get("/followed", verifyToken, relationshipController.getFollowedUser);

relationshipRouters.get("/followers/total", verifyToken, relationshipController.getFollowersTotal);

relationshipRouters.get("/followed/total", verifyToken, relationshipController.getFollowedUserTotal);

relationshipRouters.get("/has-followed/:followed_user_id", verifyToken, relationshipController.hasUserFollowed);

relationshipRouters.post("/follow/:followed_user_id", verifyToken, relationshipController.startFollowedOneUser);

relationshipRouters.delete("/unfollow-all", verifyToken, relationshipController.stopFollowingAllUser);

relationshipRouters.delete("/unfollow-one/:followed_user_id", verifyToken, relationshipController.stopFollowingOneUser);

export default relationshipRouters;