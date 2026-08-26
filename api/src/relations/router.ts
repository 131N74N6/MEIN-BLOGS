import Elysia, { t } from "elysia";
import { authMiddleware } from "../auth/middleware";
import relationController from "./controller";
import { relationSchema } from "./model";

const relationsRouters = new Elysia({ prefix: "/api/relations" })
.use(authMiddleware)
.delete("/:followed_user_id", async ({ params }) => {
    return await relationController.stopFollowingOneUser({
        followed_user_id: params.followed_user_id
    });
}, {
    params: t.Pick(relationSchema.params, ["followed_user_id"])
})
.get("/followers/:user_id", async ({ params, query }) => {
    return await relationController.getUserFollowers({
        user_id: params.user_id, page: query.page, limit: query.limit
    });
}, {
    params: t.Pick(relationSchema.params, ["user_id"]),
    query: t.Pick(relationSchema.pagination, ["page", "limit"])
})
.get("/followed/:user_id", async ({ params, query }) => {
    return await relationController.getFollowedUser({
        user_id: params.user_id, page: query.page, limit: query.limit
    });
}, {
    params: t.Pick(relationSchema.params, ["user_id"]),
    query: t.Pick(relationSchema.pagination, ["page", "limit"])
})
.get("/followed/:user_id/total", async ({ params }) => {
    return await relationController.getFollowedUserTotal({ user_id: params.user_id });
}, {
    params: t.Pick(relationSchema.params, ["user_id"])
})
.get("/followers/:user_id/total", async ({ params }) => {
    return await relationController.getFollowersTotal({ user_id: params.user_id });
}, {
    params: t.Pick(relationSchema.params, ["user_id"])
})
.get("/has-followed/:user_id/:followed_user_id", async ({ params }) => {
    return await relationController.hasUserFollowed({
        followed_user_id: params.followed_user_id, user_id: params.user_id
    });
}, {
    params: relationSchema.params
})
.post("/:followed_user_id", async ({ params, user }) => await relationController.startFollowedOneUser({
    followed_user_id: params.followed_user_id, user_id: user.id
}), {
    params: t.Pick(relationSchema.params, ["followed_user_id"])
});

export default relationsRouters;