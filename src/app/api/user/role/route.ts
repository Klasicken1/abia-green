import { NextResponse } from "next/server";

// Self-declared roles are retired. Roles are now assigned via invite
// (see /api/admin/invites) or already exist in the DB from before this
// change. This endpoint stays only so old clients get a clear signal
// instead of a silent 404.
export async function POST() {
  return NextResponse.json(
    { error: "Self-declared roles are no longer supported. Contact an admin for access." },
    { status: 410 }
  );
}