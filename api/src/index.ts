import dns from "node:dns/promises";
import dotenv from "dotenv";
dotenv.config();

if (process.env.NODE_ENV !== "production") {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
    console.log("using dns server 1.1.1.1 and 8.8.8.8....");
}

import { db } from "./mongodb/mongodb.service";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import express from "express";
import cookieParser from "cookie-parser";
import userRouters from "./users/user.router";
import blogRouters from "./blogs/blog.router";
import commentRouters from "./comments/comment.router";
import relationshipRouters from "./relationships/relationship.router";
import viewerRouters from "./viewers/viewer.router";
import { v2 } from "cloudinary";

const port = process.env.PORT || 5172;
const app = express();

app.use(helmet());
app.use(rateLimit({
    legacyHeaders: false,
    limit: 50,
    message: { message: "too many authentication attempts, please try again later" },
    standardHeaders: true,
    windowMs: 20 * 60 * 1000, // 20 minutes
}));
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
});
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