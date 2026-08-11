import { db } from "./utils/mongodb.utility";
import helmet from "helmet";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import userRouters from "./users/user.router";
import blogRouters from "./blogs/blog.router";
import commentRouters from "./comments/comment.router";
import followerRouters from "./followers/follower.router";

const port = process.env.PORT || 5172;
const app = express();

app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: ["http://localhost:5172", "http://localhost:5173"]
}));
app.get("/", (_, res) => res.send("api is running"));
app.get("/api", (_, res) => res.send("api services is running"));
app.use("/api/blogs", blogRouters);
app.use("/api/comments", commentRouters);
app.use("/api/followers", followerRouters);
app.use("/api/users", userRouters);

if (process.env.NODE_ENV !== "production") {
    db.then(() => {
        app.listen(port, () => console.log(`api runs on http://localhost:5172`));
    });
}

export default app;