import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not set");
}

const globalWithMongoose = globalThis as typeof globalThis & {
  _mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
};

const cached = globalWithMongoose._mongoose ?? { conn: null, promise: null };
globalWithMongoose._mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}