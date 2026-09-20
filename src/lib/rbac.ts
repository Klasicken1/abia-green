import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models/User";
import { NextResponse } from "next/server";

export type Role = "citizen" | "driver" | "admin" | "superadmin";

type RbacResult =
  | { ok: true; email: string; role: Role }
  | { ok: false; response: NextResponse };

/**
 * Re-checks the caller's role against the DB on every call — not the JWT
 * claim. A role change (promotion, demotion, suspension) takes effect on
 * the very next request instead of waiting for token refresh.
 */
export async function requireRole(allowed: Role[]): Promise<RbacResult> {
  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }

  await connectDB();
  const user = await User.findOne({ email });

  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "User not found" }, { status: 404 }),
    };
  }

  const role = user.role as Role;

  if (!allowed.includes(role)) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, email, role };
}