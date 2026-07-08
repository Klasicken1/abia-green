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

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { role } = await req.json();
    if (!["rider", "driver", "admin"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    await connectDB();
    await User.findOneAndUpdate(
      { email: session.user.email },
      { role },
      { upsert: true }
    );

    return NextResponse.json({ success: true, role });
  } catch (err) {
    console.error("POST /api/user/role failed:", err);
    return NextResponse.json({ error: "Failed to set role" }, { status: 500 });
  }
}