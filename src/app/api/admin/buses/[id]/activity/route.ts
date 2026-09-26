import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { Bus } from "@/lib/models/Bus";
import { Transaction } from "@/lib/models/Transaction";

// Real boarding/drop-off activity for one bus's current trip, plus a
// payment-method breakdown. Admin-only — this shows individual riders'
// payment timing, not public data.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const check = await requireRole(["admin", "superadmin"]);
  if (!check.ok) return check.response;

  try {
    await connectDB();

    const bus = await Bus.findById(id);
    if (!bus) {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }

    if (!bus.tripId) {
      return NextResponse.json({
        bus: { busId: bus.busId, routeLabel: bus.routeLabel, occupancy: bus.occupancy },
        events: [],
        methodBreakdown: { qr: 0, nfc: 0 },
      });
    }

    const fares = await Transaction.find({
      busId: bus._id.toString(),
      tripId: bus.tripId,
      type: "fare",
    }).sort({ createdAt: 1 });

    const events = fares.map(t => ({
      userEmailMasked: maskEmail(t.userEmail),
      amount: t.amount,
      paymentMethod: t.paymentMethod,
      boardedAt: t.createdAt,
      disembarkedAt: t.disembarkedAt,
    }));

    const methodBreakdown = fares.reduce(
      (acc, t) => {
        if (t.paymentMethod === "qr") acc.qr += 1;
        else if (t.paymentMethod === "nfc") acc.nfc += 1;
        return acc;
      },
      { qr: 0, nfc: 0 }
    );

    return NextResponse.json({
      bus: { busId: bus.busId, routeLabel: bus.routeLabel, occupancy: bus.occupancy },
      events,
      methodBreakdown,
    });
  } catch (err) {
    console.error("GET /api/admin/buses/[id]/activity failed:", err);
    return NextResponse.json({ error: "Failed to fetch bus activity" }, { status: 500 });
  }
}

// Admin sees enough to recognize a repeat pattern, not a citizen's full
// email — e.g. "ke***@gmail.com" instead of "kenneth123@gmail.com".
function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return "•••";
  const visible = name.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(3, name.length - 2))}@${domain}`;
}