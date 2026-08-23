import { Db, MongoClient } from "mongodb";

const uri = import.meta.env.MONGODB_URI!;
const dbName = import.meta.env.MONGODB_DB_NAME ?? "mein-blogs";

let mongodb: MongoClient | null = null;
let connection: Db | null = null;;

export async function dbConnect() {
    if (connection) return connection;

    try {
        mongodb = new MongoClient(uri);
        await mongodb.connect();
        console.log("database connection successfully");
        connection = mongodb.db(dbName);
        return connection;
    } catch (error) {
        console.log("database connection failed");
    }
}

export function db() {
    if (!connection) throw new Error("database not exist");
    return connection;
}