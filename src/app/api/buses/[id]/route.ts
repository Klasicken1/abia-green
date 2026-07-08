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

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();
    if (!session?.user?.email || session.user.role !== "driver") {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (body.status !== undefined)     updates.status = body.status;
    if (body.progress !== undefined)   updates.progress = body.progress;
    if (body.occupancy !== undefined)  updates.occupancy = body.occupancy;
    if (body.etaMinutes !== undefined) updates.etaMinutes = body.etaMinutes;

    const bus = await Bus.findOneAndUpdate(
      { _id: params.id, driverEmail: session.user.email },
      updates,
      { new: true }
    );

    if (!bus) {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, bus });
  } catch (err) {
    console.error("PATCH /api/buses/[id] failed:", err);
    return NextResponse.json({ error: "Failed to update bus" }, { status: 500 });
  }
}