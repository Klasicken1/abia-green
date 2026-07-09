"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
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
    "Aba Main Terminal":         { fare: 800,  duration: "~90 min", route: "umuahia-aba"     },
    "Ohafia Bus Park":           { fare: 1000, duration: "~2 hrs",  route: "umuahia-ohafia"  },
    "Isigate Junction":          { fare: 200,  duration: "~15 min", route: "umuahia-aba"     },
    "Osisioma Interchange":      { fare: 600,  duration: "~55 min", route: "umuahia-aba"     },
    "Bende Junction":            { fare: 400,  duration: "~40 min", route: "umuahia-ohafia"  },
    "Ubani Market":              { fare: 150,  duration: "~7 min",  route: "intra-umuahia"   },
    "Government House Junction": { fare: 150,  duration: "~13 min", route: "intra-umuahia"   },
    "Ikot Ekpene Road":          { fare: 150,  duration: "~20 min", route: "intra-umuahia"   },
  },
  "Aba Main Terminal": {
    "Umuahia Central Terminal":  { fare: 800,  duration: "~90 min", route: "umuahia-aba"     },
    "Ariaria Market":            { fare: 150,  duration: "~8 min",  route: "intra-aba"       },
    "Ngwa Road Junction":        { fare: 150,  duration: "~14 min", route: "intra-aba"       },
    "Cemetery Junction":         { fare: 150,  duration: "~20 min", route: "intra-aba"       },
    "Isigate Junction":          { fare: 150,  duration: "~10 min", route: "intra-aba"       },
  },
};

