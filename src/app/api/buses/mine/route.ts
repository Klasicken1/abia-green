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
    if (!session?.user?.email || session.user.role !== "driver") {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    await connectDB();
    const bus = await Bus.findOne({ driverEmail: session.user.email });
    return NextResponse.json(bus || null);
  } catch (err) {
    console.error("GET /api/buses/mine failed:", err);
    return NextResponse.json({ error: "Failed to fetch bus" }, { status: 500 });
  }
}