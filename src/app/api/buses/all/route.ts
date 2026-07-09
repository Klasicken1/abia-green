import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { Bus } from "@/lib/models/Bus";

const MONGODB_URI = process.env.MONGODB_URI!;
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGODB_URI);
  isConnected = true;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email || session.user.role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    await connectDB();
    const buses = await Bus.find({}).sort({ updatedAt: -1 });
    return NextResponse.json(buses);
  } catch (err) {
    console.error("GET /api/buses/all failed:", err);
    return NextResponse.json({ error: "Failed to fetch buses" }, { status: 500 });
  }
}