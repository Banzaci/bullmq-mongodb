import express from "express";
import dotenv from "dotenv";
import { emailQueue, uploadQueue } from "./queues.js";
import Job from "./models/Job.js";

import "./workers/email.js";
import "./workers/upload.js";

dotenv.config();

const app = express();

app.use(express.json());

import { Queue } from "bullmq";


app.post("/send-email", async (req, res) => {
  const { email, subject, message } = req.body;

  const newJob = await Job.create({ type: "email", data: req.body });

  console.log("Adding jobs...");
  for (let i = 0; i < 100; i++) {
    await emailQueue.add(
      "sendEmail",
      { email: `${email}-${i}`, subject, message, jobId: newJob._id },
      { priority: 1, delay: 5000 }
    );
  }
  console.log("All jobs added!");

  res.json({ success: true, message: "Email created" });
});

app.post("/upload-document", async (req, res) => {
  const { filename } = req.body;

  const newJob = await Job.create({ type: "upload", data: req.body });

  const response = await uploadQueue.add(
    "uploadDocument",
    { filename, jobId: newJob._id },
    { priority: 2 } 
  );

  console.log(response.asJSON())

  res.json({ success: true, message: "Upload created" });
});

app.listen(3002, () => console.log("🚀 Server on 3002"));
