import dns from "node:dns/promises";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

if (process.env.NODE_ENV !== "production") {
    dns.setServers(["1.1.1.1", "8.8.8.8"]);
    console.log("using dns server 1.1.1.1 and 8.8.8.8....");
}

mongoose.set("sanitizeFilter", true);

export const db = mongoose.connect(`${process.env.MONGODB_URL}`)
.then(res => {if (res) console.log("database connected")})
.catch(error => console.log(`database connection failed: ${error}`));