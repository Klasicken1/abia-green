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
  description: string;
  status: string;
  photoUrl?: string | null;
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  illegal_dump:    "Illegal Dump",
  erosion:         "Erosion",
  flooding:        "Flooding",
  illegal_logging: "Illegal Logging",
  air_pollution:   "Air Pollution",
  water_pollution: "Water Pollution",
};

const STATUS_COLORS: Record<string, string> = {
  pending:     "#E8941A",
  assigned:    "#2471A3",
  in_progress: "#8E44AD",
  resolved:    "#1A6B3C",
  closed:      "#8B7355",
};

const SEVERITY_COLORS: Record<string, string> = {
  low:      "#1A6B3C",
  moderate: "#E8941A",
  high:     "#C27A10",
  critical: "#C0392B",
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const [reports, setReports]   = useState<Report[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  const role = session?.user?.role;

  useEffect(() => {
    if (session && role === "admin") fetchReports();
  }, [session, role]);

  async function fetchReports() {
    setLoading(true);
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch {
      setReports([]);
    }
    setLoading(false);
  }

  async function updateStatus(id: string, newStatus: string) {
    setUpdating(id);
    try {
      await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      await fetchReports();
    } catch {
      // silent
    }
    setUpdating(null);
  }

  // Loading state
  if (status === "loading") {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center"
        style={{ background: "#F7F3EC" }}>
        <div className="text-3xl mb-3">⏳</div>
        <p className="text-sm" style={{ color: "#8B7355" }}>Loading...</p>
      </main>
    );
  }

  // Not signed in
  if (!session) {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center px-4"
        style={{ background: "#F7F3EC" }}>
        <div className="text-center max-w-xs">
          <div className="text-4xl mb-4">🔒</div>
          <h1 className="text-2xl mb-2"
            style={{ fontFamily: "DM Serif Display, serif", color: "#1A1208" }}>
            Admin Access Required
          </h1>
          <p className="text-sm mb-6" style={{ color: "#8B7355" }}>
            Sign in to access the report dashboard.
          </p>
          <Link href="/auth/signin">
            <button className="w-full px-6 py-3.5 rounded-xl text-sm font-bold"
              style={{ background: "#1A6B3C", color: "#fff" }}>
              Sign In
            </button>
          </Link>
          <Link href="/" className="block mt-3 text-xs text-center"
            style={{ color: "#8B7355" }}>
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  // Signed in but wrong role
  if (role !== "admin") {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center px-4"
        style={{ background: "#F7F3EC" }}>
        <div className="text-center max-w-xs">
          <div className="text-4xl mb-4">🚫</div>
          <h1 className="text-2xl mb-2"
            style={{ fontFamily: "DM Serif Display, serif", color: "#1A1208" }}>
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

  const filtered = filter === "all"
    ? reports
    : reports.filter(r => r.status === filter);

  const counts = {
    all:         reports.length,
    pending:     reports.filter(r => r.status === "pending").length,
    in_progress: reports.filter(r => r.status === "in_progress").length,
    resolved:    reports.filter(r => r.status === "resolved").length,
  };

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>

      {/* Header */}
      <div className="px-5 pt-12 pb-5" style={{ background: "#0F3D22" }}>
        <Link href="/" className="text-xs mb-3 flex items-center gap-1"
          style={{ color: "rgba(253,250,245,0.5)", fontFamily: "Space Mono, monospace" }}>
          ← Back
        </Link>
        <p className="text-xs mb-1" style={{
          fontFamily: "Space Mono, monospace", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(232,148,26,0.8)" }}>
          Admin · AEIS Reports
        </p>
        <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          Report Dashboard
        </h1>
        <p className="text-xs mt-1" style={{ color: "rgba(253,250,245,0.45)" }}>
          {reports.length} total reports · Live from MongoDB
        </p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(253,250,245,0.35)",
          fontFamily: "Space Mono, monospace" }}>
          Signed in as {session.user?.email}
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 gap-0"
        style={{ background: "#0F3D22", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
        {[
          { label: "Total",       count: counts.all,         color: "#fff"    },
          { label: "Pending",     count: counts.pending,     color: "#E8941A" },
          { label: "In Progress", count: counts.in_progress, color: "#8E44AD" },
          { label: "Resolved",    count: counts.resolved,    color: "#1A6B3C" },
        ].map((s, i) => (
          <div key={i} className="py-3 text-center"
            style={{ borderRight: i < 3 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
            <p className="text-xl font-bold"
              style={{ fontFamily: "DM Serif Display, serif", color: s.color }}>
              {s.count}
            </p>
            <p style={{ fontFamily: "Space Mono, monospace", fontSize: "8px",
              letterSpacing: "0.08em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.4)" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">

        {/* Filter chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {[
            { key: "all",         label: "All"         },
            { key: "pending",     label: "Pending"     },
            { key: "assigned",    label: "Assigned"    },
            { key: "in_progress", label: "In Progress" },
            { key: "resolved",    label: "Resolved"    },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: filter === f.key ? "#1A6B3C" : "#fff",
                color: filter === f.key ? "#fff" : "#8B7355",
                fontFamily: "Space Mono, monospace", fontSize: "9px",
                border: filter === f.key ? "none" : "1px solid rgba(26,18,8,0.12)",
              }}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Refresh */}
        <button onClick={fetchReports}
          className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded-xl text-xs"
          style={{ background: "rgba(26,107,60,0.08)", color: "#1A6B3C",
            border: "1px solid rgba(26,107,60,0.2)",
            fontFamily: "Space Mono, monospace" }}>
          ↻ Refresh Reports
        </button>

        {loading ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-3">⏳</div>
            <p className="text-sm" style={{ color: "#8B7355" }}>Loading reports...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-3">📋</div>
            <p className="text-sm font-semibold mb-1" style={{ color: "#1A1208" }}>
              No reports found
            </p>
            <p className="text-xs" style={{ color: "#8B7355" }}>
              {filter === "all" ? "No reports submitted yet." : `No ${filter} reports.`}
            </p>
          </div>
        ) : (
          filtered.map(report => (
            <div key={report._id} className="rounded-xl overflow-hidden mb-3"
              style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.06)" }}>

              <div className="px-4 py-3 flex items-center justify-between"
                style={{ borderBottom: "1px solid rgba(26,18,8,0.06)" }}>
                <div className="flex items-center gap-2">
                  <span style={{ fontFamily: "Space Mono, monospace", fontSize: "11px",
                    fontWeight: 700, color: "#1A6B3C" }}>
                    {report.trackingId}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs"
                    style={{
                      background: `${SEVERITY_COLORS[report.severity]}15`,
                      color: SEVERITY_COLORS[report.severity],
                      fontFamily: "Space Mono, monospace", fontSize: "8px",
                      textTransform: "uppercase"
                    }}>
                    {report.severity}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-xs capitalize"
                  style={{
                    background: `${STATUS_COLORS[report.status]}15`,
                    color: STATUS_COLORS[report.status],
                    fontFamily: "Space Mono, monospace", fontSize: "8px",
                  }}>
                  {report.status.replace("_", " ")}
                </span>
              </div>

              {report.photoUrl && (
                <img src={report.photoUrl} alt={`Photo for ${report.trackingId}`}
                  className="w-full h-40 object-cover" />
              )}

              <div className="px-4 py-3">
                <p className="text-sm font-semibold" style={{ color: "#1A1208" }}>
                  {TYPE_LABELS[report.type] || report.type}
                </p>
                <p className="text-xs mt-0.5 mb-2" style={{ color: "#8B7355" }}>
                  {report.lga} · {new Date(report.createdAt).toLocaleDateString("en-NG", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                </p>

                {report.description && (
                  <p className="text-xs mb-3 line-clamp-2"
                    style={{ color: "#8B7355", lineHeight: "1.5" }}>
                    {report.description}
                  </p>
                )}

                <div className="flex gap-2 flex-wrap">
                  {["pending","assigned","in_progress","resolved"].map(s => (
                    <button key={s}
                      onClick={() => updateStatus(report._id, s)}
                      disabled={report.status === s || updating === report._id}
                      className="px-2 py-1 rounded-lg text-xs capitalize"
                      style={{
                        background: report.status === s
                          ? `${STATUS_COLORS[s]}20` : "rgba(26,18,8,0.04)",
                        color: report.status === s ? STATUS_COLORS[s] : "#8B7355",
                        border: report.status === s
                          ? `1px solid ${STATUS_COLORS[s]}40` : "1px solid rgba(26,18,8,0.08)",
                        fontFamily: "Space Mono, monospace", fontSize: "8px",
                        cursor: report.status === s ? "default" : "pointer",
                      }}>
                      {updating === report._id ? "..." : s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}