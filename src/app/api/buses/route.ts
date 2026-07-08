import { NextRequest, NextResponse } from "next/server";
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

// GET — public list of all buses currently on_route (for riders)
export async function GET() {
  try {
    await connectDB();
    const buses = await Bus.find({ status: "on_route" }).sort({ updatedAt: -1 });
    return NextResponse.json(buses);
  } catch (err) {
    console.error("GET /api/buses failed:", err);
    return NextResponse.json({ error: "Failed to fetch buses" }, { status: 500 });
  }
}

// POST — driver starts/updates their bus (upsert by driverEmail)
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || session.user.role !== "driver") {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { busId, route, routeLabel, status, progress, occupancy, etaMinutes } = body;

    if (!busId || !route || !routeLabel) {
      return NextResponse.json(
        { error: "busId, route, and routeLabel are required" },
        { status: 400 }
      );
    }

    const bus = await Bus.findOneAndUpdate(
      { driverEmail: session.user.email },
      {
        busId,
        route,
        routeLabel,
        driverEmail: session.user.email,
        status: status ?? "idle",
        progress: progress ?? 0,
        occupancy: occupancy ?? 0,
        etaMinutes: etaMinutes ?? null,
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, bus });
  } catch (err) {
    console.error("POST /api/buses failed:", err);
    return NextResponse.json({ error: "Failed to update bus" }, { status: 500 });
  }
}