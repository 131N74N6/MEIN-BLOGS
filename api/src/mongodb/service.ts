import { Db, MongoClient } from "mongodb";

const uri = import.meta.env.MONGODB_URI!;
const dbName = import.meta.env.MONGODB_DB_NAME!;

export const mongodbClient = new MongoClient(uri);

// Inisialisasi koneksi langsung di top-level
try {
    await mongodbClient.connect();
    console.log("database connection successfully");
} catch (error) {
    console.error("database connection failed:", error);
    process.exit(1);
}

const connection: Db = mongodbClient.db(dbName);

// Export db sebagai fungsi sinkron yang mengembalikan instance Db
export function db(): Db {
    return connection;
}

// Opsional: Untuk kompatibilitas jika masih dipanggil di index.ts
export async function dbConnect(): Promise<Db> {
    return connection;
}