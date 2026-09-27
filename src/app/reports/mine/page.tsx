"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

interface Report {
  _id: string;
  trackingId: string;
  type: string;
  lga: string;
  severity: string;
  status: string;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  illegal_dump:    "Illegal Dump",
  erosion:         "Erosion",
  flooding:        "Flooding",
  illegal_logging: "Illegal Logging",
};

const STATUS_COLORS: Record<string, string> = {
  pending_review: "#C27A10",
  pending:        "#E8941A",
  assigned:       "#2471A3",
  in_progress:    "#8E44AD",
  resolved:       "#1A6B3C",
  rejected:       "#C0392B",
};

export default function MyReportsPage() {
  const { data: session, status } = useSession();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session) {
      fetch("/api/reports/mine")
        .then(r => (r.ok ? r.json() : []))
        .then(data => setReports(Array.isArray(data) ? data : []))
        .catch(() => setReports([]))
        .finally(() => setLoading(false));
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [session, status]);

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
        <div className="text-center max-w-xs">
          <h1 className="text-xl mb-2" style={{ fontFamily: "DM Serif Display, serif", color: "#1A1208" }}>
            Sign In Required
          </h1>
          <Link href="/auth/signin">
            <button className="w-full px-6 py-3.5 rounded-xl text-sm font-bold mt-4"
              style={{ background: "#1A6B3C", color: "#fff" }}>
              Sign In
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>
      <div className="px-5 pt-12 pb-6" style={{ background: "#0F3D22" }}>
        <Link href="/profile" className="text-xs mb-3 flex items-center gap-1"
          style={{ color: "rgba(253,250,245,0.5)", fontFamily: "Space Mono, monospace" }}>
          ← Back
        </Link>
        <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          My Reports
        </h1>
        <p className="text-xs mt-1" style={{ color: "rgba(253,250,245,0.45)" }}>
          Reports you submitted while signed in
        </p>
      </div>

      <div className="flex-1 px-4 pt-4 pb-24">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-sm" style={{ color: "#8B7355" }}>Loading your reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="rounded-xl p-5 text-center" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
            <p className="text-sm mb-1" style={{ color: "#1A1208" }}>No reports yet</p>
            <p className="text-xs" style={{ color: "#8B7355" }}>
              Reports you submit while signed in will show up here.
            </p>
          </div>
        ) : (
          reports.map(r => (
            <Link key={r._id} href={`/track/${r.trackingId}`}>
              <div className="rounded-xl p-4 mb-3" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
                <div className="flex items-center justify-between mb-1">
                  <span style={{ fontFamily: "Space Mono, monospace", fontSize: "11px", fontWeight: 700, color: "#1A6B3C" }}>
                    {r.trackingId}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs capitalize"
                    style={{ background: `${STATUS_COLORS[r.status]}15`, color: STATUS_COLORS[r.status],
                      fontFamily: "Space Mono, monospace", fontSize: "8px" }}>
                    {r.status.replace("_", " ")}
                  </span>
                </div>
                <p className="text-sm font-semibold" style={{ color: "#1A1208" }}>
                  {TYPE_LABELS[r.type] || r.type}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#8B7355" }}>
                  {r.lga} · {new Date(r.createdAt).toLocaleDateString("en-NG", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
      <BottomNav />
    </main>
  );
}