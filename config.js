import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const redisClient = { connection: { host: "127.0.0.1", port: 6379 } };

export { redisClient };
