"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { ROUTES as ROUTE_INFO } from "@/lib/routesData";
import { parseNairaFare, calculateBoardingFare } from "@/lib/fare";
import { estimateMinutesToStop } from "@/lib/stopTiming";

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

const BusDetailMap = dynamic(() => import("@/components/DriverRouteMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ background: "#0F3D22" }}>
      <span className="text-xs" style={{ color: "rgba(253,250,245,0.6)" }}>Loading map…</span>
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
  etaMinutes: number | null;
}

interface ActiveRide {
  busId: string;
  busLabel: string;
  routeLabel: string;
  fare: number;
  boardedAt: string;
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

const ROUTE_CHIPS: { label: string; value: string | null }[] = [
  { label: "All Routes",      value: null },
  { label: "Umuahia→Aba",     value: "umuahia-aba" },
  { label: "→Ohafia",         value: "umuahia-ohafia" },
  { label: "Intra-Aba",       value: "intra-aba" },
  { label: "Intra-Umuahia",   value: "intra-umuahia" },
];

const ACTIVE_ROUTES = [
  { name: "Umuahia → Aba",      fare: "₦800",   buses: 6, dist: "63 km", id: "umuahia-aba"    },
  { name: "Umuahia → Ohafia",   fare: "₦1,000", buses: 4, dist: "88 km", id: "umuahia-ohafia" },
  { name: "Intra-City Aba",     fare: "₦150",   buses: 5, dist: "City",  id: "intra-aba"      },
  { name: "Intra-City Umuahia", fare: "₦150",   buses: 5, dist: "City",  id: "intra-umuahia"  },
];

export default function TransportPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [liveBuses, setLiveBuses] = useState<LiveBus[]>([]);
  const [routeFilter, setRouteFilter] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);

  const [activeRide, setActiveRide] = useState<ActiveRide | null>(null);
  const [gettingOff, setGettingOff] = useState(false);

  const [expandedBusId, setExpandedBusId] = useState<string | null>(null);
  const [selectedStopByBus, setSelectedStopByBus] = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/alerts")
      .then(r => r.json())
      .then(data => setAlerts(Array.isArray(data) ? data : []))
      .catch(() => setAlerts([]));

    fetch("/api/user/balance")
      .then(r => r.json())
      .then(data => setBalance(data.balance ?? 0))
      .catch(() => setBalance(null));

    fetchBuses();
    fetchActiveRide();
    const interval = setInterval(() => {
      fetchBuses();
      fetchActiveRide();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  function fetchBuses() {
    fetch("/api/buses")
      .then(r => r.json())
      .then(data => setLiveBuses(Array.isArray(data) ? data : []))
      .catch(() => setLiveBuses([]));
  }

  function fetchActiveRide() {
    fetch("/api/wallet/active-ride")
      .then(r => r.json())
      .then(data => setActiveRide(data.activeRide ?? null))
      .catch(() => {});
  }

  async function handleGetOff() {
    if (!activeRide) return;
    setGettingOff(true);
    try {
      const res = await fetch("/api/wallet/disembark", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busId: activeRide.busId }),
      });
      if (res.ok) {
        setActiveRide(null);
        fetchBuses();
      }
    } catch {
      // silent — banner just stays, they can retry
    }
    setGettingOff(false);
  }

  const filteredBuses = routeFilter
    ? liveBuses.filter(b => b.route === routeFilter)
    : liveBuses;

  const filteredRoutes = routeFilter
    ? ACTIVE_ROUTES.filter(r => r.id === routeFilter)
    : ACTIVE_ROUTES;

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
          {ROUTE_CHIPS.map((chip, i) => {
            const isActive = routeFilter === chip.value;
            return (
              <button key={i} onClick={() => setRouteFilter(chip.value)}
                className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: isActive ? "#1A6B3C" : "rgba(255,255,255,0.1)",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                  fontFamily: "Space Mono, monospace", fontSize: "10px",
                  border: isActive ? "none" : "1px solid rgba(255,255,255,0.15)",
                }}>
                {chip.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Active ride banner — decoupled from the payment screen */}
      {activeRide && (
        <div className="px-4 pt-3">
          <div className="flex items-center gap-3 p-3 rounded-xl"
            style={{ background: "rgba(26,107,60,0.1)", border: "1px solid rgba(26,107,60,0.25)" }}>
            <span className="text-xl flex-shrink-0">🚌</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold" style={{ color: "#1A1208" }}>
                Riding {activeRide.busLabel} · {activeRide.routeLabel}
              </p>
              <p className="text-xs" style={{ color: "#8B7355" }}>
                Paid ₦{activeRide.fare.toLocaleString()}
              </p>
            </div>
            <button onClick={handleGetOff} disabled={gettingOff}
              className="px-3 py-2 rounded-lg text-xs font-bold flex-shrink-0"
              style={{ background: "#E8941A", color: "#fff" }}>
              {gettingOff ? "..." : "I'm Getting Off"}
            </button>
          </div>
        </div>
      )}

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

        {filteredBuses.length === 0 ? (
          <div className="rounded-xl p-4 mb-2 text-center"
            style={{ background: "#fff", boxShadow: "0 2px 8px rgba(26,18,8,0.05)" }}>
            <p className="text-xs" style={{ color: "#8B7355" }}>
              {routeFilter ? "No buses currently on this route." : "No buses currently on route. Check back soon."}
            </p>
          </div>
        ) : (
          filteredBuses.map(bus => {
            const routeInfo = ROUTE_INFO[bus.route];
            const fullFare = routeInfo ? parseNairaFare(routeInfo.fare) : 0;
            const quoteFare = fullFare ? calculateBoardingFare(fullFare, bus.progress) : null;
            const isExpanded = expandedBusId === bus._id;
            const selectedStop = selectedStopByBus[bus._id];

            return (
              <div key={bus._id} className="rounded-xl mb-2 overflow-hidden"
                style={{ background: "#fff", boxShadow: "0 2px 8px rgba(26,18,8,0.05)" }}>
                <button
                  onClick={() => setExpandedBusId(isExpanded ? null : bus._id)}
                  className="w-full flex items-center gap-3 p-3 text-left"
                >
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
                    {quoteFare !== null && (
                      <p className="text-xs" style={{ color: "#8B7355" }}>
                        ~₦{quoteFare.toLocaleString()} now
                      </p>
                    )}
                  </div>
                  <span style={{ color: "#8B7355", fontSize: "12px" }}>{isExpanded ? "▲" : "▼"}</span>
                </button>

                {isExpanded && (
                  <div style={{ borderTop: "1px solid rgba(26,18,8,0.06)" }}>
                    <div style={{ height: "160px" }}>
                      <BusDetailMap
                        routeId={bus.route}
                        progress={bus.progress}
                        highlightStopIndex={selectedStop}
                      />
                    </div>
                    <div className="p-3">
                      {routeInfo ? (
                        <>
                          <p className="text-xs mb-2" style={{
                            fontFamily: "Space Mono, monospace", fontSize: "9px",
                            letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B7355" }}>
                            Your stop
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {routeInfo.stops.map((stop, i) => {
                              const active = selectedStop === i;
                              return (
                                <button key={i}
                                  onClick={() => setSelectedStopByBus(prev => ({ ...prev, [bus._id]: i }))}
                                  className="px-2.5 py-1 rounded-full text-xs"
                                  style={{
                                    background: active ? "#1A6B3C" : "rgba(26,18,8,0.05)",
                                    color: active ? "#fff" : "#1A1208",
                                    fontFamily: "Space Mono, monospace", fontSize: "9px",
                                  }}>
                                  {stop.name}
                                </button>
                              );
                            })}
                          </div>
                          {selectedStop !== undefined && (
                            <div className="rounded-lg p-2 mb-1"
                              style={{ background: "rgba(232,148,26,0.08)" }}>
                              <p className="text-xs" style={{ color: "#C27A10" }}>
                                ETA to {routeInfo.stops[selectedStop].name}:{" "}
                                <strong>{estimateMinutesToStop(routeInfo, bus.progress, selectedStop)} min</strong>
                              </p>
                            </div>
                          )}
                        </>
                      ) : (
                        <p className="text-xs" style={{ color: "#8B7355" }}>
                          Stop-level detail isn't available for this route yet.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Routes */}
        <p className="flex items-center gap-2 mb-3 mt-4" style={{
          fontFamily: "Space Mono, monospace", fontSize: "9px",
          letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10"
        }}>
          <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
          Active Routes
        </p>

        {filteredRoutes.map((route, i) => (
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
                {balance === null ? "..." : `₦${balance.toLocaleString()}.00`}
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