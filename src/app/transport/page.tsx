"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const TransportMap = dynamic(() => import("@/components/TransportMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center gap-2"
      style={{ background: "linear-gradient(180deg, #C8D8E8 0%, #A8C4D8 100%)" }}>
      <span className="text-3xl">🗺️</span>
      <span className="text-sm font-semibold" style={{ color: "#0F3D22" }}>
        Loading map...
      </span>
    </div>
  ),
});

interface Alert {
  id: string;
  route: string;
  message: string;
  severity: "info" | "warning" | "critical";
  createdAt: string;
}

interface LiveBus {
  _id: string;
  busId: string;
  route: string;
  routeLabel: string;
  status: "idle" | "on_route";
  progress: number;
  occupancy: number;
  etaMinutes: number | null;
  updatedAt: string;
}

const SEVERITY_BG: Record<string, string> = {
  info:     "rgba(36,113,163,0.12)",
  warning:  "rgba(232,148,26,0.12)",
  critical: "rgba(192,57,43,0.12)",
};
const SEVERITY_COLOR: Record<string, string> = {
  info:     "#2471A3",
  warning:  "#E8941A",
  critical: "#C0392B",
};
const SEVERITY_ICON: Record<string, string> = {
  info: "ℹ️", warning: "⚠️", critical: "🚨",
};

