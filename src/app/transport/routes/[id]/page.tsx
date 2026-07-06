"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const TransportMap = dynamic(() => import("@/components/TransportMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center"
      style={{ background: "linear-gradient(180deg, #C8D8E8 0%, #A8C4D8 100%)" }}>
      <span className="text-sm font-semibold" style={{ color: "#0F3D22" }}>Loading map...</span>
    </div>
  ),
});

const ROUTES: Record<string, {
  name: string; origin: string; destination: string;
  fare: string; distance: string; duration: string;
  frequency: string; buses: number;
  stops: { name: string; time: string }[];
  departures: { busId: string; time: string; seats: number; eta: string }[];
}> = {
  "umuahia-aba": {
    name: "Umuahia → Aba",
    origin: "Umuahia Central Terminal",
    destination: "Aba Main Terminal",
    fare: "₦800", distance: "63 km", duration: "~90 min",
    frequency: "Every 30 minutes", buses: 6,
    stops: [
      { name: "Umuahia Central Terminal", time: "Departure" },
      { name: "Isigate Junction",         time: "~15 min"   },
      { name: "Osisioma Interchange",     time: "~55 min"   },
      { name: "Aba Main Terminal",        time: "~90 min"   },
    ],
    departures: [
      { busId: "BUS-04", time: "9:48 AM",  seats: 16, eta: "7 min"  },
      { busId: "BUS-07", time: "10:13 AM", seats: 38, eta: "32 min" },
      { busId: "BUS-02", time: "10:43 AM", seats: 50, eta: "62 min" },
    ],
  },
  "umuahia-ohafia": {
    name: "Umuahia → Ohafia",
    origin: "Umuahia Central Terminal",
    destination: "Ohafia Bus Park",
    fare: "₦1,000", distance: "88 km", duration: "~2 hrs",
    frequency: "Every 45 minutes", buses: 4,
    stops: [
      { name: "Umuahia Central Terminal", time: "Departure" },
      { name: "Bende Junction",           time: "~40 min"   },
      { name: "Ohafia Bus Park",          time: "~2 hrs"    },
    ],
    departures: [
      { busId: "BUS-11", time: "9:55 AM",  seats: 5,  eta: "15 min" },
      { busId: "BUS-09", time: "10:40 AM", seats: 42, eta: "60 min" },
    ],
  },
  "intra-aba": {
    name: "Intra-City Aba",
    origin: "Aba Main Terminal",
    destination: "Various city stops",
    fare: "₦150", distance: "City routes", duration: "~20 min",
    frequency: "Every 15 minutes", buses: 5,
    stops: [
      { name: "Aba Main Terminal",  time: "Departure" },
      { name: "Ariaria Market",     time: "~8 min"    },
      { name: "Ngwa Road Junction", time: "~14 min"   },
      { name: "Cemetery Junction",  time: "~20 min"   },
    ],
    departures: [
      { busId: "BUS-13", time: "9:45 AM", seats: 22, eta: "5 min"  },
      { busId: "BUS-15", time: "10:00 AM",seats: 50, eta: "20 min" },
    ],
  },
  "intra-umuahia": {
    name: "Intra-City Umuahia",
    origin: "Umuahia Central Terminal",
    destination: "Various city stops",
    fare: "₦150", distance: "City routes", duration: "~20 min",
    frequency: "Every 15 minutes", buses: 5,
    stops: [
      { name: "Umuahia Central Terminal", time: "Departure" },
      { name: "Ubani Market",             time: "~7 min"    },
      { name: "Government House Junction",time: "~13 min"   },
      { name: "Ikot Ekpene Road",         time: "~20 min"   },
    ],
    departures: [
      { busId: "BUS-18", time: "9:50 AM",  seats: 31, eta: "10 min" },
      { busId: "BUS-20", time: "10:05 AM", seats: 50, eta: "25 min" },
    ],
  },
};

