import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI!;
let isConnected = false;

async function connectDB() {
  if (isConnected) return;
  await mongoose.connect(MONGODB_URI);
  isConnected = true;
}

const ReportSchema = new mongoose.Schema({
  trackingId:  { type: String, required: true, unique: true },
  type:        { type: String, required: true },
  lga:         { type: String, required: true },
  severity:    { type: String, required: true },
  description: { type: String },
  photoUrl:    { type: String, default: null },
  status:      { type: String, default: "pending" },
  createdAt:   { type: Date, default: Date.now },
});

const Report = mongoose.models.Report ||
  mongoose.model("Report", ReportSchema);

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const report = await Report.findOne({
      trackingId: params.id.toUpperCase()
    });
    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(report);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch report" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await req.json();
    const { status } = body;

    const report = await Report.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    );

    if (!report) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(report);
  } catch {
    return NextResponse.json(
      { error: "Failed to update report" },
      { status: 500 }
    );
  }
}