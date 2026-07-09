"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const AMOUNTS = [500, 1000, 2000, 5000];

export default function TopUpPage() {
  const [currentBalance, setCurrentBalance] = useState<number | null>(null);
  const [amount, setAmount]         = useState("");
  const [custom, setCustom]         = useState("");
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [reference, setReference]   = useState("");
  const [newBalance, setNewBalance] = useState<number | null>(null);
  const [error, setError]           = useState<string | null>(null);

  const finalAmount = amount || custom;

  useEffect(() => {
    fetchBalance();
  }, []);

  async function fetchBalance() {
    try {
      const res = await fetch("/api/user/balance");
      const data = await res.json();
      setCurrentBalance(data.balance ?? 0);
    } catch {
      setCurrentBalance(0);
    }
  }

  async function handlePaystack() {
    if (!finalAmount || parseInt(finalAmount) < 50) return;
    setLoading(true);
    setError(null);

    try {
      // In production this calls a real Paystack checkout URL; simulated here
      await new Promise(r => setTimeout(r, 1200));

      const res = await fetch("/api/user/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseInt(finalAmount) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Top-up failed");

      const ref = "PS-" + Date.now().toString().slice(-8);
      setReference(ref);
      setNewBalance(data.balance);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Top-up failed");
    }
    setLoading(false);
  }

  if (success) {
    return (
      <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>
        <div className="px-5 pt-12 pb-8 text-center" style={{ background: "#0F3D22" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
            style={{ background: "rgba(232,148,26,0.2)", border: "2px solid rgba(232,148,26,0.4)" }}>
            ✅
          </div>
          <h1 className="text-2xl text-white mb-2"
            style={{ fontFamily: "DM Serif Display, serif" }}>
            Top-Up Successful
          </h1>
          <p className="text-sm" style={{ color: "rgba(253,250,245,0.5)" }}>
            ₦{parseInt(finalAmount).toLocaleString()} added to your Connect Card
          </p>
        </div>

        <div className="flex-1 px-4 pt-4 pb-24">
          <div className="rounded-xl overflow-hidden mb-4"
            style={{ background: "#fff", boxShadow: "0 4px 20px rgba(26,18,8,0.08)" }}>
            <div className="p-4" style={{ background: "#1A6B3C" }}>
              <p style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.6)", marginBottom: "4px" }}>
                New Balance
              </p>
              <p className="text-3xl" style={{ fontFamily: "DM Serif Display, serif", color: "#E8941A" }}>
                ₦{(newBalance ?? 0).toLocaleString()}.00
              </p>
            </div>
            <div className="p-4">
              {[
                { label: "Amount Added",  value: `₦${parseInt(finalAmount).toLocaleString()}` },
                { label: "Reference",     value: reference },
                { label: "Card",          value: "•••• 4821" },
                { label: "Provider",      value: "Paystack" },
              ].map((row, i) => (
                <div key={i} className="flex justify-between items-center py-2"
                  style={{ borderBottom: i < 3 ? "1px solid rgba(26,18,8,0.06)" : "none" }}>
                  <span style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
                    letterSpacing: "0.08em", textTransform: "uppercase", color: "#8B7355" }}>
                    {row.label}
                  </span>
                  <span className="text-xs font-semibold" style={{ color: "#1A1208" }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Link href="/transport">
            <button className="w-full py-3.5 rounded-xl text-sm font-bold"
              style={{ background: "#1A6B3C", color: "#fff" }}>
              Back to Transport
            </button>
          </Link>
        </div>
        <BottomNav />
      </main>
    );
  }

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
          Connect Card · Top Up
        </p>
        <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          Add funds to your card
        </h1>

        {/* Current balance */}
        <div className="mt-3 flex items-center justify-between p-3 rounded-xl"
          style={{ background: "rgba(255,255,255,0.08)" }}>
          <div>
            <p style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
              letterSpacing: "0.1em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)", marginBottom: "2px" }}>
              Current Balance
            </p>
            <p style={{ fontFamily: "DM Serif Display, serif", fontSize: "20px", color: "#E8941A" }}>
              {currentBalance === null ? "..." : `₦${currentBalance.toLocaleString()}.00`}
            </p>
          </div>
          <div style={{ fontFamily: "Space Mono, monospace", fontSize: "11px",
            color: "rgba(255,255,255,0.4)" }}>
            •••• 4821
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">

        {/* Quick amounts */}
        <p className="flex items-center gap-2 mb-3" style={{
          fontFamily: "Space Mono, monospace", fontSize: "9px",
          letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
          <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
          Select Amount
        </p>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {AMOUNTS.map(a => (
            <button key={a}
              onClick={() => { setAmount(a.toString()); setCustom(""); }}
              className="py-3 rounded-xl text-sm font-bold"
              style={{
                background: amount === a.toString() ? "#1A6B3C" : "#fff",
                color: amount === a.toString() ? "#fff" : "#1A1208",
                border: amount === a.toString()
                  ? "none" : "1.5px solid rgba(26,18,8,0.1)",
                boxShadow: "0 2px 8px rgba(26,18,8,0.04)",
                fontFamily: "DM Serif Display, serif",
                fontSize: "16px",
              }}>
              ₦{a.toLocaleString()}
            </button>
          ))}
        </div>

        {/* Custom amount */}
        <p className="flex items-center gap-2 mb-2" style={{
          fontFamily: "Space Mono, monospace", fontSize: "9px",
          letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
          <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
          Or Enter Custom Amount
        </p>
        <div className="relative mb-4">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold"
            style={{ color: "#8B7355" }}>₦</span>
          <input
            type="number"
            value={custom}
            onChange={e => { setCustom(e.target.value); setAmount(""); }}
            placeholder="Enter amount (min ₦50)"
            className="w-full pl-7 pr-4 py-3 rounded-xl text-sm"
            style={{ background: "#fff", border: "1.5px solid rgba(26,18,8,0.1)",
              color: "#1A1208", fontFamily: "Inter, sans-serif", outline: "none" }}
          />
        </div>

        {/* Summary */}
        {finalAmount && parseInt(finalAmount) >= 50 && currentBalance !== null && (
          <div className="rounded-xl p-4 mb-4"
            style={{ background: "rgba(26,107,60,0.06)", border: "1px solid rgba(26,107,60,0.15)" }}>
            <div className="flex justify-between mb-1">
              <span className="text-xs" style={{ color: "#8B7355" }}>Top-up amount</span>
              <span className="text-xs font-semibold" style={{ color: "#1A1208" }}>
                ₦{parseInt(finalAmount).toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between mb-1">
              <span className="text-xs" style={{ color: "#8B7355" }}>Current balance</span>
              <span className="text-xs font-semibold" style={{ color: "#1A1208" }}>
                ₦{currentBalance.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between pt-2"
              style={{ borderTop: "1px solid rgba(26,107,60,0.15)" }}>
              <span className="text-xs font-bold" style={{ color: "#1A6B3C" }}>New balance</span>
              <span className="text-xs font-bold" style={{ color: "#1A6B3C" }}>
                ₦{(currentBalance + parseInt(finalAmount)).toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {error && (
          <p className="text-xs mb-3" style={{ color: "#C0392B" }}>{error}</p>
        )}

        {/* Pay with Paystack */}
        <button onClick={handlePaystack}
          disabled={!finalAmount || parseInt(finalAmount) < 50 || loading}
          className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mb-3"
          style={{
            background: finalAmount && parseInt(finalAmount) >= 50 ? "#1A6B3C" : "rgba(26,107,60,0.25)",
            color: finalAmount && parseInt(finalAmount) >= 50 ? "#fff" : "rgba(26,107,60,0.5)",
          }}>
          {loading ? "Processing..." : `Pay ₦${finalAmount ? parseInt(finalAmount).toLocaleString() : "0"} with Paystack`}
        </button>

        <p className="text-center text-xs" style={{
          fontFamily: "Space Mono, monospace", fontSize: "9px",
          color: "#8B7355", letterSpacing: "0.06em" }}>
          SECURED BY PAYSTACK · NO CARD FEES
        </p>

        <p className="text-center text-xs mt-3" style={{ color: "#8B7355" }}>
          Minimum top-up: ₦50 · Funds never expire
        </p>
      </div>

      <BottomNav />
    </main>
  );
}