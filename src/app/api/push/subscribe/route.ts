import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { auth } from "@/lib/auth";
import { PushSubscription } from "@/lib/models/PushSubscription";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { endpoint, keys } = body;

    if (!endpoint || !keys?.p256dh || !keys?.auth) {
      return NextResponse.json({ error: "Invalid subscription payload" }, { status: 400 });
    }

    // Upsert by endpoint — re-subscribing the same device just refreshes
    // ownership rather than creating a duplicate row.
    await PushSubscription.findOneAndUpdate(
      { endpoint },
      { userEmail: session.user.email, endpoint, keys },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST /api/push/subscribe failed:", err);
    return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json({ error: "endpoint is required" }, { status: 400 });
    }

    await PushSubscription.deleteOne({ endpoint, userEmail: session.user.email });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/push/subscribe failed:", err);
    return NextResponse.json({ error: "Failed to remove subscription" }, { status: 500 });
  }
}