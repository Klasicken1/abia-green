import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Incident } from "@/lib/models/Incident";
import { Bus } from "@/lib/models/Bus";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { busId, category, severity, description, photoUrl, photoPublicId } = body;

    if (!busId || !category) {
      return NextResponse.json({ error: "busId and category are required" }, { status: 400 });
    }

    const bus = await Bus.findById(busId);
    if (!bus) {
      return NextResponse.json({ error: "Bus not found" }, { status: 404 });
    }

    const incident = await Incident.create({
      reporterEmail: session.user.email,
      reporterRole: session.user.role || "citizen",
      busId,
      busLabel: bus.busId,
      route: bus.route,
      category,
      severity: severity || "moderate",
      description: description || "",
      photoUrl: photoUrl || null,
      photoPublicId: photoPublicId || null,
    });

    return NextResponse.json({ success: true, incident }, { status: 201 });
  } catch (err) {
    console.error("POST /api/incidents failed:", err);
    return NextResponse.json({ error: "Failed to submit incident" }, { status: 500 });
  }
}

// GET — admins see every incident; anyone else sees only their own.
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const role = session.user.role;
    const isAdmin = role === "admin" || role === "superadmin";

    const incidents = await Incident.find(
      isAdmin ? {} : { reporterEmail: session.user.email }
    ).sort({ createdAt: -1 }).limit(100);

    return NextResponse.json(incidents);
  } catch (err) {
    console.error("GET /api/incidents failed:", err);
    return NextResponse.json({ error: "Failed to fetch incidents" }, { status: 500 });
  }
}