import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { disembark } from "@/lib/wallet";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { busId } = await req.json();
    if (!busId) {
      return NextResponse.json({ error: "busId is required" }, { status: 400 });
    }

    const result = await disembark(session.user.email, busId);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, occupancy: result.occupancy });
  } catch (err) {
    console.error("POST /api/wallet/disembark failed:", err);
    return NextResponse.json({ error: "Failed to update ride status" }, { status: 500 });
  }
}