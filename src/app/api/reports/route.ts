import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

// ── DB CONNECTION ─────────────────────────────────────
const MONGODB_URI = process.env.MONGODB_URI!;

let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGODB_URI);
  isConnected = true;
}

// ── REPORT SCHEMA ─────────────────────────────────────
const ReportSchema = new mongoose.Schema({
  trackingId:  { type: String, required: true, unique: true },
  type:        { type: String, required: true },
  lga:         { type: String, required: true },
  severity:    { type: String, required: true },
  description: { type: String },
  status:      { type: String, default: "pending" },
  createdAt:   { type: Date, default: Date.now },
});

const Report = mongoose.models.Report ||
  mongoose.model("Report", ReportSchema);

// ── GENERATE TRACKING ID ──────────────────────────────
function generateId(): string {
  return "AG-" + Math.floor(100000 + Math.random() * 900000);
}

// ── POST /api/reports ─────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const { type, lga, severity, description } = body;

    if (!type || !lga || !severity) {
      return NextResponse.json(
        { error: "type, lga and severity are required" },
        { status: 400 }
      );
    }

    const trackingId = generateId();

    const report = await Report.create({
      trackingId,
      type,
      lga,
      severity,
      description: description || "",
      status: "pending",
    });

    return NextResponse.json({
      success: true,
      trackingId: report.trackingId,
      message: "Report submitted successfully",
    }, { status: 201 });

  } catch (err) {
    console.error("Report error:", err);
    return NextResponse.json(
      { error: "Failed to submit report" },
      { status: 500 }
    );
  }
}

// ── GET /api/reports ──────────────────────────────────
export async function GET() {
  try {
    await connectDB();
    const reports = await Report.find({})
      .sort({ createdAt: -1 })
      .limit(50);
    return NextResponse.json(reports);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch reports" },
      { status: 500 }
    );
  }
}