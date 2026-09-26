"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
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
  possibleDuplicate?: boolean;
  rejectionReason?: string | null;
  createdAt: string;
}

interface Bus {
  _id: string;
  busId: string;
  route: string;
  routeLabel: string;
  driverEmail: string;
  status: "idle" | "on_route";
  progress: number;
  occupancy: number;
  etaMinutes: number | null;
  updatedAt: string;
}

interface BusActivity {
  bus: { busId: string; routeLabel: string; occupancy: number };
  events: {
    userEmailMasked: string;
    amount: number;
    paymentMethod: string;
    boardedAt: string;
    disembarkedAt: string | null;
  }[];
  methodBreakdown: { qr: number; nfc: number };
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
  pending_review: "#C27A10",
  pending:        "#E8941A",
  assigned:       "#2471A3",
  in_progress:    "#8E44AD",
  resolved:       "#1A6B3C",
  rejected:       "#C0392B",
  closed:         "#8B7355",
};

const SEVERITY_COLORS: Record<string, string> = {
  low:      "#1A6B3C",
  moderate: "#E8941A",
  high:     "#C27A10",
  critical: "#C0392B",
};

const STALE_THRESHOLD_MINUTES = 15;
const ADMIN_ROLES = ["admin", "superadmin"];

export default function AdminPage() {
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const isAdmin = role ? ADMIN_ROLES.includes(role) : false;
  const searchParams = useSearchParams();

  const initialView = searchParams.get("view") === "transport" ? "transport" : "reports";
  const [view, setView] = useState<"reports" | "transport">(initialView);

  const [reports, setReports]   = useState<Report[]>([]);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [filter, setFilter]     = useState("all");
  const [updating, setUpdating] = useState<string | null>(null);

  // Reject-reason flow: which report's reason box is open, and its text
  const [rejectingId, setRejectingId]   = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const [buses, setBuses] = useState<Bus[]>([]);
  const [busesLoading, setBusesLoading] = useState(true);
  const [endingId, setEndingId] = useState<string | null>(null);

  // Per-bus passenger activity panel: which bus is expanded, and cached
  // activity data keyed by bus id (fetched once, on first expand).
  const [expandedBusId, setExpandedBusId] = useState<string | null>(null);
  const [busActivity, setBusActivity] = useState<Record<string, BusActivity>>({});

  useEffect(() => {
    const paramView = searchParams.get("view") === "transport" ? "transport" : "reports";
    setView(paramView);
  }, [searchParams]);

  useEffect(() => {
    if (session && isAdmin) {
      fetchReports();
      fetchBuses();
    }
  }, [session, isAdmin]);

  async function fetchReports() {
    setReportsLoading(true);
    try {
      const res = await fetch("/api/reports");
      const data = await res.json();
      setReports(Array.isArray(data) ? data : []);
    } catch {
      setReports([]);
    }
    setReportsLoading(false);
  }

  async function fetchBuses() {
    setBusesLoading(true);
    try {
      const res = await fetch("/api/buses/all");
      const data = await res.json();
      setBuses(Array.isArray(data) ? data : []);
    } catch {
      setBuses([]);
    }
    setBusesLoading(false);
  }

  async function updateStatus(id: string, newStatus: string, reason?: string) {
    setUpdating(id);
    try {
      await fetch(`/api/reports/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          ...(reason ? { rejectionReason: reason } : {}),
        }),
      });
      await fetchReports();
    } catch {
      // silent
    }
    setUpdating(null);
  }

  function startReject(id: string) {
    setRejectingId(id);
    setRejectReason("");
  }

  function cancelReject() {
    setRejectingId(null);
    setRejectReason("");
  }

  async function confirmReject(id: string) {
    await updateStatus(id, "rejected", rejectReason.trim() || undefined);
    setRejectingId(null);
    setRejectReason("");
  }

  async function forceEndTrip(busId: string) {
    setEndingId(busId);
    try {
      await fetch(`/api/buses/${busId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "idle", progress: 0, occupancy: 0 }),
      });
      await fetchBuses();
    } catch {
      // silent
    }
    setEndingId(null);
  }

  async function toggleBusActivity(busId: string) {
    if (expandedBusId === busId) {
      setExpandedBusId(null);
      return;
    }
    setExpandedBusId(busId);
    if (!busActivity[busId]) {
      try {
        const res = await fetch(`/api/admin/buses/${busId}/activity`);
        const data = await res.json();
        setBusActivity(prev => ({ ...prev, [busId]: data }));
      } catch {
        // silent — panel shows "Loading..." indefinitely, acceptable failure mode
      }
    }
  }

  function isStale(bus: Bus) {
    if (bus.status !== "on_route") return false;
    const minutesSince = (Date.now() - new Date(bus.updatedAt).getTime()) / 60000;
    return minutesSince > STALE_THRESHOLD_MINUTES;
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
  if (!isAdmin) {
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
    all:             reports.length,
    pending_review:  reports.filter(r => r.status === "pending_review").length,
    pending:         reports.filter(r => r.status === "pending").length,
    in_progress:     reports.filter(r => r.status === "in_progress").length,
    resolved:        reports.filter(r => r.status === "resolved").length,
  };

  const onRouteBuses = buses.filter(b => b.status === "on_route");
  const idleBuses = buses.filter(b => b.status === "idle");
  const staleCount = onRouteBuses.filter(isStale).length;

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>

      {/* Header */}
      <div className="px-5 pt-12 pb-5" style={{ background: "#0F3D22" }}>
        <p className="text-xs mb-1" style={{
          fontFamily: "Space Mono, monospace", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(232,148,26,0.8)" }}>
          Admin Dashboard
        </p>
        <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          {view === "reports" ? "Report Dashboard" : "Transport Oversight"}
        </h1>
        <p className="text-xs mt-1" style={{ color: "rgba(253,250,245,0.45)" }}>
          {view === "reports"
            ? `${reports.length} total reports · Live from MongoDB`
            : `${buses.length} registered buses · ${onRouteBuses.length} on route`}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "rgba(253,250,245,0.35)",
          fontFamily: "Space Mono, monospace" }}>
          Signed in as {session.user?.email} ({role})
        </p>

        {/* View switcher */}
        <div className="flex gap-2 mt-3">
          <button onClick={() => setView("reports")}
            className="flex-1 py-2 rounded-lg text-xs font-bold relative"
            style={{
              background: view === "reports" ? "#1A6B3C" : "rgba(255,255,255,0.1)",
              color: view === "reports" ? "#fff" : "rgba(255,255,255,0.6)",
            }}>
            📋 Reports
            {counts.pending_review > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                style={{ background: "#C27A10", color: "#fff", fontSize: "9px" }}>
                {counts.pending_review}
              </span>
            )}
          </button>
          <button onClick={() => setView("transport")}
            className="flex-1 py-2 rounded-lg text-xs font-bold relative"
            style={{
              background: view === "transport" ? "#1A6B3C" : "rgba(255,255,255,0.1)",
              color: view === "transport" ? "#fff" : "rgba(255,255,255,0.6)",
            }}>
            🚌 Transport
            {staleCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                style={{ background: "#C0392B", color: "#fff", fontSize: "9px" }}>
                {staleCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {view === "reports" ? (
        <>
          {/* Stats strip */}
          <div className="grid grid-cols-4 gap-0"
            style={{ background: "#0F3D22", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {[
              { label: "Total",       count: counts.all,            color: "#fff"    },
              { label: "Needs Review",count: counts.pending_review, color: "#C27A10" },
              { label: "Pending",     count: counts.pending,        color: "#E8941A" },
              { label: "Resolved",    count: counts.resolved,       color: "#1A6B3C" },
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
                { key: "all",             label: "All"            },
                { key: "pending_review",  label: "Needs Review"   },
                { key: "pending",         label: "Pending"        },
                { key: "assigned",        label: "Assigned"       },
                { key: "in_progress",     label: "In Progress"    },
                { key: "resolved",        label: "Resolved"       },
                { key: "rejected",        label: "Rejected"       },
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

            <button onClick={fetchReports}
              className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded-xl text-xs"
              style={{ background: "rgba(26,107,60,0.08)", color: "#1A6B3C",
                border: "1px solid rgba(26,107,60,0.2)",
                fontFamily: "Space Mono, monospace" }}>
              ↻ Refresh Reports
            </button>

            {reportsLoading ? (
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
                  {filter === "all" ? "No reports submitted yet." : `No ${filter.replace("_", " ")} reports.`}
                </p>
              </div>
            ) : (
              filtered.map(report => (
                <div key={report._id} className="rounded-xl overflow-hidden mb-3"
                  style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.06)",
                    border: report.status === "pending_review" ? "1.5px solid rgba(194,122,16,0.4)" : "none" }}>

                  <div className="px-4 py-3 flex items-center justify-between"
                    style={{ borderBottom: "1px solid rgba(26,18,8,0.06)" }}>
                    <div className="flex items-center gap-2 flex-wrap">
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
                      {report.possibleDuplicate && (
                        <span className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: "rgba(139,115,85,0.15)", color: "#8B7355",
                            fontFamily: "Space Mono, monospace", fontSize: "8px" }}>
                          Possible duplicate
                        </span>
                      )}
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

                    {report.status === "rejected" && report.rejectionReason && (
                      <div className="rounded-lg p-2 mb-3"
                        style={{ background: "rgba(192,57,43,0.06)", border: "1px solid rgba(192,57,43,0.15)" }}>
                        <p style={{ fontFamily: "Space Mono, monospace", fontSize: "8px",
                          letterSpacing: "0.06em", textTransform: "uppercase", color: "#C0392B",
                          marginBottom: "2px" }}>
                          Rejection reason
                        </p>
                        <p className="text-xs" style={{ color: "#8B1F1F" }}>
                          {report.rejectionReason}
                        </p>
                      </div>
                    )}

                    {report.status === "pending_review" ? (
                      rejectingId === report._id ? (
                        <div>
                          <textarea
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Reason for rejecting (optional, but helps if the citizen appeals)"
                            rows={2}
                            className="w-full p-2 rounded-lg text-xs mb-2"
                            style={{ background: "#F7F3EC", border: "1px solid rgba(192,57,43,0.25)",
                              color: "#1A1208", fontFamily: "Inter, sans-serif",
                              outline: "none", resize: "none" }}
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={() => confirmReject(report._id)}
                              disabled={updating === report._id}
                              className="flex-1 py-2 rounded-lg text-xs font-bold"
                              style={{ background: "#C0392B", color: "#fff" }}>
                              {updating === report._id ? "..." : "Confirm Reject"}
                            </button>
                            <button
                              onClick={cancelReject}
                              disabled={updating === report._id}
                              className="flex-1 py-2 rounded-lg text-xs font-bold"
                              style={{ background: "rgba(26,18,8,0.06)", color: "#8B7355" }}>
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(report._id, "pending")}
                            disabled={updating === report._id}
                            className="flex-1 py-2 rounded-lg text-xs font-bold"
                            style={{ background: "#1A6B3C", color: "#fff" }}>
                            {updating === report._id ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => startReject(report._id)}
                            disabled={updating === report._id}
                            className="flex-1 py-2 rounded-lg text-xs font-bold"
                            style={{ background: "#C0392B", color: "#fff" }}>
                            Reject
                          </button>
                        </div>
                      )
                    ) : (
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
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <>
          {/* Transport stats strip */}
          <div className="grid grid-cols-3 gap-0"
            style={{ background: "#0F3D22", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {[
              { label: "On Route", count: onRouteBuses.length, color: "#E8941A" },
              { label: "Idle",     count: idleBuses.length,     color: "#8B7355" },
              { label: "Stale",    count: staleCount,           color: "#C0392B" },
            ].map((s, i) => (
              <div key={i} className="py-3 text-center"
                style={{ borderRight: i < 2 ? "1px solid rgba(255,255,255,0.08)" : "none" }}>
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

            <button onClick={fetchBuses}
              className="flex items-center gap-2 mb-4 px-3 py-1.5 rounded-xl text-xs"
              style={{ background: "rgba(26,107,60,0.08)", color: "#1A6B3C",
                border: "1px solid rgba(26,107,60,0.2)",
                fontFamily: "Space Mono, monospace" }}>
              ↻ Refresh Buses
            </button>

            {busesLoading ? (
              <div className="text-center py-12">
                <div className="text-3xl mb-3">⏳</div>
                <p className="text-sm" style={{ color: "#8B7355" }}>Loading buses...</p>
              </div>
            ) : buses.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-3xl mb-3">🚌</div>
                <p className="text-sm font-semibold mb-1" style={{ color: "#1A1208" }}>
                  No buses registered yet
                </p>
                <p className="text-xs" style={{ color: "#8B7355" }}>
                  Buses appear here once a driver starts a trip.
                </p>
              </div>
            ) : (
              buses.map(bus => {
                const stale = isStale(bus);
                const isExpanded = expandedBusId === bus._id;
                const activity = busActivity[bus._id];

                return (
                  <div key={bus._id} className="rounded-xl overflow-hidden mb-3"
                    style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.06)",
                      border: stale ? "1.5px solid rgba(192,57,43,0.4)" : "none" }}>

                    <div className="px-4 py-3 flex items-center justify-between"
                      style={{ borderBottom: "1px solid rgba(26,18,8,0.06)" }}>
                      <div className="flex items-center gap-2">
                        <span style={{ fontFamily: "Space Mono, monospace", fontSize: "11px",
                          fontWeight: 700, color: "#1A6B3C" }}>
                          {bus.busId}
                        </span>
                        {stale && (
                          <span className="px-2 py-0.5 rounded-full text-xs"
                            style={{ background: "rgba(192,57,43,0.12)", color: "#C0392B",
                              fontFamily: "Space Mono, monospace", fontSize: "8px" }}>
                            STALE
                          </span>
                        )}
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-xs capitalize"
                        style={{
                          background: bus.status === "on_route" ? "rgba(232,148,26,0.12)" : "rgba(139,115,85,0.12)",
                          color: bus.status === "on_route" ? "#E8941A" : "#8B7355",
                          fontFamily: "Space Mono, monospace", fontSize: "8px",
                        }}>
                        {bus.status.replace("_", " ")}
                      </span>
                    </div>

                    <div className="px-4 py-3">
                      <p className="text-sm font-semibold" style={{ color: "#1A1208" }}>
                        {bus.routeLabel}
                      </p>
                      <p className="text-xs mt-0.5 mb-2" style={{ color: "#8B7355" }}>
                        Driver: {bus.driverEmail}
                      </p>
                      <p className="text-xs mb-3" style={{ color: "#8B7355" }}>
                        Progress {bus.progress}% · {bus.occupancy} onboard · ETA {bus.etaMinutes ?? "—"} min
                      </p>
                      <p className="text-xs mb-3" style={{ color: "#8B7355",
                        fontFamily: "Space Mono, monospace", fontSize: "9px" }}>
                        Last updated: {new Date(bus.updatedAt).toLocaleString("en-NG")}
                      </p>

                      {bus.status === "on_route" && (
                        <button onClick={() => toggleBusActivity(bus._id)}
                          className="w-full py-2.5 rounded-xl text-xs font-bold mb-2"
                          style={{ background: "rgba(26,107,60,0.08)", color: "#1A6B3C",
                            border: "1px solid rgba(26,107,60,0.2)" }}>
                          {isExpanded ? "Hide Passenger Activity ▲" : "View Passenger Activity ▼"}
                        </button>
                      )}

                      {isExpanded && (
                        <div className="rounded-xl p-3 mb-3" style={{ background: "#F7F3EC" }}>
                          {!activity ? (
                            <p className="text-xs text-center py-3" style={{ color: "#8B7355" }}>Loading...</p>
                          ) : (
                            <>
                              <div className="flex gap-2 mb-3">
                                <div className="flex-1 rounded-lg p-2 text-center" style={{ background: "#fff" }}>
                                  <p className="text-lg font-bold" style={{ fontFamily: "DM Serif Display, serif", color: "#1A6B3C" }}>
                                    {activity.methodBreakdown.qr}
                                  </p>
                                  <p style={{ fontFamily: "Space Mono, monospace", fontSize: "8px",
                                    textTransform: "uppercase", color: "#8B7355" }}>
                                    QR Scans
                                  </p>
                                </div>
                                <div className="flex-1 rounded-lg p-2 text-center" style={{ background: "#fff" }}>
                                  <p className="text-lg font-bold" style={{ fontFamily: "DM Serif Display, serif", color: "#8B7355" }}>
                                    {activity.methodBreakdown.nfc}
                                  </p>
                                  <p style={{ fontFamily: "Space Mono, monospace", fontSize: "8px",
                                    textTransform: "uppercase", color: "#8B7355" }}>
                                    NFC Tap
                                  </p>
                                </div>
                              </div>
                              {activity.methodBreakdown.nfc === 0 && (
                                <p className="text-xs mb-3" style={{ color: "#8B7355", fontStyle: "italic" }}>
                                  NFC card readers aren&apos;t deployed yet — all payments today are via QR scan.
                                </p>
                              )}

                              {activity.events.length === 0 ? (
                                <p className="text-xs text-center py-2" style={{ color: "#8B7355" }}>
                                  No passengers have paid on this trip yet.
                                </p>
                              ) : (
                                activity.events.map((e, i) => (
                                  <div key={i} className="flex items-center justify-between py-2"
                                    style={{ borderBottom: i < activity.events.length - 1 ? "1px solid rgba(26,18,8,0.06)" : "none" }}>
                                    <div>
                                      <p className="text-xs font-semibold" style={{ color: "#1A1208" }}>
                                        {e.userEmailMasked}
                                      </p>
                                      <p className="text-xs" style={{ color: "#8B7355" }}>
                                        ₦{e.amount.toLocaleString()} · {e.paymentMethod.toUpperCase()}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs" style={{ color: "#1A6B3C" }}>
                                        Boarded {new Date(e.boardedAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                                      </p>
                                      {e.disembarkedAt ? (
                                        <p className="text-xs" style={{ color: "#8B7355" }}>
                                          Off {new Date(e.disembarkedAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                                        </p>
                                      ) : (
                                        <p className="text-xs" style={{ color: "#E8941A" }}>Still onboard</p>
                                      )}
                                    </div>
                                  </div>
                                ))
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {bus.status === "on_route" && (
                        <button onClick={() => forceEndTrip(bus._id)}
                          disabled={endingId === bus._id}
                          className="w-full py-2.5 rounded-xl text-xs font-bold"
                          style={{ background: "#C0392B", color: "#fff" }}>
                          {endingId === bus._id ? "Ending..." : "Force End Trip"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      <BottomNav />
    </main>
  );
}