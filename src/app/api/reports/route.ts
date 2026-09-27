import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Report } from "@/lib/models/Report";
import { checkRateLimit } from "@/lib/rateLimit";
import { requireRole } from "@/lib/rbac";

function generateId(): string {
  return "AG-" + Math.floor(100000 + Math.random() * 900000);
}

function getClientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const ip = getClientIp(req);
    const allowed = await checkRateLimit(`report:${ip}`, 5, 10 * 60 * 1000);
    if (!allowed) {
      return NextResponse.json(
        { error: "Too many reports submitted. Please try again in a few minutes." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { type, lga, severity, description, photoUrl, photoPublicId, website } = body;

    if (website) {
      return NextResponse.json({ error: "Failed to submit report" }, { status: 400 });
    }

    if (!type || !lga || !severity) {
      return NextResponse.json(
        { error: "type, lga and severity are required" },
        { status: 400 }
      );
    }

    const needsReview = (severity === "high" || severity === "critical") && !photoUrl;

    const thirtyMinAgo = new Date(Date.now() - 30 * 60 * 1000);
    const recentSimilar = await Report.findOne({
      type, lga, createdAt: { $gte: thirtyMinAgo },
    });

    const trackingId = generateId();

    // Sign-in is never required to submit a report — but if the submitter
    // happens to be signed in, attach their email so they get "My Reports"
    // and status-change notifications. Anonymous submissions stay anonymous.
    const session = await auth();
    const userEmail = session?.user?.email || null;

    const report = await Report.create({
      trackingId,
      type,
      lga,
      severity,
      description: description || "",
      photoUrl: photoUrl || null,
      photoPublicId: photoPublicId || null,
      userEmail,
      status: needsReview ? "pending_review" : "pending",
      possibleDuplicate: !!recentSimilar,
    });

    return NextResponse.json({
      success: true,
      trackingId: report.trackingId,
      message: needsReview
        ? "Report received and is being reviewed."
        : "Report submitted successfully",
    }, { status: 201 });

  } catch (err) {
    console.error("POST /api/reports failed:", err);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const check = await requireRole(["admin", "superadmin"]);
  if (!check.ok) return check.response;

  try {
    await connectDB();
    const reports = await Report.find({}).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json(reports);
  } catch (err) {
    console.error("GET /api/reports failed:", err);
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}