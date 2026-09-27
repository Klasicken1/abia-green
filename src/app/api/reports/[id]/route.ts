import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Report } from "@/lib/models/Report";
import { requireRole } from "@/lib/rbac";
import { sendPushToUser } from "@/lib/push";

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

const STATUS_PUSH_MESSAGES: Record<string, string> = {
  pending:     "Your report has been approved and is pending action.",
  assigned:    "Your report has been assigned to a response team.",
  in_progress: "Your report is now being addressed.",
  resolved:    "Your report has been resolved. Thank you for helping keep Abia clean!",
  rejected:    "Your report was not approved.",
};

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

    // Only signed-in submitters have a userEmail to notify — anonymous
    // reports stay silent, exactly as intended.
    if (report.userEmail) {
      try {
        const message = STATUS_PUSH_MESSAGES[status];
        if (message) {
          await sendPushToUser(report.userEmail, {
            title: `Report ${report.trackingId}`,
            body: message,
            url: `/track/${report.trackingId}`,
          });
        }
      } catch (pushErr) {
        console.error("Failed to send report push notification:", pushErr);
      }
    }

    return NextResponse.json(report);
  } catch {
    return NextResponse.json({ error: "Failed to update report" }, { status: 500 });
  }
}