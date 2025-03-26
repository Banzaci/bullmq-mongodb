import { Queue } from "bullmq";
import { redisClient } from "./config.js";

export const emailQueue = new Queue("emailQueue", {
  connection: redisClient,
});

export const uploadQueue = new Queue("uploadQueue", {
  connection: redisClient,
});
