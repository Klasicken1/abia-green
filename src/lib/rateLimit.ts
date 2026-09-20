import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

const RateLimitSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  count: { type: Number, default: 0 },
  windowStart: { type: Date, default: Date.now },
});

const RateLimit = mongoose.models.RateLimit || mongoose.model("RateLimit", RateLimitSchema);

/**
 * Mongo-backed sliding window limiter — works across serverless invocations
 * (an in-memory limiter resets every cold start on Vercel, so it's useless
 * in production). Returns true if the request should be allowed.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  await connectDB();
  const now = new Date();
  const windowStartCutoff = new Date(now.getTime() - windowMs);

  const existing = await RateLimit.findOne({ key });

  if (!existing || existing.windowStart < windowStartCutoff) {
    await RateLimit.findOneAndUpdate(
      { key },
      { count: 1, windowStart: now },
      { upsert: true }
    );
    return true;
  }

  if (existing.count >= maxRequests) {
    return false;
  }

  existing.count += 1;
  await existing.save();
  return true;
}