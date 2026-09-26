import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { User } from "@/lib/models/User";
import { Bus } from "@/lib/models/Bus";

// Every driver account, with their current bus assignment (if any) —
// joined by driverEmail since a driver has at most one Bus document.
export async function GET() {
  const check = await requireRole(["admin", "superadmin"]);
  if (!check.ok) return check.response;

  try {
    await connectDB();

    const drivers = await User.find({ role: "driver" }).sort({ createdAt: -1 });
    const emails = drivers.map(d => d.email);

    const assignments = await Bus.find({ driverEmail: { $in: emails } });
    const assignmentByEmail = new Map(assignments.map(b => [b.driverEmail, b]));

    const result = drivers.map(d => {
      const bus = assignmentByEmail.get(d.email);
      return {
        email: d.email,
        createdAt: d.createdAt,
        bus: bus
          ? {
              busId: bus.busId,
              routeLabel: bus.routeLabel,
              status: bus.status,
              occupancy: bus.occupancy,
              updatedAt: bus.updatedAt,
            }
          : null,
      };
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("GET /api/admin/drivers failed:", err);
    return NextResponse.json({ error: "Failed to fetch drivers" }, { status: 500 });
  }
}