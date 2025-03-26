import { Worker } from "bullmq";
import Job from "../models/Job.js";
import { redisClient } from "../config.js";

const worker = new Worker(
  "uploadQueue",
  async (job) => {
    try {
      console.log(`📁 Uploading document: ${job.data.filename}`);
      await Job.findByIdAndUpdate(job.data.dbId, { status: "processing" });
      await new Promise((resolve) => setTimeout(resolve, 10000));
      console.log(`✅ Dokument uploaded: ${job.data.filename}`);
      await Job.findByIdAndUpdate(job.data.jobId, { status: "completed" });
    } catch (error) {
      console.error("❌ Error:", error);
      await Job.findByIdAndUpdate(job.data.jobId, { status: "failed" });
      throw error;
    }
  },
  {
    ...redisClient,
    attempts: 3,
    backoff: { type: "fixed", delay: 5000 },
  }
);

worker.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed successfully.`);
});

worker.on("failed", async (job, err) => {
  console.error(`❌ Job ${job.id} failed:`, err);
  if (job.attemptsMade >= job.opts.attempts) {
    console.error(`⚠️ Job ${job.id} reached max retries!`);
  }
});
console.log("👷 Upload Worker runs...");
