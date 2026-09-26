import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { requireRole } from "@/lib/rbac";
import { Incident } from "@/lib/models/Incident";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const check = await requireRole(["admin", "superadmin"]);
  if (!check.ok) return check.response;

  try {
    await connectDB();
    const body = await req.json();
    const { status } = body;

    if (!["pending", "in_review", "resolved"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const update: Record<string, unknown> = { status };
    if (status === "resolved") {
      update.resolvedBy = check.email;
      update.resolvedAt = new Date();
    }

    const incident = await Incident.findByIdAndUpdate(id, update, { new: true });
    if (!incident) {
      return NextResponse.json({ error: "Incident not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, incident });
  } catch (err) {
    console.error("PATCH /api/incidents/[id] failed:", err);
    return NextResponse.json({ error: "Failed to update incident" }, { status: 500 });
  }
}