"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const CATEGORIES = [
  { value: "breakdown",         label: "Vehicle Breakdown",   icon: "🔧" },
  { value: "accident",          label: "Accident",            icon: "🚨" },
  { value: "safety_concern",    label: "Safety Concern",      icon: "⚠️" },
  { value: "passenger_conduct", label: "Passenger Conduct",   icon: "🧑" },
  { value: "other",             label: "Other",                icon: "📝" },
];

interface Bus {
  _id: string;
  busId: string;
  status: "idle" | "on_route";
}

export default function DriverIncidentPage() {
  const { data: session, status } = useSession();
  const role = session?.user?.role;

  const [bus, setBus] = useState<Bus | null>(null);
  const [busLoading, setBusLoading] = useState(true);

  const [category, setCategory] = useState("breakdown");
  const [severity, setSeverity] = useState("moderate");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (session && role === "driver") {
      fetch("/api/buses/mine")
        .then(r => (r.ok ? r.json() : null))
        .then(data => setBus(data))
        .catch(() => setBus(null))
        .finally(() => setBusLoading(false));
    } else if (status !== "loading") {
      setBusLoading(false);
    }
  }, [session, role, status]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!bus) {
      setError("No active trip found. Start a trip before reporting an incident.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busId: bus._id, category, severity, description }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit");
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit incident");
    }
    setSubmitting(false);
  }

  if (status === "loading" || busLoading) {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center" style={{ background: "#F7F3EC" }}>
        <p className="text-sm" style={{ color: "#8B7355" }}>Loading...</p>
      </main>
    );
  }

  if (!session || role !== "driver") {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center px-4" style={{ background: "#F7F3EC" }}>
        <div className="text-center max-w-xs">
          <div className="text-4xl mb-4">🚫</div>
          <h1 className="text-xl mb-2" style={{ fontFamily: "DM Serif Display, serif", color: "#1A1208" }}>
            Restricted
          </h1>
          <Link href="/">
            <button className="w-full px-6 py-3.5 rounded-xl text-sm font-bold mt-4"
              style={{ background: "#1A6B3C", color: "#fff" }}>
              Back to Home
            </button>
          </Link>
        </div>
      </main>
    );
  }

  if (!bus || bus.status !== "on_route") {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center px-4" style={{ background: "#F7F3EC" }}>
        <div className="text-center max-w-xs">
          <div className="text-4xl mb-4">🚌</div>
          <h1 className="text-xl mb-2" style={{ fontFamily: "DM Serif Display, serif", color: "#1A1208" }}>
            No Active Trip
          </h1>
          <p className="text-sm mb-6" style={{ color: "#8B7355" }}>
            Start a trip before reporting an incident.
          </p>
          <Link href="/driver">
            <button className="w-full px-6 py-3.5 rounded-xl text-sm font-bold"
              style={{ background: "#1A6B3C", color: "#fff" }}>
              Go to Dashboard
            </button>
          </Link>
        </div>
      </main>
    );
  }

  if (submitted) {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center px-6" style={{ background: "#F7F3EC" }}>
        <div className="text-4xl mb-4">✅</div>
        <h1 className="text-xl mb-2 text-center" style={{ fontFamily: "DM Serif Display, serif", color: "#1A1208" }}>
          Incident Reported
        </h1>
        <p className="text-sm text-center mb-6" style={{ color: "#8B7355" }}>
          The Ministry of Transport has been notified.
        </p>
        <Link href="/driver">
          <button className="px-6 py-3 rounded-xl text-sm font-bold" style={{ background: "#1A6B3C", color: "#fff" }}>
            Back to Dashboard
          </button>
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>
      <div className="px-5 pt-12 pb-5" style={{ background: "#C0392B" }}>
        <Link href="/driver" className="text-xs mb-3 flex items-center gap-1"
          style={{ color: "rgba(255,255,255,0.7)", fontFamily: "Space Mono, monospace" }}>
          ← Back
        </Link>
        <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          Report an Incident
        </h1>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
          {bus.busId} · Breakdown, accident, or passenger conduct
        </p>
      </div>

      <div className="flex-1 px-4 pt-4 pb-24">
        <form onSubmit={handleSubmit}>
          <p className="text-xs mb-2" style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.1em", textTransform: "uppercase", color: "#8B7355" }}>
            Category
          </p>
          <div className="grid grid-cols-2 gap-2 mb-4">
            {CATEGORIES.map(c => (
              <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                className="p-3 rounded-xl flex items-center gap-2 text-left"
                style={{ background: "#fff",
                  border: category === c.value ? "1.5px solid #C0392B" : "1.5px solid rgba(26,18,8,0.08)" }}>
                <span className="text-lg">{c.icon}</span>
                <span className="text-xs font-semibold" style={{ color: "#1A1208" }}>{c.label}</span>
              </button>
            ))}
          </div>

          <p className="text-xs mb-2" style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.1em", textTransform: "uppercase", color: "#8B7355" }}>
            Severity
          </p>
          <div className="flex gap-2 mb-4">
            {["low", "moderate", "high", "critical"].map(s => (
              <button key={s} type="button" onClick={() => setSeverity(s)}
                className="flex-1 py-2 rounded-lg text-center text-xs capitalize"
                style={{ border: severity === s ? "1px solid #C0392B" : "1px solid rgba(26,18,8,0.12)",
                  background: severity === s ? "rgba(192,57,43,0.08)" : "#fff",
                  color: severity === s ? "#C0392B" : "#8B7355" }}>
                {s}
              </button>
            ))}
          </div>

          <p className="text-xs mb-2" style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.1em", textTransform: "uppercase", color: "#8B7355" }}>
            Description
          </p>
          <textarea value={description} onChange={e => setDescription(e.target.value)}
            rows={4} placeholder="What happened?"
            className="w-full p-3 rounded-xl text-sm mb-4"
            style={{ background: "#fff", border: "1px solid rgba(26,18,8,0.1)", outline: "none", resize: "none" }} />

          {error && <p className="text-xs mb-3" style={{ color: "#C0392B" }}>{error}</p>}

          <button type="submit" disabled={submitting}
            className="w-full py-3.5 rounded-xl text-sm font-bold"
            style={{ background: submitting ? "rgba(192,57,43,0.5)" : "#C0392B", color: "#fff" }}>
            {submitting ? "Submitting..." : "Submit Incident Report"}
          </button>
        </form>
      </div>
      <BottomNav />
    </main>
  );
}