import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { Queue, Worker } from "bullmq";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

mongoose.connect("mongodb://127.0.0.1:27017/jobsDB");

const JobSchema = new mongoose.Schema({
  name: String,
  status: { type: String, default: "pending" }, // pending, completed, failed
  result: String,
  createdAt: { type: Date, default: Date.now },
});

const JobModel = mongoose.model("Job", JobSchema);

const redisOptions = { connection: { host: "127.0.0.1", port: 6379 } };

const taskQueue = new Queue("taskQueue", redisOptions);

const worker = new Worker(
  "taskQueue",
  async (job) => {
    console.log(`Processing job ${job.id} with data:`, job.data, 'ob.name', + job.name);
    await JobModel.findByIdAndUpdate(job.data.dbId, { status: "processing" });
    try {
      await JobModel.findByIdAndUpdate(job.data.dbId, {
        status: "completed",
        result: "Success",
      });
      console.log(`Job ${job.id} completed!`);
      return { result: "Success" };
    } catch (error) {
      await JobModel.findByIdAndUpdate(job.data.dbId, {
        status: "failed",
        result: error.message,
      });
      throw error;
    }
  },
  {
    ...redisOptions,
    concurrency: 5, // 5 jobs simul
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

app.use(express.json());

// API: Add to jobb in cue with MongoDB
app.post("/add-job", async (req, res) => {
  const { name, delay = 0, priority = 1, repeatEvery = null } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  const newJob = new JobModel({ name });
  await newJob.save();

  const jobOptions = {
    delay, // delay 1 hr for example
    attempts: 3, // Max retries
    backoff: { type: "exponential", delay: 1000 }, // Waith if error
    priority, // Lower number = higher prioritet
  };

  if (repeatEvery) {
    jobOptions.repeat = { every: repeatEvery }; // Schemalagda jobb
  }

  const job = await taskQueue.add("simpleJob", { name, dbId: newJob._id }, jobOptions);

  res.json({ message: "Job added", jobId: job.id, dbId: newJob._id });
});

app.get("/jobs", async (req, res) => {
  const jobs = await JobModel.find().sort({ createdAt: -1 });
  res.json(jobs);
});

app.listen(port, () => {
  console.log(`🚀 Server is running on http://localhost:${port}`);
});
