import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Transaction } from "@/lib/models/Transaction";
import { Bus } from "@/lib/models/Bus";

// The citizen's current open ride, if any — a fare Transaction they
// haven't tapped "I'm getting off" for yet, on a bus still actually on
// that same trip. Used for the persistent banner in the transport tab,
// independent of the payment screen.
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const txn = await Transaction.findOne({
      userEmail: session.user.email,
      type: "fare",
      disembarkedAt: null,
    }).sort({ createdAt: -1 });

    if (!txn) {
      return NextResponse.json({ activeRide: null });
    }

    const bus = await Bus.findById(txn.busId);

    // Defensive cleanup: if the bus's trip has moved on since this fare
    // was charged (ended, or a new trip started), this ride is stale.
    if (!bus || bus.tripId !== txn.tripId) {
      txn.disembarkedAt = new Date();
      await txn.save();
      return NextResponse.json({ activeRide: null });
    }

    return NextResponse.json({
      activeRide: {
        busId: bus._id.toString(),
        busLabel: bus.busId,
        routeLabel: bus.routeLabel,
        fare: txn.amount,
        boardedAt: txn.createdAt,
      },
    });
  } catch (err) {
    console.error("GET /api/wallet/active-ride failed:", err);
    return NextResponse.json({ error: "Failed to fetch ride status" }, { status: 500 });
  }
}