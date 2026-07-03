import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>

      {/* ── HERO SECTION ── */}
      <div
        className="relative px-5 pt-12 pb-6"
        style={{
          background: "linear-gradient(160deg, #0F3D22 0%, #1A6B3C 100%)",
        }}
      >
        {/* Greeting */}
        <p className="text-sm mb-1" style={{ color: "rgba(253,250,245,0.55)" }}>
          Good morning,
        </p>
        <h1
          className="text-2xl mb-5"
          style={{ fontFamily: "DM Serif Display, serif", color: "#fff" }}
        >
          Welcome to Abia Green 👋
        </h1>

        {/* Connect Card */}
        <div
          className="rounded-xl p-4 flex items-center justify-between"
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.15)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div>
            <p
              className="mb-1"
              style={{
                fontFamily: "Space Mono, monospace",
                fontSize: "9px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)",
              }}
            >
              Connect Card Balance
            </p>
            <p
              className="text-3xl leading-none"
              style={{ fontFamily: "DM Serif Display, serif", color: "#E8941A" }}
            >
              ₦2,450<span className="text-base opacity-60">.00</span>
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className="flex items-center gap-1 px-2 py-1 rounded-full text-xs"
                style={{
                  background: "rgba(26,107,60,0.3)",
                  fontFamily: "Space Mono, monospace",
                  fontSize: "8px",
                  color: "#90EE90",
                }}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "#90EE90" }}
                />
                Active
              </span>
              <span
                style={{
                  fontFamily: "Space Mono, monospace",
                  fontSize: "9px",
                  color: "rgba(255,255,255,0.35)",
                }}
              >
                •••• 4821
              </span>
            </div>
          </div>
          {/* Chip */}
          <div
            className="w-10 h-7 rounded"
            style={{
              background: "linear-gradient(135deg, #E8941A, #C27A10)",
            }}
          />
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 overflow-y-auto pb-24 px-4">

        {/* Module tiles */}
        <div className="mt-4 mb-1">
          <p
            className="flex items-center gap-2 mb-3"
            style={{
              fontFamily: "Space Mono, monospace",
              fontSize: "9px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#1A6B3C",
            }}
          >
            <span
              className="inline-block w-3.5 h-0.5"
              style={{ background: "#1A6B3C" }}
            />
            Platform Modules
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/transport">
              <div
                className="rounded-xl p-4 flex flex-col gap-2 cursor-pointer"
                style={{ background: "#0F3D22" }}
              >
                <span className="text-2xl">🚌</span>
                <span
                  className="font-semibold text-sm text-white"
                  style={{ fontFamily: "DM Serif Display, serif" }}
                >
                  Green Shuttle
                </span>
                <span className="text-xs" style={{ color: "rgba(253,250,245,0.5)" }}>
                  4 routes · 20 buses live
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span
                    className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(26,107,60,0.3)",
                      fontFamily: "Space Mono, monospace",
                      fontSize: "8px",
                      color: "#90EE90",
                    }}
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: "#90EE90" }}
                    />
                    Live
                  </span>
                  <span style={{ color: "rgba(253,250,245,0.3)", fontSize: "14px" }}>→</span>
                </div>
              </div>
            </Link>

            <Link href="/environment">
              <div
                className="rounded-xl p-4 flex flex-col gap-2 cursor-pointer"
                style={{ background: "#3D2800" }}
              >
                <span className="text-2xl">🌿</span>
                <span
                  className="font-semibold text-sm text-white"
                  style={{ fontFamily: "DM Serif Display, serif" }}
                >
                  Environment
                </span>
                <span className="text-xs" style={{ color: "rgba(253,250,245,0.5)" }}>
                  527 reports · ASEPA
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span
                    className="px-2 py-0.5 rounded-full"
                    style={{
                      background: "rgba(232,148,26,0.2)",
                      fontFamily: "Space Mono, monospace",
                      fontSize: "8px",
                      color: "#E8941A",
                    }}
                  >
                    4 pending
                  </span>
                  <span style={{ color: "rgba(253,250,245,0.3)", fontSize: "14px" }}>→</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Stats row */}
        <div
          className="rounded-xl p-4 mt-4"
          style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}
        >
          <p
            className="flex items-center gap-2 mb-3"
            style={{
              fontFamily: "Space Mono, monospace",
              fontSize: "9px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#C27A10",
            }}
          >
            <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
            Today&apos;s Activity
          </p>
          <div className="grid grid-cols-3 divide-x" style={{ divideColor: "rgba(26,18,8,0.06)" }}>
            <div className="text-center pr-2">
              <p
                className="text-xl leading-none"
                style={{ fontFamily: "DM Serif Display, serif", color: "#E8941A" }}
              >
                3,847
              </p>
              <p
                className="mt-1"
                style={{
                  fontFamily: "Space Mono, monospace",
                  fontSize: "8px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#8B7355",
                }}
              >
                Riders
              </p>
            </div>
            <div className="text-center px-2">
              <p
                className="text-xl leading-none"
                style={{ fontFamily: "DM Serif Display, serif", color: "#1A6B3C" }}
              >
                87%
              </p>
              <p
                className="mt-1"
                style={{
                  fontFamily: "Space Mono, monospace",
                  fontSize: "8px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#8B7355",
                }}
              >
                On Time
              </p>
            </div>
            <div className="text-center pl-2">
              <p
                className="text-xl leading-none"
                style={{ fontFamily: "DM Serif Display, serif", color: "#1A6B3C" }}
              >
                4.8t
              </p>
              <p
                className="mt-1"
                style={{
                  fontFamily: "Space Mono, monospace",
                  fontSize: "8px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "#8B7355",
                }}
              >
                CO₂ Saved
              </p>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-4">
          <p
            className="flex items-center gap-2 mb-3"
            style={{
              fontFamily: "Space Mono, monospace",
              fontSize: "9px",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "#C27A10",
            }}
          >
            <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
            Recent
          </p>

          {[
            {
              icon: "🚌",
              bg: "rgba(26,107,60,0.1)",
              title: "Rode BUS-04 · Umuahia → Aba",
              sub: "₦800 deducted · Connect Card",
              time: "2h ago",
            },
            {
              icon: "📍",
              bg: "rgba(232,148,26,0.1)",
              title: "Report submitted · AG-481923",
              sub: "Illegal dump · Isigate Junction",
              time: "1d ago",
            },
            {
              icon: "💳",
              bg: "rgba(26,107,60,0.1)",
              title: "Card topped up · ₦3,000",
              sub: "Via Paystack · Balance: ₦2,450",
              time: "2d ago",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-3"
              style={{ borderBottom: i < 2 ? "1px solid rgba(26,18,8,0.06)" : "none" }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                style={{ background: item.bg }}
              >
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
              <span
                className="flex-shrink-0"
                style={{
                  fontFamily: "Space Mono, monospace",
                  fontSize: "9px",
                  color: "#8B7355",
                }}
              >
                {item.time}
              </span>
            </div>
          ))}
        </div>

        {/* Club badge */}
        <div className="flex justify-center mt-6">
          <span
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs"
            style={{
              background: "rgba(26,107,60,0.08)",
              fontFamily: "Space Mono, monospace",
              fontSize: "8px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#1A6B3C",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: "#1A6B3C" }}
            />
            Morning Stack ICT Club · Ibeku High School
          </span>
        </div>
      </div>

      {/* Bottom Nav */}
      <BottomNav />
    </main>
  );
}