export default function TransportPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [liveBuses, setLiveBuses] = useState<LiveBus[]>([]);

  useEffect(() => {
    fetch("/api/alerts")
      .then(r => r.json())
      .then(data => setAlerts(Array.isArray(data) ? data : []))
      .catch(() => setAlerts([]));

    fetchBuses();
    const interval = setInterval(fetchBuses, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, []);

  function fetchBuses() {
    fetch("/api/buses")
      .then(r => r.json())
      .then(data => setLiveBuses(Array.isArray(data) ? data : []))
      .catch(() => setLiveBuses([]));
  }

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
          textTransform: "uppercase", color: "rgba(59,139,235,0.8)"
        }}>
          Platform 01 · Transport
        </p>
        <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          Green Shuttle System
        </h1>
        <p className="text-xs mt-1" style={{ color: "rgba(253,250,245,0.45)" }}>
          20 buses · 4 routes · Live tracking
        </p>

        {/* Route filter chips */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {["All Routes", "Umuahia→Aba", "→Ohafia", "Intra-Aba", "Intra-Umuahia"].map((r, i) => (
            <span key={i} className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                background: i === 0 ? "#1A6B3C" : "rgba(255,255,255,0.1)",
                color: i === 0 ? "#fff" : "rgba(255,255,255,0.6)",
                fontFamily: "Space Mono, monospace", fontSize: "10px",
                border: i === 0 ? "none" : "1px solid rgba(255,255,255,0.15)",
              }}>
              {r}
            </span>
          ))}
        </div>
      </div>

      {/* Service Disruption Alerts */}
      {alerts.length > 0 && (
        <div className="px-4 pt-3">
          {alerts.map(alert => (
            <div key={alert.id} className="flex items-start gap-3 p-3 rounded-xl mb-2"
              style={{ background: SEVERITY_BG[alert.severity],
                border: `1px solid ${SEVERITY_COLOR[alert.severity]}30` }}>
              <span className="text-base flex-shrink-0">{SEVERITY_ICON[alert.severity]}</span>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: SEVERITY_COLOR[alert.severity] }}>
                  {alert.route}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#1A1208" }}>
                  {alert.message}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Map */}
      <div className="mx-4 mt-4 rounded-xl overflow-hidden"
        style={{ height: "220px", boxShadow: "0 4px 20px rgba(26,18,8,0.1)" }}>
        <TransportMap />
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">

        {/* Live buses */}
        <p className="flex items-center gap-2 mb-3" style={{
          fontFamily: "Space Mono, monospace", fontSize: "9px",
          letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10"
        }}>
          <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
          Live Buses
        </p>

        {liveBuses.length === 0 ? (
          <div className="rounded-xl p-4 mb-2 text-center"
            style={{ background: "#fff", boxShadow: "0 2px 8px rgba(26,18,8,0.05)" }}>
            <p className="text-xs" style={{ color: "#8B7355" }}>
              No buses currently on route. Check back soon.
            </p>
          </div>
        ) : (
          liveBuses.map(bus => (
            <div key={bus._id} className="flex items-center gap-3 p-3 rounded-xl mb-2"
              style={{ background: "#fff", boxShadow: "0 2px 8px rgba(26,18,8,0.05)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#0F3D22" }}>
                <span style={{ fontFamily: "Space Mono, monospace", fontSize: "10px",
                  color: "#E8941A", fontWeight: 700 }}>
                  {bus.busId.split("-")[1] || bus.busId}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: "#1A1208" }}>
                  {bus.busId} · {bus.routeLabel}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full"
                    style={{ background: "rgba(26,18,8,0.08)" }}>
                    <div className="h-full rounded-full"
                      style={{
                        width: `${bus.progress}%`,
                        background: bus.progress > 80 ? "#E8941A" : "#1A6B3C"
                      }} />
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: "#8B7355" }}>
                    {bus.progress}%
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold" style={{
                  fontFamily: "DM Serif Display, serif",
                  color: (bus.etaMinutes ?? 0) < 10 ? "#E8941A" : "#1A6B3C"
                }}>
                  {bus.etaMinutes ?? "—"} min
                </p>
                <p className="text-xs" style={{ color: "#8B7355" }}>
                  {bus.occupancy} onboard
                </p>
              </div>
            </div>
          ))
        )}

        {/* Routes */}
        <p className="flex items-center gap-2 mb-3 mt-4" style={{
          fontFamily: "Space Mono, monospace", fontSize: "9px",
          letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10"
        }}>
          <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
          Active Routes
        </p>

        {[
          { name: "Umuahia → Aba",      fare: "₦800",   buses: 6, dist: "63 km", id: "umuahia-aba"    },
          { name: "Umuahia → Ohafia",   fare: "₦1,000", buses: 4, dist: "88 km", id: "umuahia-ohafia" },
          { name: "Intra-City Aba",     fare: "₦150",   buses: 5, dist: "City",  id: "intra-aba"      },
          { name: "Intra-City Umuahia", fare: "₦150",   buses: 5, dist: "City",  id: "intra-umuahia"  },
        ].map((route, i) => (
          <Link key={i} href={`/transport/routes/${route.id}`}>
            <div className="flex items-center gap-3 p-3 rounded-xl mb-2"
              style={{ background: "#fff", boxShadow: "0 2px 8px rgba(26,18,8,0.04)" }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 text-base"
                style={{ background: "#0F3D22" }}>
                🚌
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: "#1A1208" }}>
                  {route.name}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#8B7355" }}>
                  {route.buses} buses · {route.dist}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold" style={{
                  fontFamily: "Space Mono, monospace",
                  fontSize: "13px", color: "#E8941A"
                }}>
                  {route.fare}
                </p>
                <span className="flex items-center gap-1 justify-end"
                  style={{ fontFamily: "Space Mono, monospace",
                    fontSize: "8px", color: "#1A6B3C" }}>
                  <span className="w-1 h-1 rounded-full animate-pulse"
                    style={{ background: "#1A6B3C" }} />
                  Live
                </span>
              </div>
            </div>
          </Link>
        ))}

        {/* Fare Calculator CTA */}
        <Link href="/transport/fare">
          <div className="flex items-center gap-3 p-4 rounded-xl mb-3"
            style={{ background: "rgba(26,107,60,0.08)", border: "1px solid rgba(26,107,60,0.2)" }}>
            <span className="text-2xl">🧮</span>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "#1A1208" }}>Fare Calculator</p>
              <p className="text-xs" style={{ color: "#8B7355" }}>Check your fare before you travel</p>
            </div>
            <span style={{ color: "#1A6B3C", fontSize: "16px" }}>→</span>
          </div>
        </Link>

        {/* Journey History CTA */}
        <Link href="/journeys">
          <div className="flex items-center gap-3 p-4 rounded-xl mb-3"
            style={{ background: "rgba(26,107,60,0.08)", border: "1px solid rgba(26,107,60,0.2)" }}>
            <span className="text-2xl">🧭</span>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "#1A1208" }}>Journey History</p>
              <p className="text-xs" style={{ color: "#8B7355" }}>See your past trips and spending</p>
            </div>
            <span style={{ color: "#1A6B3C", fontSize: "16px" }}>→</span>
          </div>
        </Link>

        {/* Connect Card */}
        <div className="rounded-xl p-4 mt-2" style={{ background: "#0F3D22" }}>
          <p className="text-xs mb-1" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)"
          }}>
            Your Connect Card
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xl" style={{
                fontFamily: "DM Serif Display, serif", color: "#E8941A"
              }}>
                ₦2,450.00
              </p>
              <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>
                •••• 4821 · Active
              </p>
            </div>
            <Link href="/transport/topup">
              <button className="px-4 py-2 rounded-lg text-xs font-bold"
                style={{ background: "#E8941A", color: "#fff" }}>
                Top Up
              </button>
            </Link>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}