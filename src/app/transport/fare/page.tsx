"use client";
import { useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const LOCATIONS = [
  "Umuahia Central Terminal",
  "Aba Main Terminal",
  "Ohafia Bus Park",
  "Isigate Junction",
  "Osisioma Interchange",
  "Ariaria Market",
  "Ngwa Road Junction",
  "Cemetery Junction",
  "Bende Junction",
  "Ubani Market",
  "Government House Junction",
  "Ikot Ekpene Road",
];

const FARES: Record<string, Record<string, { fare: number; duration: string; route: string }>> = {
  "Umuahia Central Terminal": {
    "Aba Main Terminal":        { fare: 800,  duration: "~90 min", route: "umuahia-aba"      },
    "Ohafia Bus Park":          { fare: 1000, duration: "~2 hrs",  route: "umuahia-ohafia"   },
    "Isigate Junction":         { fare: 200,  duration: "~15 min", route: "umuahia-aba"      },
    "Osisioma Interchange":     { fare: 600,  duration: "~55 min", route: "umuahia-aba"      },
    "Bende Junction":           { fare: 400,  duration: "~40 min", route: "umuahia-ohafia"   },
    "Ubani Market":             { fare: 150,  duration: "~7 min",  route: "intra-umuahia"    },
    "Government House Junction":{ fare: 150,  duration: "~13 min", route: "intra-umuahia"    },
    "Ikot Ekpene Road":         { fare: 150,  duration: "~20 min", route: "intra-umuahia"    },
  },
  "Aba Main Terminal": {
    "Umuahia Central Terminal": { fare: 800,  duration: "~90 min", route: "umuahia-aba"      },
    "Ariaria Market":           { fare: 150,  duration: "~8 min",  route: "intra-aba"        },
    "Ngwa Road Junction":       { fare: 150,  duration: "~14 min", route: "intra-aba"        },
    "Cemetery Junction":        { fare: 150,  duration: "~20 min", route: "intra-aba"        },
    "Isigate Junction":         { fare: 150,  duration: "~10 min", route: "intra-aba"        },
  },
};

export default function FareCalculatorPage() {
  const [from, setFrom] = useState("");
  const [to, setTo]     = useState("");
  const [result, setResult] = useState<{
    fare: number; duration: string; route: string
  } | null>(null);
  const [notFound, setNotFound] = useState(false);

  function calculate() {
    setNotFound(false);
    setResult(null);
    if (!from || !to) return;
    if (from === to) { setNotFound(true); return; }
    const fare = FARES[from]?.[to] || FARES[to]?.[from];
    if (fare) {
      setResult(fare);
    } else {
      setNotFound(true);
    }
  }

  function swap() {
    const temp = from;
    setFrom(to);
    setTo(temp);
    setResult(null);
    setNotFound(false);
  }

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>

      {/* Header */}
      <div className="px-5 pt-12 pb-5" style={{ background: "#0F3D22" }}>
        <Link href="/transport" className="text-xs mb-3 flex items-center gap-1"
          style={{ color: "rgba(253,250,245,0.5)", fontFamily: "Space Mono, monospace" }}>
          ← Back
        </Link>
        <p className="text-xs mb-1" style={{
          fontFamily: "Space Mono, monospace", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(59,139,235,0.8)"
        }}>
          Transport · Fare Calculator
        </p>
        <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          How much will it cost?
        </h1>
        <p className="text-xs mt-1" style={{ color: "rgba(253,250,245,0.45)" }}>
          All fares include 50% government subsidy
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">

        {/* From / To selectors */}
        <div className="rounded-xl overflow-hidden mb-3"
          style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.06)" }}>

          {/* From */}
          <div className="p-4" style={{ borderBottom: "1px solid rgba(26,18,8,0.06)" }}>
            <p style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#8B7355", marginBottom: "6px" }}>
              From
            </p>
            <select value={from} onChange={e => { setFrom(e.target.value); setResult(null); setNotFound(false); }}
              className="w-full text-sm outline-none"
              style={{ color: from ? "#1A1208" : "#8B7355",
                fontFamily: "Inter, sans-serif", background: "transparent", border: "none" }}>
              <option value="" disabled>Select departure point</option>
              {LOCATIONS.map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>

          {/* Swap button */}
          <button onClick={swap}
            className="w-full flex items-center justify-center py-2"
            style={{ background: "rgba(26,18,8,0.03)", borderBottom: "1px solid rgba(26,18,8,0.06)" }}>
            <span style={{ fontSize: "16px" }}>⇅</span>
            <span className="text-xs ml-2"
              style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
                color: "#8B7355", letterSpacing: "0.08em" }}>
              SWAP
            </span>
          </button>

          {/* To */}
          <div className="p-4">
            <p style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#8B7355", marginBottom: "6px" }}>
              To
            </p>
            <select value={to} onChange={e => { setTo(e.target.value); setResult(null); setNotFound(false); }}
              className="w-full text-sm outline-none"
              style={{ color: to ? "#1A1208" : "#8B7355",
                fontFamily: "Inter, sans-serif", background: "transparent", border: "none" }}>
              <option value="" disabled>Select destination</option>
              {LOCATIONS.filter(l => l !== from).map(l => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Calculate button */}
        <button onClick={calculate} disabled={!from || !to}
          className="w-full py-4 rounded-xl text-sm font-bold mb-4"
          style={{
            background: from && to ? "#1A6B3C" : "rgba(26,107,60,0.3)",
            color: "#fff", transition: "all 0.2s"
          }}>
          Calculate Fare →
        </button>

        {/* Result */}
        {result && (
          <div className="rounded-xl overflow-hidden mb-4"
            style={{ background: "#fff", boxShadow: "0 4px 20px rgba(26,18,8,0.08)" }}>
            <div className="p-4" style={{ background: "#0F3D22" }}>
              <p style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>
                Subsidised Fare
              </p>
              <p className="text-4xl" style={{ fontFamily: "DM Serif Display, serif", color: "#E8941A" }}>
                ₦{result.fare.toLocaleString()}
              </p>
              <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                Full price: ₦{(result.fare * 2).toLocaleString()} · 50% subsidy saves you ₦{result.fare.toLocaleString()}
              </p>
            </div>
            <div className="p-4">
              <div className="flex justify-between py-2"
                style={{ borderBottom: "1px solid rgba(26,18,8,0.06)" }}>
                <span style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
                  letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B7355" }}>
                  From
                </span>
                <span className="text-xs font-semibold" style={{ color: "#1A1208" }}>{from}</span>
              </div>
              <div className="flex justify-between py-2"
                style={{ borderBottom: "1px solid rgba(26,18,8,0.06)" }}>
                <span style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
                  letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B7355" }}>
                  To
                </span>
                <span className="text-xs font-semibold" style={{ color: "#1A1208" }}>{to}</span>
              </div>
              <div className="flex justify-between py-2">
                <span style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
                  letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B7355" }}>
                  Est. Duration
                </span>
                <span className="text-xs font-semibold" style={{ color: "#1A1208" }}>
                  {result.duration}
                </span>
              </div>
            </div>
            <div className="px-4 pb-4 flex gap-2">
              <Link href={`/transport/routes/${result.route}`} className="flex-1">
                <button className="w-full py-3 rounded-xl text-xs font-bold"
                  style={{ background: "#1A6B3C", color: "#fff" }}>
                  View Route →
                </button>
              </Link>
              <button className="flex-1 py-3 rounded-xl text-xs font-bold"
                style={{ background: "#0F3D22", color: "#fff" }}>
                Pay ₦{result.fare.toLocaleString()} with Card
              </button>
            </div>
          </div>
        )}

        {/* Not found */}
        {notFound && (
          <div className="rounded-xl p-4 text-center"
            style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-sm font-semibold mb-1" style={{ color: "#1A1208" }}>
              No direct route found
            </p>
            <p className="text-xs" style={{ color: "#8B7355" }}>
              This route combination is not yet available. Check back as we expand the network.
            </p>
          </div>
        )}

        {/* Popular routes */}
        {!result && !notFound && (
          <div>
            <p className="flex items-center gap-2 mb-3" style={{
              fontFamily: "Space Mono, monospace", fontSize: "9px",
              letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
              <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
              Popular Routes
            </p>
            {[
              { from: "Umuahia Central Terminal", to: "Aba Main Terminal",  fare: "₦800"   },
              { from: "Umuahia Central Terminal", to: "Ohafia Bus Park",    fare: "₦1,000" },
              { from: "Aba Main Terminal",        to: "Ariaria Market",     fare: "₦150"   },
              { from: "Umuahia Central Terminal", to: "Ubani Market",       fare: "₦150"   },
            ].map((r, i) => (
              <button key={i} onClick={() => { setFrom(r.from); setTo(r.to); setResult(null); }}
                className="w-full flex items-center justify-between p-3 rounded-xl mb-2 text-left"
                style={{ background: "#fff", boxShadow: "0 2px 8px rgba(26,18,8,0.04)",
                  border: "1px solid rgba(26,18,8,0.06)" }}>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "#1A1208" }}>
                    {r.from.split(" ")[0]} → {r.to.split(" ")[0]}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#8B7355" }}>
                    Tap to prefill
                  </p>
                </div>
                <span style={{ fontFamily: "Space Mono, monospace",
                  fontSize: "13px", color: "#E8941A", fontWeight: 700 }}>
                  {r.fare}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}