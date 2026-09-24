import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Bus } from "@/lib/models/Bus";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    const role = session.user.role;
    if (role !== "driver" && role !== "admin") {
      return NextResponse.json({ error: "Not authorized" }, { status: 401 });
    }

    await connectDB();

    const body = await req.json();
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (body.status !== undefined)     updates.status = body.status;
    if (body.progress !== undefined)   updates.progress = body.progress;
    if (body.occupancy !== undefined)  updates.occupancy = body.occupancy;
    if (body.etaMinutes !== undefined) updates.etaMinutes = body.etaMinutes;

    // Admins can update any bus; drivers can only update their own.
    const filter = role === "admin"
      ? { _id: id }
      : { _id: id, driverEmail: session.user.email };

    const bus = await Bus.findOneAndUpdate(filter, updates, { new: true });

    if (!bus) {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, bus });
  } catch (err) {
    console.error("PATCH /api/buses/[id] failed:", err);
    return NextResponse.json({ error: "Failed to update bus" }, { status: 500 });
  }
}