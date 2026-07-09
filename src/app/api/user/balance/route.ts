import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { User } from "@/lib/models/User";

const MONGODB_URI = process.env.MONGODB_URI!;
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGODB_URI);
  isConnected = true;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email });
    return NextResponse.json({ balance: user?.balance ?? 0 });
  } catch (err) {
    console.error("GET /api/user/balance failed:", err);
    return NextResponse.json({ error: "Failed to fetch balance" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { amount } = await req.json();
    if (!amount || amount < 50) {
      return NextResponse.json({ error: "Minimum top-up is ₦50" }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { $inc: { balance: amount } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, balance: user.balance });
  } catch (err) {
    console.error("POST /api/user/balance failed:", err);
    return NextResponse.json({ error: "Failed to top up balance" }, { status: 500 });
  }
}