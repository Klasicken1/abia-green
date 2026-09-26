"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export default function TrackLookupPage() {
  const router = useRouter();
  const [trackingId, setTrackingId] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = trackingId.trim().toUpperCase();
    if (!id) {
      setError("Enter a tracking ID to continue.");
      return;
    }
    router.push(`/track/${encodeURIComponent(id)}`);
  }

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>
      <div className="px-5 pt-12 pb-6" style={{ background: "#0F3D22" }}>
        <Link href="/profile" className="text-xs mb-3 flex items-center gap-1"
          style={{ color: "rgba(253,250,245,0.5)", fontFamily: "Space Mono, monospace" }}>
          ← Back
        </Link>
        <p className="text-xs mb-1" style={{
          fontFamily: "Space Mono, monospace", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(232,148,26,0.8)" }}>
          Report Tracking
        </p>
        <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          Track a Report
        </h1>
      </div>

      <div className="flex-1 px-4 pt-6 pb-24">
        <form onSubmit={handleSubmit}>
          <p className="text-xs mb-2" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.1em", textTransform: "uppercase", color: "#8B7355" }}>
            Tracking ID
          </p>
          <input
            type="text"
            value={trackingId}
            onChange={e => { setTrackingId(e.target.value); setError(null); }}
            placeholder="AG-XXXXXX"
            className="w-full p-3.5 rounded-xl text-sm mb-2"
            style={{ background: "#fff", border: "1.5px solid rgba(26,18,8,0.1)",
              color: "#1A1208", fontFamily: "Space Mono, monospace",
              letterSpacing: "0.05em", outline: "none" }}
          />
          {error && (
            <p className="text-xs mb-3" style={{ color: "#C0392B" }}>{error}</p>
          )}
          <button type="submit"
            className="w-full py-3.5 rounded-xl text-sm font-bold mt-2"
            style={{ background: "#1A6B3C", color: "#fff" }}>
            Track Report →
          </button>
        </form>

        <p className="text-xs text-center mt-6" style={{ color: "#8B7355" }}>
          Don&apos;t have a tracking ID?{" "}
          <Link href="/environment" style={{ color: "#1A6B3C", fontWeight: 600 }}>
            Submit a report
          </Link>
        </p>
      </div>

      <BottomNav />
    </main>
  );
}