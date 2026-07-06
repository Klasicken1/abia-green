import BottomNav from "@/components/BottomNav";
import Link from "next/link";

async function getReport(trackingId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/reports/${trackingId}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function TrackPage({
  params,
}: {
  params: { id: string };
}) {
  const report = await getReport(params.id.toUpperCase());

  const typeLabels: Record<string, string> = {
    illegal_dump:    "Illegal Refuse Dump",
    erosion:         "Gully Erosion",
    flooding:        "Flooding Event",
    illegal_logging: "Illegal Logging",
    air_pollution:   "Air Pollution",
    water_pollution: "Water Pollution",
  };

  const severityColors: Record<string, string> = {
    low:      "#1A6B3C",
    moderate: "#E8941A",
    high:     "#C27A10",
    critical: "#C0392B",
  };

  const statusSteps = [
    { key: "pending",     label: "Report Submitted",  sub: "Received by AEIS" },
    { key: "assigned",    label: "Routed to ASEPA",   sub: "Field coordinator notified" },
    { key: "in_progress", label: "Crew Dispatched",   sub: "Team on the way" },
    { key: "resolved",    label: "Resolved",          sub: "Issue addressed" },
  ];

  const statusOrder = ["pending", "assigned", "in_progress", "resolved"];

  if (!report) {
    return (
      <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>
        <div className="px-5 pt-12 pb-6" style={{ background: "#0F3D22" }}>
          <Link href="/environment" className="text-xs mb-3 flex items-center gap-1"
            style={{ color: "rgba(253,250,245,0.5)", fontFamily: "Space Mono, monospace" }}>
            ← Back
          </Link>
          <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
            Track Report
          </h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-xl mb-2"
            style={{ fontFamily: "DM Serif Display, serif", color: "#1A1208" }}>
            Report Not Found
          </h2>
          <p className="text-sm text-center mb-6" style={{ color: "#8B7355" }}>
            No report found for <strong>{params.id.toUpperCase()}</strong>.
            Check the tracking ID and try again.
          </p>
          <Link href="/environment">
            <button className="px-6 py-3 rounded-xl text-sm font-bold"
              style={{ background: "#1A6B3C", color: "#fff" }}>
              Submit a Report
            </button>
          </Link>
        </div>
        <BottomNav />
      </main>
    );
  }

  const currentIndex = statusOrder.indexOf(report.status);

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>
      <div className="px-5 pt-12 pb-6" style={{ background: "#0F3D22" }}>
        <Link href="/environment" className="text-xs mb-3 flex items-center gap-1"
          style={{ color: "rgba(253,250,245,0.5)", fontFamily: "Space Mono, monospace" }}>
          ← Back
        </Link>
        <p className="text-xs mb-1" style={{
          fontFamily: "Space Mono, monospace", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(232,148,26,0.8)"
        }}>
          Report Tracking
        </p>
        <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          {report.trackingId}
        </h1>
        <p className="text-xs mt-1" style={{ color: "rgba(253,250,245,0.45)" }}>
          {typeLabels[report.type] || report.type} · {report.lga}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">

        {/* Status card */}
        <div className="rounded-xl overflow-hidden mb-4"
          style={{ background: "#fff", boxShadow: "0 4px 20px rgba(26,18,8,0.08)" }}>
          <div className="p-4" style={{ background: "#1A6B3C" }}>
            <p style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
              Current Status
            </p>
            <p className="text-xl font-bold text-white capitalize">
              {report.status.replace("_", " ")}
            </p>
          </div>
          <div className="p-4">
            {[
              { label: "Type",      value: typeLabels[report.type] || report.type },
              { label: "LGA",       value: report.lga },
              { label: "Severity",  value: report.severity,
                color: severityColors[report.severity] },
              { label: "Submitted", value: new Date(report.createdAt).toLocaleDateString("en-NG", {
                  day: "numeric", month: "short", year: "numeric"
                })
              },
            ].map((row, i) => (
              <div key={i} className="flex justify-between items-center py-2"
                style={{ borderBottom: i < 3 ? "1px solid rgba(26,18,8,0.06)" : "none" }}>
                <span style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
                  letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B7355" }}>
                  {row.label}
                </span>
                <span className="text-xs font-semibold capitalize"
                  style={{ color: row.color || "#1A1208" }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Description */}
        {report.description && (
          <div className="rounded-xl p-4 mb-4"
            style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
            <p className="flex items-center gap-2 mb-2" style={{
              fontFamily: "Space Mono, monospace", fontSize: "9px",
              letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
              <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
              Description
            </p>
            <p className="text-sm" style={{ color: "#1A1208", lineHeight: "1.6" }}>
              {report.description}
            </p>
          </div>
        )}

        {/* Timeline */}
        <div className="rounded-xl p-4 mb-4"
          style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
          <p className="flex items-center gap-2 mb-3" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
            <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
            Resolution Progress
          </p>
          {statusSteps.map((step, i) => {
            const isDone   = i < currentIndex;
            const isActive = i === currentIndex;
            const isPending = i > currentIndex;
            return (
              <div key={step.key} className="flex gap-3 pb-4 last:pb-0">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5"
                    style={{
                      background: isDone ? "#1A6B3C" : isActive ? "#E8941A" : "rgba(26,18,8,0.15)",
                    }} />
                  {i < statusSteps.length - 1 && (
                    <div className="w-px flex-1 mt-1"
                      style={{ background: "rgba(26,18,8,0.08)", minHeight: "16px" }} />
                  )}
                </div>
                <div>
                  <p className="text-xs font-semibold"
                    style={{ color: isPending ? "#8B7355" : "#1A1208" }}>
                    {step.label}
                  </p>
                  <p className="text-xs" style={{ color: "#8B7355" }}>
                    {step.sub}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Link href="/environment">
          <button className="w-full py-3.5 rounded-xl text-sm font-bold"
            style={{ background: "#1A6B3C", color: "#fff" }}>
            Submit Another Report
          </button>
        </Link>
      </div>

      <BottomNav />
    </main>
  );
}