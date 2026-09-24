import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Report } from "@/lib/models/Report";
import { requireRole } from "@/lib/rbac";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await connectDB();
    const report = await Report.findOne({ trackingId: id.toUpperCase() });
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
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const check = await requireRole(["admin", "superadmin"]);
  if (!check.ok) return check.response;

  try {
    await connectDB();
    const body = await req.json();
    const { status, rejectionReason } = body;

    const update: Record<string, unknown> = { status };

    if (status === "rejected" || status === "resolved") {
      update.moderatedBy = check.email;
      update.moderatedAt = new Date();
    }
    if (status === "rejected" && rejectionReason) {
      update.rejectionReason = rejectionReason;
    }

    const report = await Report.findByIdAndUpdate(id, update, { new: true });

    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch {
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}