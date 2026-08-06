import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export const db = mongoose.connect(`${process.env.MONGODB_URL}`)
.then(res => {if (res) console.log("database connected")})
.catch(error => console.log(`database connection failed: ${error}`));