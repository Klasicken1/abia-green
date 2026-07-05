"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

// Load map only on client side — Mapbox needs the browser
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

export default function TransportPage() {
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

        {[
          { id: "BUS-04", route: "Umuahia → Aba", eta: "7 min", occ: 68, status: "On time" },
          { id: "BUS-11", route: "Umuahia → Ohafia", eta: "15 min", occ: 90, status: "On time" },
          { id: "BUS-07", route: "Umuahia → Aba", eta: "32 min", occ: 24, status: "On time" },
        ].map((bus, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl mb-2"
            style={{ background: "#fff", boxShadow: "0 2px 8px rgba(26,18,8,0.05)" }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "#0F3D22" }}>
              <span style={{ fontFamily: "Space Mono, monospace", fontSize: "10px",
                color: "#E8941A", fontWeight: 700 }}>
                {bus.id.split("-")[1]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: "#1A1208" }}>
                {bus.id} · {bus.route}
              </p>
              <div className="flex items-center gap-2 mt-1">
                {/* Occupancy bar */}
                <div className="flex-1 h-1.5 rounded-full"
                  style={{ background: "rgba(26,18,8,0.08)" }}>
                  <div className="h-full rounded-full"
                    style={{
                      width: `${bus.occ}%`,
                      background: bus.occ > 80 ? "#E8941A" : "#1A6B3C"
                    }} />
                </div>
                <span className="text-xs flex-shrink-0" style={{ color: "#8B7355" }}>
                  {bus.occ}%
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold" style={{
                fontFamily: "DM Serif Display, serif",
                color: bus.occ > 80 ? "#E8941A" : "#1A6B3C"
              }}>
                {bus.eta}
              </p>
              <p className="text-xs" style={{ color: "#8B7355" }}>{bus.status}</p>
            </div>
          </div>
        ))}

        {/* Routes */}
        <p className="flex items-center gap-2 mb-3 mt-4" style={{
          fontFamily: "Space Mono, monospace", fontSize: "9px",
          letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10"
        }}>
          <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
          Active Routes
        </p>

        {[
          { name: "Umuahia → Aba",      fare: "₦800",   buses: 6, dist: "63 km" },
          { name: "Umuahia → Ohafia",   fare: "₦1,000", buses: 4, dist: "88 km" },
          { name: "Intra-City Aba",     fare: "₦150",   buses: 5, dist: "City"  },
          { name: "Intra-City Umuahia", fare: "₦150",   buses: 5, dist: "City"  },
        ].map((route, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl mb-2"
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
        ))}

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
            <button className="px-4 py-2 rounded-lg text-xs font-bold"
              style={{ background: "#E8941A", color: "#fff" }}>
              Top Up
            </button>
          </div>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}