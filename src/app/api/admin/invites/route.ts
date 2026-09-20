import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Invite } from "@/lib/models/Invite";
import { requireRole } from "@/lib/rbac";

export async function GET() {
  const check = await requireRole(["admin", "superadmin"]);
  if (!check.ok) return check.response;

  try {
    await connectDB();
    const invites = await Invite.find({}).sort({ createdAt: -1 }).limit(100);
    return NextResponse.json(invites);
  } catch (err) {
    console.error("GET /api/admin/invites failed:", err);
    return NextResponse.json({ error: "Failed to fetch invites" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const check = await requireRole(["admin", "superadmin"]);
  if (!check.ok) return check.response;

  try {
    await connectDB();
    const body = await req.json();
    const { email, role } = body;

    if (!email || !role) {
      return NextResponse.json({ error: "email and role are required" }, { status: 400 });
    }

    const validRoles = ["driver", "admin", "superadmin"];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // A plain admin can only invite drivers — promoting a peer admin or a
    // superadmin requires superadmin. Same reasoning as the RBAC hardening
    // in Sprint 1: no role can escalate someone to its own level or higher
    // without a stricter check above it.
    if ((role === "admin" || role === "superadmin") && check.role !== "superadmin") {
      return NextResponse.json(
        { error: "Only a superadmin can invite an admin or superadmin" },
        { status: 403 }
      );
    }

    const existing = await Invite.findOne({ email: email.toLowerCase(), usedAt: null });
    if (existing) {
      return NextResponse.json({ error: "An unused invite already exists for this email" }, { status: 409 });
    }

    const invite = await Invite.create({
      email: email.toLowerCase(),
      role,
      invitedBy: check.email,
    });

    return NextResponse.json({ success: true, invite }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/invites failed:", err);
    return NextResponse.json({ error: "Failed to create invite" }, { status: 500 });
  }
}