"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

interface InviteRecord {
  _id: string;
  email: string;
  role: string;
  invitedBy: string;
  usedAt: string | null;
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  driver:     "#2471A3",
  admin:      "#8E44AD",
  superadmin: "#C0392B",
};

const ADMIN_ROLES = ["admin", "superadmin"];

export default function InvitesPage() {
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const isAdmin = role ? ADMIN_ROLES.includes(role) : false;
  const isSuperadmin = role === "superadmin";

  const [invites, setInvites]   = useState<InviteRecord[]>([]);
  const [loading, setLoading]   = useState(true);
  const [email, setEmail]       = useState("");
  const [newRole, setNewRole]   = useState("driver");
  const [creating, setCreating] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState<string | null>(null);

  useEffect(() => {
    if (session && isAdmin) fetchInvites();
  }, [session, isAdmin]);

  async function fetchInvites() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/invites");
      const data = await res.json();
      setInvites(Array.isArray(data) ? data : []);
    } catch {
      setInvites([]);
    }
    setLoading(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch("/api/admin/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: newRole }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create invite");
      } else {
        setSuccess(`Invite created for ${email} as ${newRole}`);
        setEmail("");
        setNewRole("driver");
        await fetchInvites();
      }
    } catch {
      setError("Failed to create invite");
    }
    setCreating(false);
  }

  if (status === "loading") {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center" style={{ background: "#F7F3EC" }}>
        <p className="text-sm" style={{ color: "#8B7355" }}>Loading...</p>
      </main>
    );
  }

  if (!session || !isAdmin) {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center px-4" style={{ background: "#F7F3EC" }}>
        <div className="text-center max-w-xs">
          <div className="text-4xl mb-4">🚫</div>
          <h1 className="text-2xl mb-2" style={{ fontFamily: "DM Serif Display, serif", color: "#1A1208" }}>
            Restricted
          </h1>
          <p className="text-sm mb-6" style={{ color: "#8B7355" }}>
            This page is only available to admin accounts.
          </p>
          <Link href="/">
            <button className="w-full px-6 py-3.5 rounded-xl text-sm font-bold"
              style={{ background: "#1A6B3C", color: "#fff" }}>
              Back to Home
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>
      <div className="px-5 pt-12 pb-5" style={{ background: "#0F3D22" }}>
        <p className="text-xs mb-1" style={{
          fontFamily: "Space Mono, monospace", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(232,148,26,0.8)" }}>
          Admin
        </p>
        <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          Invites
        </h1>
        <p className="text-xs mt-1" style={{ color: "rgba(253,250,245,0.45)" }}>
          {invites.length} total · {invites.filter(i => !i.usedAt).length} pending
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">

        <form onSubmit={handleCreate} className="rounded-xl p-4 mb-4"
          style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.06)" }}>
          <p className="flex items-center gap-2 mb-3" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
            <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
            New Invite
          </p>

          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="person@example.com"
            className="w-full p-3 rounded-xl text-sm mb-3"
            style={{ background: "#F7F3EC", border: "1px solid rgba(26,18,8,0.1)",
              color: "#1A1208", fontFamily: "Inter, sans-serif", outline: "none" }}
          />

          <div className="flex gap-2 mb-4">
            {["driver", "admin", ...(isSuperadmin ? ["superadmin"] : [])].map(r => (
              <button key={r} type="button" onClick={() => setNewRole(r)}
                className="flex-1 py-2 rounded-lg text-center capitalize"
                style={{
                  fontFamily: "Space Mono, monospace", fontSize: "9px",
                  border: newRole === r ? `1px solid ${ROLE_COLORS[r]}` : "1px solid rgba(26,18,8,0.12)",
                  background: newRole === r ? `${ROLE_COLORS[r]}15` : "#F7F3EC",
                  color: newRole === r ? ROLE_COLORS[r] : "#8B7355",
                }}>
                {r}
              </button>
            ))}
          </div>

          {!isSuperadmin && (
            <p className="text-xs mb-3" style={{ color: "#8B7355" }}>
              Only a superadmin can invite an admin or superadmin.
            </p>
          )}

          {error && <p className="text-xs mb-3" style={{ color: "#C0392B" }}>{error}</p>}
          {success && <p className="text-xs mb-3" style={{ color: "#1A6B3C" }}>{success}</p>}

          <button type="submit" disabled={creating}
            className="w-full py-3 rounded-xl text-sm font-bold"
            style={{ background: creating ? "rgba(26,107,60,0.5)" : "#1A6B3C", color: "#fff" }}>
            {creating ? "Creating..." : "Create Invite"}
          </button>
        </form>

        <button onClick={fetchInvites}
          className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded-xl text-xs"
          style={{ background: "rgba(26,107,60,0.08)", color: "#1A6B3C",
            border: "1px solid rgba(26,107,60,0.2)", fontFamily: "Space Mono, monospace" }}>
          ↻ Refresh
        </button>

        {loading ? (
          <p className="text-sm text-center py-8" style={{ color: "#8B7355" }}>Loading invites...</p>
        ) : invites.length === 0 ? (
          <p className="text-sm text-center py-8" style={{ color: "#8B7355" }}>No invites yet.</p>
        ) : (
          invites.map(inv => (
            <div key={inv._id} className="rounded-xl overflow-hidden mb-2 px-4 py-3"
              style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.06)" }}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-semibold" style={{ color: "#1A1208" }}>{inv.email}</span>
                <span className="px-2 py-0.5 rounded-full text-xs capitalize"
                  style={{
                    background: `${ROLE_COLORS[inv.role]}15`,
                    color: ROLE_COLORS[inv.role],
                    fontFamily: "Space Mono, monospace", fontSize: "8px",
                  }}>
                  {inv.role}
                </span>
              </div>
              <p className="text-xs" style={{ color: "#8B7355" }}>
                {inv.usedAt
                  ? `Used ${new Date(inv.usedAt).toLocaleDateString("en-NG")}`
                  : "Pending"} · Invited by {inv.invitedBy}
              </p>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}