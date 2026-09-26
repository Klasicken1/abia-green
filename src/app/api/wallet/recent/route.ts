import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Transaction } from "@/lib/models/Transaction";

// Real recent activity + this-month stats for the signed-in citizen —
// sourced from actual Transaction records, not invented numbers.
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const recent = await Transaction.find({ userEmail: session.user.email })
      .sort({ createdAt: -1 })
      .limit(3);

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyFares = await Transaction.find({
      userEmail: session.user.email,
      type: "fare",
      createdAt: { $gte: startOfMonth },
    });

    const ridesThisMonth = monthlyFares.length;
    const spentThisMonth = monthlyFares.reduce((sum, t) => sum + t.amount, 0);

    return NextResponse.json({
      recent,
      stats: { ridesThisMonth, spentThisMonth },
    });
  } catch (err) {
    console.error("GET /api/wallet/recent failed:", err);
    return NextResponse.json({ error: "Failed to fetch activity" }, { status: 500 });
  }
}