import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Report } from "@/lib/models/Report";
import { requireRole } from "@/lib/rbac";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Public — citizens track their own report by trackingId, no auth needed.
  try {
    await connectDB();
    const report = await Report.findOne({ trackingId: params.id.toUpperCase() });
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }
    return NextResponse.json(report);
  } catch {
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Previously anyone who guessed a report's Mongo _id could change its
  // status — no auth check existed. Now gated to admin/superadmin.
  const check = await requireRole(["admin", "superadmin"]);
  if (!check.ok) return check.response;

  try {
    await connectDB();
    const body = await req.json();
    const { status, rejectionReason } = body;

    const update: Record<string, unknown> = { status };

    // Log who moderated a held or rejected report, and when.
    if (status === "rejected" || status === "resolved") {
      update.moderatedBy = check.email;
      update.moderatedAt = new Date();
    }
    if (status === "rejected" && rejectionReason) {
      update.rejectionReason = rejectionReason;
    }

    const report = await Report.findByIdAndUpdate(params.id, update, { new: true });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch {
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}