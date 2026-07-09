"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

interface Bus {
  _id: string;
  busId: string;
  route: string;
  routeLabel: string;
  status: "idle" | "on_route";
  progress: number;
  occupancy: number;
  etaMinutes: number | null;
}

const ROUTES = [
  { value: "umuahia-aba",     label: "Umuahia → Aba",      duration: 90 },
  { value: "umuahia-ohafia",  label: "Umuahia → Ohafia",   duration: 120 },
  { value: "intra-aba",       label: "Intra-City Aba",     duration: 20 },
  { value: "intra-umuahia",   label: "Intra-City Umuahia", duration: 20 },
];

const BUS_IDS = Array.from({ length: 10 }, (_, i) => `BUS-${String(i + 1).padStart(2, "0")}`);

export default function DriverPage() {
  const { data: session, status } = useSession();
  const role = session?.user?.role;

  const [bus, setBus] = useState<Bus | null>(null);
  const [busLoading, setBusLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(ROUTES[0].value);
  const [busIdInput, setBusIdInput] = useState(BUS_IDS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session && role === "driver") {
      fetchMyBus();
    } else if (status !== "loading") {
      setBusLoading(false);
    }
  }, [session, role, status]);

  async function fetchMyBus() {
    setBusLoading(true);
    try {
      const res = await fetch("/api/buses/mine");
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setBus(data);
          setSelectedRoute(data.route);
          setBusIdInput(data.busId);
        }
      }
    } catch {
      // no existing bus yet, that's fine
    }
    setBusLoading(false);
  }

  async function startTrip() {
    setSaving(true);
    setError(null);
    const routeInfo = ROUTES.find(r => r.value === selectedRoute)!;
    try {
      const res = await fetch("/api/buses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: busIdInput,
          route: routeInfo.value,
          routeLabel: routeInfo.label,
          status: "on_route",
          progress: 0,
          occupancy: 0,
          etaMinutes: routeInfo.duration,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to start trip");
      }
      setBus(data.bus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start trip");
    }
    setSaving(false);
  }

  async function endTrip() {
    if (!bus) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/buses/${bus._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "idle", progress: 0, occupancy: 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to end trip");
      setBus(data.bus);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to end trip");
    }
    setSaving(false);
  }

  async function updateProgress(newProgress: number) {
    if (!bus) return;
    const routeInfo = ROUTES.find(r => r.value === bus.route);
    const totalDuration = routeInfo?.duration ?? 60;
    const etaMinutes = Math.max(0, Math.round(totalDuration * (1 - newProgress / 100)));

    setBus({ ...bus, progress: newProgress, etaMinutes });

    try {
      const res = await fetch(`/api/buses/${bus._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progress: newProgress, etaMinutes }),
      });
      const data = await res.json();
      if (data.bus) setBus(data.bus);
    } catch {
      // silent — next slider move will retry
    }
  }

  async function markBoarded() {
    if (!bus) return;
    const newOccupancy = bus.occupancy + 1;
    setBus({ ...bus, occupancy: newOccupancy });
    try {
      await fetch(`/api/buses/${bus._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occupancy: newOccupancy }),
      });
    } catch {
      // silent
    }
  }

  // Full-page loader ONLY while auth session itself is resolving
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
          <div className="text-4xl mb-4">🚌</div>
          <h1 className="text-2xl mb-2"
            style={{ fontFamily: "DM Serif Display, serif", color: "#1A1208" }}>
            Driver Access Required
          </h1>
          <p className="text-sm mb-6" style={{ color: "#8B7355" }}>
            Sign in to access your driver dashboard.
          </p>
          <Link href="/auth/signin">
            <button className="w-full px-6 py-3.5 rounded-xl text-sm font-bold"
              style={{ background: "#1A6B3C", color: "#fff" }}>
              Sign In
            </button>
          </Link>
        </div>
      </main>
    );
  }

  if (role !== "driver") {
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
            This page is only available to driver accounts.
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

  const isOnRoute = bus?.status === "on_route";

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>
      <div className="px-5 pt-12 pb-5" style={{ background: "#0F3D22" }}>
        <Link href="/" className="text-xs mb-3 flex items-center gap-1"
          style={{ color: "rgba(253,250,245,0.5)", fontFamily: "Space Mono, monospace" }}>
          ← Back
        </Link>
        <p className="text-xs mb-1" style={{
          fontFamily: "Space Mono, monospace", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(232,148,26,0.8)" }}>
          Driver Dashboard
        </p>
        <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          {session.user?.name?.split(" ")[0] || "Driver"}
        </h1>
        <p className="text-xs mt-1" style={{ color: "rgba(253,250,245,0.45)" }}>
          {busLoading ? "Checking your status..." : isOnRoute ? `On Route · ${bus?.routeLabel}` : "Idle"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">

        {busLoading ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-3">⏳</div>
            <p className="text-sm" style={{ color: "#8B7355" }}>Checking your trip status...</p>
          </div>
        ) : !isOnRoute ? (
          <div className="rounded-xl p-4 mb-4"
            style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
            <p className="text-xs mb-1" style={{
              fontFamily: "Space Mono, monospace", fontSize: "9px",
              letterSpacing: "0.1em", textTransform: "uppercase", color: "#8B7355" }}>
              Bus ID
            </p>
            <select value={busIdInput} onChange={e => setBusIdInput(e.target.value)}
              className="w-full p-2.5 rounded-lg text-sm mb-3"
              style={{ border: "1px solid rgba(26,18,8,0.1)", outline: "none" }}>
              {BUS_IDS.map(id => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>

            <p className="text-xs mb-1" style={{
              fontFamily: "Space Mono, monospace", fontSize: "9px",
              letterSpacing: "0.1em", textTransform: "uppercase", color: "#8B7355" }}>
              Route
            </p>
            <select value={selectedRoute} onChange={e => setSelectedRoute(e.target.value)}
              className="w-full p-2.5 rounded-lg text-sm mb-4"
              style={{ border: "1px solid rgba(26,18,8,0.1)", outline: "none" }}>
              {ROUTES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>

            {error && (
              <p className="text-xs mb-3" style={{ color: "#C0392B" }}>{error}</p>
            )}

            <button onClick={startTrip} disabled={saving}
              className="w-full py-3.5 rounded-xl text-sm font-bold"
              style={{ background: saving ? "rgba(26,107,60,0.5)" : "#1A6B3C", color: "#fff" }}>
              {saving ? "Starting..." : "Start Trip →"}
            </button>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden mb-4"
            style={{ background: "#fff", boxShadow: "0 4px 20px rgba(26,18,8,0.08)" }}>
            <div className="p-4" style={{ background: "#1A6B3C" }}>
              <p style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
                {bus?.busId} · On Route
              </p>
              <p className="text-xl font-bold text-white">
                {bus?.routeLabel}
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>
                ETA {bus?.etaMinutes ?? 0} min · {bus?.occupancy ?? 0} passengers
              </p>
            </div>

            <div className="p-4">
              <p className="text-xs mb-2" style={{
                fontFamily: "Space Mono, monospace", fontSize: "9px",
                letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B7355" }}>
                Trip Progress · {bus?.progress ?? 0}%
              </p>
              <input
                type="range"
                min={0}
                max={100}
                value={bus?.progress ?? 0}
                onChange={e => updateProgress(Number(e.target.value))}
                className="w-full mb-1"
              />
              <div className="h-2 rounded-full mb-4" style={{ background: "rgba(26,18,8,0.08)" }}>
                <div className="h-full rounded-full"
                  style={{ width: `${bus?.progress ?? 0}%`, background: "#1A6B3C" }} />
              </div>

              <button onClick={markBoarded}
                className="w-full py-3 rounded-xl text-sm font-bold mb-1"
                style={{ background: "#E8941A", color: "#fff" }}>
                + Passenger Boarded (Manual Count)
              </button>
              <p className="text-xs mb-3" style={{ color: "#8B7355" }}>
                Temporary manual count — will switch to automatic Connect Card tap-in once boarding hardware is deployed.
              </p>

              {error && (
                <p className="text-xs mb-2" style={{ color: "#C0392B" }}>{error}</p>
              )}

              <button onClick={endTrip} disabled={saving}
                className="w-full py-3 rounded-xl text-sm font-bold"
                style={{ background: "transparent", color: "#C0392B",
                  border: "1.5px solid rgba(192,57,43,0.2)" }}>
                {saving ? "Ending..." : "End Trip"}
              </button>
            </div>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}