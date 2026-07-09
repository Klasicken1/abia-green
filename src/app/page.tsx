"use client";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = session?.user?.role;
  const firstName = session?.user?.name?.split(" ")[0] || "Welcome";
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (role === "driver") {
      router.replace("/driver");
    } else if (role === "admin") {
      router.replace("/admin");
    }
  }, [role, router]);

  useEffect(() => {
    if (session && role === "rider") {
      fetch("/api/user/balance")
        .then(r => r.json())
        .then(data => setBalance(data.balance ?? 0))
        .catch(() => setBalance(null));
    }
  }, [session, role]);

  // While auth is resolving, or while a driver/admin is about to be redirected
  if (status === "loading" || role === "driver" || role === "admin") {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center"
        style={{ background: "#F7F3EC" }}>
        <div className="text-3xl mb-3">🌿</div>
        <p className="text-sm" style={{ color: "#8B7355" }}>Loading...</p>
      </main>
    );
  }

  // Signed out — show sign-in landing instead of dashboard content
  if (!session) {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center px-6"
        style={{ background: "linear-gradient(160deg, #0F3D22 0%, #1A6B3C 100%)" }}>
        <div className="w-full max-w-sm text-center">
          <div className="text-5xl mb-4">🌿</div>
          <h1 className="text-3xl mb-2 text-white"
            style={{ fontFamily: "DM Serif Display, serif" }}>
            Abia Green
          </h1>
          <p className="text-sm mb-8" style={{ color: "rgba(253,250,245,0.6)" }}>
            Transport tracking and environmental reporting for Abia State
          </p>

          <button onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-3 mb-3"
            style={{ background: "#fff", color: "#1A1208",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }}>
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
              <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.77-2.7.77-2.08 0-3.84-1.4-4.47-3.29H1.85v2.07A8 8 0 0 0 8.98 17z"/>
              <path fill="#FBBC05" d="M4.51 10.53c-.16-.48-.25-.99-.25-1.53s.09-1.05.25-1.53V5.4H1.85A8 8 0 0 0 .98 9c0 1.29.31 2.51.87 3.6l2.66-2.07z"/>
              <path fill="#EA4335" d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 .87 5.4L3.53 7.47c.63-1.89 2.39-3.89 5.45-3.89z"/>
            </svg>
            Continue with Google
          </button>

          <Link href="/auth/signin">
            <button className="w-full py-3.5 rounded-xl text-sm font-bold"
              style={{ background: "rgba(255,255,255,0.1)", color: "#fff",
                border: "1px solid rgba(255,255,255,0.2)" }}>
              Sign In with Email
            </button>
          </Link>

          <div className="mt-8 pt-6" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <p className="text-xs mb-3" style={{ color: "rgba(253,250,245,0.4)" }}>
              Want to report an issue without signing in?
            </p>
            <Link href="/environment">
              <button className="w-full py-3 rounded-xl text-xs font-semibold"
                style={{ background: "transparent", color: "rgba(253,250,245,0.7)",
                  border: "1px solid rgba(255,255,255,0.15)" }}>
                Submit or Track a Report →
              </button>
            </Link>
          </div>

          <p className="mt-8 text-xs" style={{
            fontFamily: "Space Mono, monospace", color: "rgba(253,250,245,0.3)",
            fontSize: "8px", letterSpacing: "0.08em" }}>
            MORNING STACK ICT CLUB · IBEKU HIGH SCHOOL
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>

      {/* ── HERO SECTION ── */}
      <div className="relative px-5 pt-12 pb-6"
        style={{ background: "linear-gradient(160deg, #0F3D22 0%, #1A6B3C 100%)" }}>

        <p className="text-sm mb-1" style={{ color: "rgba(253,250,245,0.55)" }}>
          Good morning,
        </p>
        <h1 className="text-2xl mb-5"
          style={{ fontFamily: "DM Serif Display, serif", color: "#fff" }}>
          {firstName} 👋
        </h1>

        {/* Connect Card */}
        <div className="rounded-xl p-4 flex items-center justify-between"
          style={{ background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(12px)" }}>
          <div>
            <p className="mb-1" style={{ fontFamily: "Space Mono, monospace",
              fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase",
              color: "rgba(255,255,255,0.5)" }}>
              Connect Card Balance
            </p>
            <p className="text-3xl leading-none"
              style={{ fontFamily: "DM Serif Display, serif", color: "#E8941A" }}>
              {balance === null
                ? "..."
                : <>₦{balance.toLocaleString()}<span className="text-base opacity-60">.00</span></>
              }
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1 px-2 py-1 rounded-full"
                style={{ background: "rgba(26,107,60,0.3)",
                  fontFamily: "Space Mono, monospace", fontSize: "8px", color: "#90EE90" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "#90EE90" }} />
                Active
              </span>
              <span style={{ fontFamily: "Space Mono, monospace",
                fontSize: "9px", color: "rgba(255,255,255,0.35)" }}>
                •••• 4821
              </span>
            </div>
          </div>
          <Link href="/transport/topup">
            <div className="w-10 h-7 rounded flex items-center justify-center text-xs font-bold"
              style={{ background: "linear-gradient(135deg, #E8941A, #C27A10)",
                color: "#fff", fontSize: "9px" }}>
              TOP UP
            </div>
          </Link>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 overflow-y-auto pb-24 px-4">

        {/* Module tiles */}
        <div className="mt-4 mb-1">
          <p className="flex items-center gap-2 mb-3" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#1A6B3C" }}>
            <span className="inline-block w-3.5 h-0.5" style={{ background: "#1A6B3C" }} />
            Platform Modules
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/transport">
              <div className="rounded-xl p-4 flex flex-col gap-2 cursor-pointer"
                style={{ background: "#0F3D22" }}>
                <span className="text-2xl">🚌</span>
                <span className="font-semibold text-sm text-white"
                  style={{ fontFamily: "DM Serif Display, serif" }}>
                  Green Shuttle
                </span>
                <span className="text-xs" style={{ color: "rgba(253,250,245,0.5)" }}>
                  4 routes · 20 buses live
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(26,107,60,0.3)",
                      fontFamily: "Space Mono, monospace", fontSize: "8px", color: "#90EE90" }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: "#90EE90" }} />
                    Live
                  </span>
                  <span style={{ color: "rgba(253,250,245,0.3)", fontSize: "14px" }}>→</span>
                </div>
              </div>
            </Link>

            <Link href="/environment">
              <div className="rounded-xl p-4 flex flex-col gap-2 cursor-pointer"
                style={{ background: "#3D2800" }}>
                <span className="text-2xl">🌿</span>
                <span className="font-semibold text-sm text-white"
                  style={{ fontFamily: "DM Serif Display, serif" }}>
                  Environment
                </span>
                <span className="text-xs" style={{ color: "rgba(253,250,245,0.5)" }}>
                  527 reports · ASEPA
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(232,148,26,0.2)",
                      fontFamily: "Space Mono, monospace", fontSize: "8px", color: "#E8941A" }}>
                    4 pending
                  </span>
                  <span style={{ color: "rgba(253,250,245,0.3)", fontSize: "14px" }}>→</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div className="rounded-xl p-4 mt-4"
          style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
          <p className="flex items-center gap-2 mb-3" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
            <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
            Today&apos;s Activity
          </p>
          <div className="grid grid-cols-3 divide-x divide-gray-100">
            {[
              { val: "3,847", lbl: "Riders",   color: "#E8941A" },
              { val: "87%",   lbl: "On Time",  color: "#1A6B3C" },
              { val: "4.8t",  lbl: "CO₂ Saved",color: "#1A6B3C" },
            ].map((s, i) => (
              <div key={i} className="text-center px-2">
                <p className="text-xl leading-none"
                  style={{ fontFamily: "DM Serif Display, serif", color: s.color }}>
                  {s.val}
                </p>
                <p className="mt-1" style={{ fontFamily: "Space Mono, monospace",
                  fontSize: "8px", letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "#8B7355" }}>
                  {s.lbl}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-4">
          <p className="flex items-center gap-2 mb-3" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
            <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
            Recent
          </p>
          {[
            { icon: "🚌", bg: "rgba(26,107,60,0.1)",
              title: "Rode BUS-04 · Umuahia → Aba",
              sub: "₦800 deducted · Connect Card", time: "2h ago" },
            { icon: "📍", bg: "rgba(232,148,26,0.1)",
              title: "Report submitted · AG-481923",
              sub: "Illegal dump · Isigate Junction", time: "1d ago" },
            { icon: "💳", bg: "rgba(26,107,60,0.1)",
              title: "Card topped up · ₦3,000",
              sub: "Via Paystack · Balance: ₦2,450", time: "2d ago" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 py-3"
              style={{ borderBottom: i < 2 ? "1px solid rgba(26,18,8,0.06)" : "none" }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: item.bg }}>
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "#1A1208" }}>
                  {item.title}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#8B7355" }}>
                  {item.sub}
                </p>
              </div>
              <span className="flex-shrink-0" style={{
                fontFamily: "Space Mono, monospace", fontSize: "9px", color: "#8B7355" }}>
                {item.time}
              </span>
            </div>
          ))}
        </div>

        {/* Club badge */}
        <div className="flex justify-center mt-4 mb-2">
          <span className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
            style={{ background: "rgba(26,107,60,0.08)",
              fontFamily: "Space Mono, monospace", fontSize: "8px",
              letterSpacing: "0.1em", textTransform: "uppercase", color: "#1A6B3C" }}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#1A6B3C" }} />
            Morning Stack ICT Club · Ibeku High School
          </span>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}