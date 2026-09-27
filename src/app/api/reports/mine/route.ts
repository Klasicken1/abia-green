import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Report } from "@/lib/models/Report";

// Only reports the signed-in user submitted while signed in — anonymous
// submissions have no userEmail and never show up here for anyone.
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const reports = await Report.find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .limit(100);

    return NextResponse.json(reports);
  } catch (err) {
    console.error("GET /api/reports/mine failed:", err);
    return NextResponse.json({ error: "Failed to fetch your reports" }, { status: 500 });
  }
}