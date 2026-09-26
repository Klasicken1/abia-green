import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Report } from "@/lib/models/Report";

// Public aggregate counts only — no PII, safe for the citizen home screen.
export async function GET() {
  try {
    await connectDB();
    const total = await Report.countDocuments({ status: { $ne: "rejected" } });
    const resolved = await Report.countDocuments({ status: "resolved" });
    return NextResponse.json({ total, resolved });
  } catch (err) {
    console.error("GET /api/reports/stats failed:", err);
    return NextResponse.json({ error: "Failed to fetch report stats" }, { status: 500 });
  }
}