export default function RouteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [paid, setPaid] = useState(false);
  const route = ROUTES[params.id];

  if (!route) {
    return (
      <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>
        <div className="px-5 pt-12 pb-6" style={{ background: "#0F3D22" }}>
          <Link href="/transport" className="text-xs flex items-center gap-1 mb-3"
            style={{ color: "rgba(253,250,245,0.5)", fontFamily: "Space Mono, monospace" }}>
            ← Back
          </Link>
          <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
            Route Not Found
          </h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Link href="/transport">
            <button className="px-6 py-3 rounded-xl text-sm font-bold"
              style={{ background: "#1A6B3C", color: "#fff" }}>
              View All Routes
            </button>
          </Link>
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>

      {/* Header */}
      <div className="px-5 pt-12 pb-5" style={{ background: "#0F3D22" }}>
        <Link href="/transport" className="text-xs mb-3 flex items-center gap-1"
          style={{ color: "rgba(253,250,245,0.5)", fontFamily: "Space Mono, monospace" }}>
          ← Back to Routes
        </Link>
        <p className="text-xs mb-1" style={{
          fontFamily: "Space Mono, monospace", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(59,139,235,0.8)"
        }}>
          Route Detail
        </p>
        <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          {route.name}
        </h1>
        <div className="flex gap-3 mt-2 flex-wrap">
          {[route.distance, route.duration, route.frequency].map((v, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.1)", color: "rgba(253,250,245,0.6)",
                fontFamily: "Space Mono, monospace", fontSize: "9px" }}>
              {v}
            </span>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24">

        {/* Fare + pay */}
        <div className="mx-4 mt-4 rounded-xl p-4 flex items-center justify-between"
          style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.06)" }}>
          <div>
            <p style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
              letterSpacing: "0.1em", textTransform: "uppercase", color: "#8B7355", marginBottom: "3px" }}>
              Subsidised Fare
            </p>
            <p className="text-2xl" style={{ fontFamily: "DM Serif Display, serif", color: "#E8941A" }}>
              {route.fare}
            </p>
            <p className="text-xs mt-1" style={{ color: "#8B7355" }}>
              50% government subsidy applied
            </p>
          </div>
          {paid ? (
            <div className="text-center">
              <div className="text-2xl mb-1">✅</div>
              <p className="text-xs font-semibold" style={{ color: "#1A6B3C" }}>Paid</p>
            </div>
          ) : (
            <button onClick={() => setPaid(true)}
              className="px-5 py-3 rounded-xl text-sm font-bold"
              style={{ background: "#0F3D22", color: "#fff" }}>
              Pay with Card
            </button>
          )}
        </div>

        {/* Map */}
        <div className="mx-4 mt-4 rounded-xl overflow-hidden"
          style={{ height: "180px", boxShadow: "0 4px 20px rgba(26,18,8,0.1)" }}>
          <TransportMap />
        </div>

        {/* Stops */}
        <div className="mx-4 mt-4">
          <p className="flex items-center gap-2 mb-3" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
            <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
            Route Stops
          </p>
          <div className="rounded-xl overflow-hidden"
            style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
            {route.stops.map((stop, i) => (
              <div key={i} className="flex items-start gap-3 p-3"
                style={{ borderBottom: i < route.stops.length - 1
                  ? "1px solid rgba(26,18,8,0.06)" : "none" }}>
                <div className="flex flex-col items-center mt-1 flex-shrink-0">
                  <div className="w-3 h-3 rounded-full border-2 flex-shrink-0"
                    style={{
                      background: i === 0 || i === route.stops.length - 1
                        ? "#1A6B3C" : "#fff",
                      borderColor: "#1A6B3C"
                    }} />
                  {i < route.stops.length - 1 && (
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
        </div>

        {/* Next departures */}
        <div className="mx-4 mt-4">
          <p className="flex items-center gap-2 mb-3" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
            <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
            Next Departures
          </p>
          {route.departures.map((dep, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl mb-2"
              style={{ background: "#fff", boxShadow: "0 2px 8px rgba(26,18,8,0.05)" }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: "#0F3D22" }}>
                <span style={{ fontFamily: "Space Mono, monospace", fontSize: "10px",
                  color: "#E8941A", fontWeight: 700 }}>
                  {dep.busId.split("-")[1]}
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold" style={{ color: "#1A1208" }}>
                  {dep.busId} · Departs {dep.time}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 rounded-full"
                    style={{ background: "rgba(26,18,8,0.08)" }}>
                    <div className="h-full rounded-full"
                      style={{
                        width: `${((50 - dep.seats) / 50) * 100}%`,
                        background: dep.seats < 10 ? "#E8941A" : "#1A6B3C"
                      }} />
                  </div>
                  <span className="text-xs flex-shrink-0" style={{ color: "#8B7355" }}>
                    {dep.seats} seats
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-bold" style={{
                  fontFamily: "DM Serif Display, serif",
                  color: dep.seats < 10 ? "#E8941A" : "#1A6B3C" }}>
                  {dep.eta}
                </p>
                <p className="text-xs" style={{ color: "#8B7355" }}>away</p>
              </div>
            </div>
          ))}
        </div>

        {/* Connect Card CTA */}
        <div className="mx-4 mt-2 mb-4 rounded-xl p-4" style={{ background: "#0F3D22" }}>
          <p className="text-xs mb-1" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.1em", textTransform: "uppercase",
            color: "rgba(255,255,255,0.5)" }}>
            Connect Card Balance
          </p>
          <div className="flex items-center justify-between">
            <p className="text-xl" style={{ fontFamily: "DM Serif Display, serif", color: "#E8941A" }}>
              ₦2,450.00
            </p>
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