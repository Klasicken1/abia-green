"use client";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

interface Journey {
  _id: string;
  route: string;
  from: string;
  to: string;
  fare: number;
  paymentMethod: string;
  source: "fare_payment" | "manual";
  boardedAt: string;
}

const ROUTE_LABELS: Record<string, string> = {
  "umuahia-aba":     "Umuahia → Aba",
  "umuahia-ohafia":  "Umuahia → Ohafia",
  "intra-aba":       "Intra-City Aba",
  "intra-umuahia":   "Intra-City Umuahia",
};

export default function JourneysPage() {
  const { data: session, status } = useSession();
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [loading, setLoading]   = useState(true);

  // Manual log form state
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualRoute, setManualRoute] = useState("umuahia-aba");
  const [manualFrom, setManualFrom]   = useState("");
  const [manualTo, setManualTo]       = useState("");
  const [manualFare, setManualFare]   = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  useEffect(() => {
    if (session) fetchJourneys();
  }, [session]);

  async function fetchJourneys() {
    setLoading(true);
    try {
      const res = await fetch("/api/journeys");
      const data = await res.json();
      setJourneys(Array.isArray(data) ? data : []);
    } catch {
      setJourneys([]);
    }
    setLoading(false);
  }

  async function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!manualFrom || !manualTo || !manualFare) {
      setManualError("Fill in from, to, and fare.");
      return;
    }

    setManualSubmitting(true);
    setManualError(null);
    try {
      const res = await fetch("/api/journeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          route: manualRoute,
          from: manualFrom,
          to: manualTo,
          fare: Number(manualFare),
          source: "manual",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to log journey");
      }

      setManualFrom("");
      setManualTo("");
      setManualFare("");
      setShowManualForm(false);
      await fetchJourneys();
    } catch (err) {
      setManualError(err instanceof Error ? err.message : "Failed to log journey");
    }
    setManualSubmitting(false);
  }

  if (status === "loading") {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center"
        style={{ background: "#F7F3EC" }}>
        <div className="text-3xl mb-3">⏳</div>
        <p className="text-sm" style={{ color: "#8B7355" }}>Loading...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center px-4"
        style={{ background: "#F7F3EC" }}>
        <div className="text-center max-w-xs">
          <div className="text-4xl mb-4">🧭</div>
          <h1 className="text-2xl mb-2"
            style={{ fontFamily: "DM Serif Display, serif", color: "#1A1208" }}>
            Sign In Required
          </h1>
          <p className="text-sm mb-6" style={{ color: "#8B7355" }}>
            Sign in to view your journey history.
          </p>
          <button onClick={() => signIn("google", { callbackUrl: "/journeys" })}
            className="w-full px-6 py-3.5 rounded-xl text-sm font-bold"
            style={{ background: "#1A6B3C", color: "#fff" }}>
            Sign In
          </button>
          <Link href="/" className="block mt-3 text-xs text-center"
            style={{ color: "#8B7355" }}>
            ← Back to Home
          </Link>
        </div>
      </main>
    );
  }

  const totalSpent = journeys.reduce((sum, j) => sum + j.fare, 0);

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>

      <div className="px-5 pt-12 pb-5" style={{ background: "#0F3D22" }}>
        <Link href="/transport" className="text-xs mb-3 flex items-center gap-1"
          style={{ color: "rgba(253,250,245,0.5)", fontFamily: "Space Mono, monospace" }}>
          ← Back
        </Link>
        <p className="text-xs mb-1" style={{
          fontFamily: "Space Mono, monospace", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(59,139,235,0.8)" }}>
          Transport · History
        </p>
        <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          Journey History
        </h1>
        <p className="text-xs mt-1" style={{ color: "rgba(253,250,245,0.45)" }}>
          {journeys.length} journeys · ₦{totalSpent.toLocaleString()} total spent
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">

        {/* Manual log toggle */}
        <button
          onClick={() => setShowManualForm(v => !v)}
          className="w-full flex items-center justify-between p-3 rounded-xl mb-3"
          style={{ background: "rgba(26,107,60,0.08)", border: "1px solid rgba(26,107,60,0.2)" }}>
          <span className="text-xs font-semibold" style={{ color: "#1A6B3C" }}>
            + Log a Journey Manually
          </span>
          <span style={{ color: "#1A6B3C" }}>{showManualForm ? "−" : "+"}</span>
        </button>

        {showManualForm && (
          <form onSubmit={handleManualSubmit}
            className="rounded-xl p-4 mb-4"
            style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>

            <select value={manualRoute} onChange={e => setManualRoute(e.target.value)}
              className="w-full p-2.5 rounded-lg text-sm mb-2"
              style={{ border: "1px solid rgba(26,18,8,0.1)", outline: "none" }}>
              {Object.entries(ROUTE_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </select>

            <input type="text" placeholder="From" value={manualFrom}
              onChange={e => setManualFrom(e.target.value)}
              className="w-full p-2.5 rounded-lg text-sm mb-2"
              style={{ border: "1px solid rgba(26,18,8,0.1)", outline: "none" }} />

            <input type="text" placeholder="To" value={manualTo}
              onChange={e => setManualTo(e.target.value)}
              className="w-full p-2.5 rounded-lg text-sm mb-2"
              style={{ border: "1px solid rgba(26,18,8,0.1)", outline: "none" }} />

            <input type="number" placeholder="Fare (₦)" value={manualFare}
              onChange={e => setManualFare(e.target.value)}
              className="w-full p-2.5 rounded-lg text-sm mb-3"
              style={{ border: "1px solid rgba(26,18,8,0.1)", outline: "none" }} />

            {manualError && (
              <p className="text-xs mb-2" style={{ color: "#C0392B" }}>{manualError}</p>
            )}

            <button type="submit" disabled={manualSubmitting}
              className="w-full py-3 rounded-xl text-sm font-bold"
              style={{ background: manualSubmitting ? "rgba(26,107,60,0.5)" : "#1A6B3C", color: "#fff" }}>
              {manualSubmitting ? "Logging..." : "Log Journey"}
            </button>
          </form>
        )}

        {/* Journey list */}
        {loading ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-3">⏳</div>
            <p className="text-sm" style={{ color: "#8B7355" }}>Loading journeys...</p>
          </div>
        ) : journeys.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-3">🚌</div>
            <p className="text-sm font-semibold mb-1" style={{ color: "#1A1208" }}>
              No journeys yet
            </p>
            <p className="text-xs" style={{ color: "#8B7355" }}>
              Trips you pay for with your Connect Card will show up here.
            </p>
          </div>
        ) : (
          journeys.map(j => (
            <div key={j._id} className="flex items-center gap-3 p-3 rounded-xl mb-2"
              style={{ background: "#fff", boxShadow: "0 2px 8px rgba(26,18,8,0.05)" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
                style={{ background: "#0F3D22" }}>
                🚌
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: "#1A1208" }}>
                  {j.from} → {j.to}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#8B7355" }}>
                  {ROUTE_LABELS[j.route] || j.route} · {new Date(j.boardedAt).toLocaleDateString("en-NG", {
                    day: "numeric", month: "short", year: "numeric"
                  })}
                  {j.source === "manual" && " · Manual"}
                </p>
              </div>
              <span style={{ fontFamily: "Space Mono, monospace",
                fontSize: "13px", color: "#E8941A", fontWeight: 700 }}>
                ₦{j.fare.toLocaleString()}
              </span>
            </div>
          ))
        )}
      </div>

      <BottomNav />
    </main>
  );
}