import { NextRequest, NextResponse } from "next/server";

// In-memory alerts store (resets on server restart)
// In production this would be MongoDB
let alerts: {
  id: string;
  route: string;
  message: string;
  severity: "info" | "warning" | "critical";
  createdAt: string;
}[] = [];

export async function GET() {
  return NextResponse.json(alerts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const alert = {
    id: Date.now().toString(),
    route:     body.route,
    message:   body.message,
    severity:  body.severity || "info",
    createdAt: new Date().toISOString(),
  };
  alerts.unshift(alert);
  // Keep only last 10 alerts
  alerts = alerts.slice(0, 10);
  return NextResponse.json(alert, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  alerts = alerts.filter(a => a.id !== id);
  return NextResponse.json({ success: true });
}