"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

const ROLES = [
  { key: "rider",  label: "Rider",  icon: "🧍", desc: "Track buses, pay fares, report issues" },
  { key: "driver", label: "Driver", icon: "🚌", desc: "Run your route, update trip status" },
  { key: "admin",  label: "Admin",  icon: "🛠️", desc: "Manage reports and system oversight" },
];

export default function SelectRolePage() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const [saving, setSaving] = useState<string | null>(null);

  async function choose(role: string) {
    setSaving(role);
    try {
      const res = await fetch("/api/user/role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!res.ok) throw new Error("Failed to save role");

      await update(); // refresh session with new role
      router.push(role === "driver" ? "/driver" : role === "admin" ? "/admin" : "/");
    } catch {
      setSaving(null);
    }
  }

  if (status === "loading") {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center" style={{ background: "#F7F3EC" }}>
        <p className="text-sm" style={{ color: "#8B7355" }}>Loading...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center px-4" style={{ background: "#F7F3EC" }}>
        <p className="text-sm" style={{ color: "#8B7355" }}>Please sign in first.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen items-center justify-center px-4" style={{ background: "#F7F3EC" }}>
      <div className="w-full max-w-sm">
        <h1 className="text-2xl mb-2 text-center" style={{ fontFamily: "DM Serif Display, serif", color: "#1A1208" }}>
          How will you use Abia Green?
        </h1>
        <p className="text-sm mb-6 text-center" style={{ color: "#8B7355" }}>
          Choose your role to continue
        </p>

        {ROLES.map(r => (
          <button key={r.key} onClick={() => choose(r.key)} disabled={!!saving}
            className="w-full flex items-center gap-4 p-4 rounded-xl mb-3 text-left"
            style={{ background: "#fff", border: "1.5px solid rgba(26,18,8,0.1)",
              boxShadow: "0 2px 12px rgba(26,18,8,0.05)",
              opacity: saving && saving !== r.key ? 0.5 : 1 }}>
            <span className="text-2xl">{r.icon}</span>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: "#1A1208" }}>
                {saving === r.key ? "Saving..." : r.label}
              </p>
              <p className="text-xs" style={{ color: "#8B7355" }}>{r.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </main>
  );
}