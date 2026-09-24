import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Bus } from "@/lib/models/Bus";
import { recordTelemetry } from "@/lib/telemetry";

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email || session.user.role !== "driver") {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const { progress, occupancy, etaMinutes } = body;

    // A driver can only report telemetry for their own bus — never trust
    // a client-supplied busId without checking ownership.
    const bus = await Bus.findOne({ driverEmail: session.user.email });
    if (!bus) {
      return NextResponse.json({ error: "No active bus found for this driver" }, { status: 404 });
    }

    const updated = await recordTelemetry({
      busId: bus._id.toString(),
      progress,
      occupancy,
      etaMinutes,
      source: "manual",
    });

    return NextResponse.json({ success: true, bus: updated });
  } catch (err) {
    console.error("PATCH /api/buses/telemetry failed:", err);
    return NextResponse.json({ error: "Failed to record telemetry" }, { status: 500 });
  }
}