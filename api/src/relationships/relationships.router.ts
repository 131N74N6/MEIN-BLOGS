import { Router } from "express";
import { verifyToken } from "../middlewares/auth.middleware";
import relationshipController from "./relationship.controller";

const relationshipRouters = Router();

relationshipRouters.get("/followers", verifyToken, relationshipController.getUserFollowers);

relationshipRouters.get("/following", verifyToken, relationshipController.getFollowedUser);

relationshipRouters.get("/followers/total", verifyToken, relationshipController.getFollowersTotal);

relationshipRouters.get("/following/total", verifyToken, relationshipController.getFollowedUserTotal);

relationshipRouters.get("/has-followed", verifyToken, relationshipController.hasUserFollowed);

relationshipRouters.post("/follow", verifyToken, relationshipController.startFollowedOneUser);

relationshipRouters.delete("/unfollow-all", verifyToken, relationshipController.stopFollowingAllUser);

relationshipRouters.delete("/unfollow-one", verifyToken, relationshipController.stopFollowingOneUser);

export default relationshipRouters;