export default function FareCalculatorPage() {
  const { data: session } = useSession();
  const [from, setFrom]     = useState("");
  const [to, setTo]         = useState("");
  const [result, setResult] = useState<{ fare: number; duration: string; route: string } | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [paying, setPaying]           = useState(false);
  const [paySuccess, setPaySuccess]   = useState(false);
  const [payError, setPayError]       = useState<string | null>(null);
  const [insufficientBalance, setInsufficientBalance] = useState(false);

  function handleFrom(val: string) {
    setFrom(val);
    setResult(null);
    setNotFound(false);
    setPaySuccess(false);
    setPayError(null);
    setInsufficientBalance(false);
  }

  function handleTo(val: string) {
    setTo(val);
    setResult(null);
    setNotFound(false);
    setPaySuccess(false);
    setPayError(null);
    setInsufficientBalance(false);
  }

  function calculate() {
    setResult(null);
    setNotFound(false);
    setPaySuccess(false);
    setPayError(null);
    setInsufficientBalance(false);
    if (!from || !to || from === to) { setNotFound(true); return; }
    const fare = FARES[from]?.[to] || FARES[to]?.[from];
    if (fare) { setResult(fare); } else { setNotFound(true); }
  }

  function swap() {
    const tmp = from;
    setFrom(to);
    setTo(tmp);
    setResult(null);
    setNotFound(false);
    setPaySuccess(false);
    setPayError(null);
    setInsufficientBalance(false);
  }

  async function handlePay() {
    if (!result) return;

    if (!session) {
      setPayError("Sign in to save this journey to your history.");
      return;
    }

    setPaying(true);
    setPayError(null);
    setInsufficientBalance(false);
    try {
      const res = await fetch("/api/journeys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          route: result.route,
          from,
          to,
          fare: result.fare,
          source: "fare_payment",
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        if (res.status === 402) {
          setInsufficientBalance(true);
        }
        throw new Error(err.error || "Payment failed");
      }

      setPaySuccess(true);
    } catch (err) {
      setPayError(err instanceof Error ? err.message : "Payment failed");
    }
    setPaying(false);
  }

  const canCalculate = from !== "" && to !== "" && from !== to;

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

        {/* FROM */}
        <p className="text-xs mb-1" style={{
          fontFamily: "Space Mono, monospace", fontSize: "9px",
          letterSpacing: "0.1em", textTransform: "uppercase", color: "#8B7355" }}>
          From
        </p>
        <select
          value={from}
          onChange={e => handleFrom(e.target.value)}
          className="w-full p-3 rounded-xl text-sm mb-3"
          style={{ background: "#fff", border: "1.5px solid rgba(26,18,8,0.12)",
            color: from ? "#1A1208" : "#8B7355", fontFamily: "Inter, sans-serif", outline: "none",
            appearance: "none", WebkitAppearance: "none" }}>
          <option value="">Select departure point</option>
          {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        {/* SWAP */}
        <button onClick={swap}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl mb-3"
          style={{ background: "rgba(26,18,8,0.05)", border: "1px solid rgba(26,18,8,0.08)" }}>
          <span style={{ fontSize: "16px" }}>⇅</span>
          <span style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
            color: "#8B7355", letterSpacing: "0.08em" }}>
            SWAP LOCATIONS
          </span>
        </button>

        {/* TO */}
        <p className="text-xs mb-1" style={{
          fontFamily: "Space Mono, monospace", fontSize: "9px",
          letterSpacing: "0.1em", textTransform: "uppercase", color: "#8B7355" }}>
          To
        </p>
        <select
          value={to}
          onChange={e => handleTo(e.target.value)}
          className="w-full p-3 rounded-xl text-sm mb-4"
          style={{ background: "#fff", border: "1.5px solid rgba(26,18,8,0.12)",
            color: to ? "#1A1208" : "#8B7355", fontFamily: "Inter, sans-serif", outline: "none",
            appearance: "none", WebkitAppearance: "none" }}>
          <option value="">Select destination</option>
          {LOCATIONS.filter(l => l !== from).map(l => <option key={l} value={l}>{l}</option>)}
        </select>

        {/* CALCULATE */}
        <button
          onClick={calculate}
          className="w-full py-4 rounded-xl text-sm font-bold mb-4"
          style={{
            background: canCalculate ? "#1A6B3C" : "rgba(26,107,60,0.25)",
            color: canCalculate ? "#fff" : "rgba(26,107,60,0.5)",
            cursor: canCalculate ? "pointer" : "not-allowed",
            transition: "all 0.2s",
          }}>
          {canCalculate ? "Calculate Fare →" : "Select both locations first"}
        </button>

        {/* RESULT */}
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
                Full price: ₦{(result.fare * 2).toLocaleString()} · You save ₦{result.fare.toLocaleString()}
              </p>
            </div>
            <div className="p-4">
              {[
                { label: "From",     value: from },
                { label: "To",       value: to },
                { label: "Duration", value: result.duration },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center py-2"
                  style={{ borderBottom: i < 2 ? "1px solid rgba(26,18,8,0.06)" : "none" }}>
                  <span style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
                    letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B7355" }}>
                    {row.label}
                  </span>
                  <span className="text-xs font-semibold text-right max-w-48"
                    style={{ color: "#1A1208" }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {paySuccess ? (
              <div className="px-4 pb-4">
                <div className="w-full py-3 rounded-xl text-xs font-bold text-center mb-2"
                  style={{ background: "rgba(26,107,60,0.1)", color: "#1A6B3C",
                    border: "1px solid rgba(26,107,60,0.25)" }}>
                  ✓ Journey logged to your history
                </div>
                <Link href="/journeys">
                  <button className="w-full py-3 rounded-xl text-xs font-bold"
                    style={{ background: "#0F3D22", color: "#fff" }}>
                    View Journey History →
                  </button>
                </Link>
              </div>
            ) : (
              <div className="px-4 pb-4">
                {payError && (
                  <div className="mb-2">
                    <p className="text-xs mb-2" style={{ color: "#C0392B" }}>
                      {payError}
                    </p>
                    {insufficientBalance && (
                      <Link href="/transport/topup">
                        <button className="w-full py-2.5 rounded-xl text-xs font-bold mb-2"
                          style={{ background: "#E8941A", color: "#fff" }}>
                          Top Up Connect Card →
                        </button>
                      </Link>
                    )}
                  </div>
                )}
                <div className="flex gap-2">
                  <Link href={`/transport/routes/${result.route}`} className="flex-1">
                    <button className="w-full py-3 rounded-xl text-xs font-bold"
                      style={{ background: "#1A6B3C", color: "#fff" }}>
                      View Route →
                    </button>
                  </Link>
                  <button
                    onClick={handlePay}
                    disabled={paying}
                    className="flex-1 py-3 rounded-xl text-xs font-bold"
                    style={{ background: paying ? "rgba(15,61,34,0.5)" : "#0F3D22", color: "#fff" }}>
                    {paying ? "Processing..." : `Pay ₦${result.fare.toLocaleString()}`}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NOT FOUND */}
        {notFound && (
          <div className="rounded-xl p-4 text-center"
            style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
            <div className="text-3xl mb-2">🔍</div>
            <p className="text-sm font-semibold mb-1" style={{ color: "#1A1208" }}>
              No direct route found
            </p>
            <p className="text-xs" style={{ color: "#8B7355" }}>
              Try selecting different locations or check the routes page.
            </p>
          </div>
        )}

        {/* POPULAR ROUTES */}
        {!result && !notFound && (
          <div>
            <p className="flex items-center gap-2 mb-3" style={{
              fontFamily: "Space Mono, monospace", fontSize: "9px",
              letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
              <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
              Popular Routes
            </p>
            {[
              { from: "Umuahia Central Terminal", to: "Aba Main Terminal",   fare: "₦800"   },
              { from: "Umuahia Central Terminal", to: "Ohafia Bus Park",     fare: "₦1,000" },
              { from: "Aba Main Terminal",        to: "Ariaria Market",      fare: "₦150"   },
              { from: "Umuahia Central Terminal", to: "Ubani Market",        fare: "₦150"   },
            ].map((r, i) => (
              <button key={i}
                onClick={() => { handleFrom(r.from); handleTo(r.to); }}
                className="w-full flex items-center justify-between p-3 rounded-xl mb-2 text-left"
                style={{ background: "#fff", boxShadow: "0 2px 8px rgba(26,18,8,0.04)",
                  border: "1px solid rgba(26,18,8,0.06)" }}>
                <div>
                  <p className="text-xs font-semibold" style={{ color: "#1A1208" }}>
                    {r.from.split(" ")[0]} → {r.to.split(" ")[0]}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#8B7355" }}>Tap to prefill</p>
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