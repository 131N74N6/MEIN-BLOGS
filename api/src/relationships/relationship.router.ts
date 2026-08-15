import { Router } from "express";
import { verifyToken } from "../users/user.middleware";
import relationshipController from "./relationship.controller";

const relationshipRouters = Router();

relationshipRouters.delete(
    "/unfollow-all/:user_id", 
    verifyToken, 
    relationshipController.stopFollowingAllUser
);

relationshipRouters.delete(
    "/unfollow-one/:followed_user_id", 
    verifyToken, 
    relationshipController.stopFollowingOneUser
);

relationshipRouters.get(
    "/followers/:user_id", 
    verifyToken, 
    relationshipController.getUserFollowers
);

relationshipRouters.get(
    "/followed/:user_id", 
    verifyToken, 
    relationshipController.getFollowedUser
);

relationshipRouters.get(
    "/followers/:user_id/total", 
    verifyToken, 
    relationshipController.getFollowersTotal
);

relationshipRouters.get(
    "/followed/:user_id/total", 
    verifyToken, 
    relationshipController.getFollowedUserTotal
);

relationshipRouters.get(
    "/has-followed/:user_id/:followed_user_id", 
    verifyToken, 
    relationshipController.hasUserFollowed
);

relationshipRouters.post(
    "/follow/:user_id/:followed_user_id", 
    verifyToken, 
    relationshipController.startFollowedOneUser
);

export default relationshipRouters;