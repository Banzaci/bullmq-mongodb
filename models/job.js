import mongoose, { Schema, Document, Model } from "mongoose";
const jobSchema = new mongoose.Schema({
  type: String, // "email" or "upload"
  data: Object,
  status: { type: String, default: "pending" }, // pending, completed, failed
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Job", jobSchema);

