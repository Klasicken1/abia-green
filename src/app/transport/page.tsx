import BottomNav from "@/components/BottomNav";
import Link from "next/link";

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
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">

        {/* Live map placeholder */}
        <div className="rounded-xl overflow-hidden mb-4" style={{
          background: "linear-gradient(180deg, #C8D8E8 0%, #A8C4D8 100%)",
          height: "200px", position: "relative"
        }}>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <span className="text-4xl">🗺️</span>
            <span className="text-sm font-semibold" style={{ color: "#0F3D22" }}>
              Live Fleet Map
            </span>
            <span className="text-xs px-3 py-1 rounded-full flex items-center gap-1"
              style={{ background: "rgba(26,107,60,0.15)", color: "#1A6B3C",
                fontFamily: "Space Mono, monospace", fontSize: "9px" }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: "#1A6B3C" }} />
              Mapbox integration — Day 3
            </span>
          </div>
        </div>

        {/* Routes */}
        <p className="flex items-center gap-2 mb-3" style={{
          fontFamily: "Space Mono, monospace", fontSize: "9px",
          letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10"
        }}>
          <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
          Active Routes
        </p>

        {[
          { name: "Umuahia → Aba",     fare: "₦800",   buses: 6,  status: "live" },
          { name: "Umuahia → Ohafia",  fare: "₦1,000", buses: 4,  status: "live" },
          { name: "Intra-City Aba",    fare: "₦150",   buses: 5,  status: "live" },
          { name: "Intra-City Umuahia",fare: "₦150",   buses: 5,  status: "live" },
        ].map((route, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl mb-2"
            style={{ background: "#fff", boxShadow: "0 2px 8px rgba(26,18,8,0.05)" }}>
            <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#0F3D22" }}>
              <span className="text-base">🚌</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold" style={{ color: "#1A1208" }}>
                {route.name}
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#8B7355" }}>
                {route.buses} buses active
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold" style={{
                fontFamily: "Space Mono, monospace", color: "#E8941A"
              }}>
                {route.fare}
              </p>
              <span className="text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1"
                style={{ background: "rgba(26,107,60,0.1)", color: "#1A6B3C",
                  fontFamily: "Space Mono, monospace", fontSize: "8px" }}>
                <span className="w-1 h-1 rounded-full animate-pulse"
                  style={{ background: "#1A6B3C" }} />
                Live
              </span>
            </div>
          </div>
        ))}

        {/* Connect Card CTA */}
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