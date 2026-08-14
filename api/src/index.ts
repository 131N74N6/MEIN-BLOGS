import { db } from "./utils/mongodb.utility";
import helmet from "helmet";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import userRouters from "./users/user.router";
import blogRouters from "./blogs/blog.router";
import commentRouters from "./comments/comment.router";
import relationshipRouters from "./relationships/relationships.router";
import viewerRouters from "./viewers/viewer.router";
import { v2 } from "cloudinary";
import { rateLimiter } from "./utils/rate-limit.utility";

const port = process.env.PORT || 5172;
const app = express();

app.use(helmet());
app.use(rateLimiter);
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: ["http://localhost:5172", "http://localhost:5173"]
}));
v2.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME
})
app.use("/api/blogs", blogRouters);
app.use("/api/comments", commentRouters);
app.use("/api/relationships", relationshipRouters);
app.use("/api/users", userRouters);
app.use("/api/viewers", viewerRouters);
app.get("/", (_, res) => res.send("api is running perfectly"));
app.get("/api", (_, res) => res.send("api routes is accessible"));

if (process.env.NODE_ENV !== "production") {
    db.then(() => {
        app.listen(port, () => console.log(`api runs on http://localhost:5172`));
    });
}

export default app;