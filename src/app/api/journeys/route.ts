import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { Journey } from "@/lib/models/Journey";
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

    await connectDB();

    const body = await req.json();
    const { route, from, to, fare, source } = body;

    if (!route || !from || !to || fare == null) {
      return NextResponse.json(
        { error: "route, from, to, and fare are required" },
        { status: 400 }
      );
    }

    const isRealPayment = source !== "manual";

    if (isRealPayment) {
      const user = await User.findOne({ email: session.user.email });
      const currentBalance = user?.balance ?? 0;

      if (currentBalance < fare) {
        return NextResponse.json(
          {
            error: "Insufficient Connect Card balance. Please top up to continue.",
            balance: currentBalance,
          },
          { status: 402 }
        );
      }

      await User.findOneAndUpdate(
        { email: session.user.email },
        { $inc: { balance: -fare } }
      );
    }

    const journey = await Journey.create({
      userEmail: session.user.email,
      route,
      from,
      to,
      fare,
      source: source === "manual" ? "manual" : "fare_payment",
    });

    return NextResponse.json({ success: true, journey }, { status: 201 });
  } catch (err) {
    console.error("POST /api/journeys failed:", err);
    return NextResponse.json({ error: "Failed to log journey" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const journeys = await Journey.find({ userEmail: session.user.email })
      .sort({ boardedAt: -1 })
      .limit(100);

    return NextResponse.json(journeys);
  } catch (err) {
    console.error("GET /api/journeys failed:", err);
    return NextResponse.json({ error: "Failed to fetch journeys" }, { status: 500 });
  }
}