import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Bus } from "@/lib/models/Bus";
import { Transaction } from "@/lib/models/Transaction";
import { ROUTES } from "@/lib/routesData";
import { parseNairaFare, calculateBoardingFare } from "@/lib/fare";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const bus = await Bus.findById(id);
    if (!bus) {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }

    const routeInfo = ROUTES[bus.route];
    const fullFare = routeInfo ? parseNairaFare(routeInfo.fare) : 0;
    const currentFare = fullFare ? calculateBoardingFare(fullFare, bus.progress) : null;

    return NextResponse.json({
      _id: bus._id,
      busId: bus.busId,
      route: bus.route,
      routeLabel: bus.routeLabel,
      status: bus.status,
      fare: currentFare !== null ? `₦${currentFare.toLocaleString()}` : null,
    });
  } catch (err) {
    console.error("GET /api/buses/[id] failed:", err);
    return NextResponse.json({ error: "Failed to fetch bus" }, { status: 500 });
  }
}

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

    if (body.status !== undefined) {
      updates.status = body.status;
      if (body.status === "idle") updates.tripId = null;
    }
    if (body.progress !== undefined)   updates.progress = body.progress;
    if (body.occupancy !== undefined)  updates.occupancy = body.occupancy;
    if (body.etaMinutes !== undefined) updates.etaMinutes = body.etaMinutes;

    const filter = role === "admin"
      ? { _id: id }
      : { _id: id, driverEmail: session.user.email };

    // Ending a trip closes out anyone who never tapped "I'm getting off" —
    // the trip ending is itself the end of their ride, so their fare
    // Transaction shouldn't sit open forever.
    if (body.status === "idle") {
      const existing = await Bus.findOne(filter);
      if (existing?.tripId) {
        await Transaction.updateMany(
          { busId: id, tripId: existing.tripId, type: "fare", disembarkedAt: null },
          { $set: { disembarkedAt: new Date() } }
        );
      }
    }

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