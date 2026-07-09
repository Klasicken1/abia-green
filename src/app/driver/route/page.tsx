"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { ROUTES } from "@/lib/routesData";

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

export default function DriverRoutePage() {
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const [bus, setBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session && role === "driver") {
      fetch("/api/buses/mine")
        .then(r => r.ok ? r.json() : null)
        .then(data => setBus(data))
        .catch(() => setBus(null))
        .finally(() => setLoading(false));
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [session, role, status]);

  if (status === "loading") {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center"
        style={{ background: "#F7F3EC" }}>
        <div className="text-3xl mb-3">⏳</div>
        <p className="text-sm" style={{ color: "#8B7355" }}>Loading...</p>
      </main>
    );
  }

  if (!session || role !== "driver") {
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

  const routeInfo = bus ? ROUTES[bus.route] : null;

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>
      <div className="px-5 pt-12 pb-5" style={{ background: "#0F3D22" }}>
        <Link href="/driver" className="text-xs mb-3 flex items-center gap-1"
          style={{ color: "rgba(253,250,245,0.5)", fontFamily: "Space Mono, monospace" }}>
          ← Back to Dashboard
        </Link>
        <p className="text-xs mb-1" style={{
          fontFamily: "Space Mono, monospace", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(232,148,26,0.8)" }}>
          Driver · My Route
        </p>
        <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          {routeInfo ? routeInfo.name : "No Active Route"}
        </h1>
        {routeInfo && (
          <div className="flex gap-3 mt-2 flex-wrap">
            {[routeInfo.distance, routeInfo.duration, routeInfo.frequency].map((v, i) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.1)", color: "rgba(253,250,245,0.6)",
                  fontFamily: "Space Mono, monospace", fontSize: "9px" }}>
                {v}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">

        {loading ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-3">⏳</div>
            <p className="text-sm" style={{ color: "#8B7355" }}>Loading route...</p>
          </div>
        ) : !bus || bus.status !== "on_route" || !routeInfo ? (
          <div className="text-center py-12">
            <div className="text-3xl mb-3">🗺️</div>
            <p className="text-sm font-semibold mb-1" style={{ color: "#1A1208" }}>
              No active trip
            </p>
            <p className="text-xs mb-4" style={{ color: "#8B7355" }}>
              Start a trip from your dashboard to see route stops here.
            </p>
            <Link href="/driver">
              <button className="px-6 py-3 rounded-xl text-sm font-bold"
                style={{ background: "#1A6B3C", color: "#fff" }}>
                Go to Dashboard
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Current trip summary */}
            <div className="rounded-xl p-4 mb-4" style={{ background: "#fff",
              boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
              <p className="text-xs mb-2" style={{
                fontFamily: "Space Mono, monospace", fontSize: "9px",
                letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B7355" }}>
                {bus.busId} · Progress {bus.progress}%
              </p>
              <div className="h-2 rounded-full mb-2" style={{ background: "rgba(26,18,8,0.08)" }}>
                <div className="h-full rounded-full"
                  style={{ width: `${bus.progress}%`, background: "#1A6B3C" }} />
              </div>
              <p className="text-xs" style={{ color: "#8B7355" }}>
                ETA {bus.etaMinutes ?? "—"} min · {bus.occupancy} onboard
              </p>
            </div>

            {/* Stops */}
            <p className="flex items-center gap-2 mb-3" style={{
              fontFamily: "Space Mono, monospace", fontSize: "9px",
              letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
              <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
              Route Stops
            </p>
            <div className="rounded-xl overflow-hidden"
              style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
              {routeInfo.stops.map((stop, i) => (
                <div key={i} className="flex items-start gap-3 p-3"
                  style={{ borderBottom: i < routeInfo.stops.length - 1
                    ? "1px solid rgba(26,18,8,0.06)" : "none" }}>
                  <div className="flex flex-col items-center mt-1 flex-shrink-0">
                    <div className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                      style={{
                        background: i === 0 || i === routeInfo.stops.length - 1
                          ? "#1A6B3C" : "#fff",
                        borderColor: "#1A6B3C"
                      }} />
                    {i < routeInfo.stops.length - 1 && (
                      <div className="w-0.5 h-5 mt-1"
                        style={{ background: "rgba(26,107,60,0.2)" }} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold" style={{ color: "#1A1208" }}>
                      {stop.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{
                      fontFamily: "Space Mono, monospace", fontSize: "9px", color: "#8B7355" }}>
                      {stop.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </main>
  );
}