"use client";
import { useState, useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { ROUTES } from "@/lib/routesData";

interface RecentTxn {
  _id: string;
  type: "topup" | "fare";
  amount: number;
  route: string | null;
  paymentMethod: string;
  createdAt: string;
}

function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function greetingForNow(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

const MISSIONS = [
  {
    key: "move",
    icon: "🚌",
    name: "Move Green",
    sub: "AGSS · Abia Green Shuttle System",
    desc: "A professional public e-transit network — citizens ride and pay the way Bolt riders do, drivers operate from real dashboards, and the Ministry of Transport runs the network from a genuine fleet control room.",
    gradient: "linear-gradient(155deg, #0F3D22, #143D26)",
  },
  {
    key: "live",
    icon: "🌿",
    name: "Live Green",
    sub: "AEIS · Abia Environmental Intelligence System",
    desc: "State-level environmental intelligence. Every citizen is a sensor — reports are tracked to resolution with proof, not filed and forgotten, and patterns in the data become policy signals over time.",
    gradient: "linear-gradient(155deg, #1A6B3C, #0F3D22)",
  },
  {
    key: "govern",
    icon: "🏛️",
    name: "Govern Green",
    sub: "The connective layer",
    desc: "Where transport and environmental accountability meet government response — built so tomorrow's integrations plug in without rebuilding what already works today.",
    gradient: "linear-gradient(155deg, #3D2800, #42280A)",
  },
];

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const role = session?.user?.role;
  const firstName = session?.user?.name?.split(" ")[0] || "Welcome";
  const [balance, setBalance] = useState<number | null>(null);
  const [recent, setRecent] = useState<RecentTxn[]>([]);
  const [stats, setStats] = useState<{ ridesThisMonth: number; spentThisMonth: number } | null>(null);
  const [liveBusCount, setLiveBusCount] = useState<number | null>(null);
  const [reportStats, setReportStats] = useState<{ total: number; resolved: number } | null>(null);

  useEffect(() => {
    if (role === "driver") {
      router.replace("/driver");
    } else if (role === "admin" || role === "superadmin") {
      router.replace("/admin");
    }
  }, [role, router]);

  useEffect(() => {
    if (session && role === "citizen") {
      fetch("/api/user/balance")
        .then(r => r.json())
        .then(data => setBalance(data.balance ?? 0))
        .catch(() => setBalance(null));

      fetch("/api/wallet/recent")
        .then(r => r.json())
        .then(data => {
          setRecent(Array.isArray(data.recent) ? data.recent : []);
          setStats(data.stats ?? null);
        })
        .catch(() => {
          setRecent([]);
          setStats(null);
        });
    }

    fetch("/api/buses")
      .then(r => r.json())
      .then(data => setLiveBusCount(Array.isArray(data) ? data.length : null))
      .catch(() => setLiveBusCount(null));

    fetch("/api/reports/stats")
      .then(r => r.json())
      .then(data => setReportStats(data.total !== undefined ? data : null))
      .catch(() => setReportStats(null));
  }, [session, role]);

  if (status === "loading" || role === "driver" || role === "admin" || role === "superadmin") {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center"
        style={{ background: "#F7F3EC" }}>
        <div className="text-3xl mb-3">🌿</div>
        <p className="text-sm" style={{ color: "#8B7355" }}>Loading...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center px-6 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0F3D22 0%, #1A6B3C 100%)" }}>
        <div className="hero-glow" />
        <div className="w-full max-w-sm text-center relative">
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
      <div className="relative px-5 pt-12 pb-7 overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0F3D22 0%, #1A6B3C 100%)" }}>
        <div className="hero-glow" />

        <p className="text-sm mb-1 relative" style={{ color: "rgba(253,250,245,0.55)" }}>
          {greetingForNow()},
        </p>
        <h1 className="text-3xl mb-5 relative"
          style={{ fontFamily: "DM Serif Display, serif", color: "#fff", letterSpacing: "-0.01em" }}>
          {firstName} 👋
        </h1>

        {/* Connect Card — dark premium surface, gold accent, metallic sheen */}
        <div className="rounded-2xl p-5 flex items-center justify-between relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1C1108 0%, #0F3D22 55%, #1A1208 100%)",
            border: "1px solid rgba(232,148,26,0.25)",
            boxShadow: "0 12px 36px rgba(0,0,0,0.4)" }}>
          {/* Diagonal gold sheen — the signature "premium card" glint */}
          <div className="absolute inset-0" style={{
            background: "linear-gradient(115deg, transparent 40%, rgba(232,148,26,0.14) 50%, transparent 60%)" }} />
          <div className="absolute inset-0" style={{
            background: "radial-gradient(circle at 85% 100%, rgba(232,148,26,0.15), transparent 55%)" }} />

          <div className="relative">
            <p className="mb-1.5" style={{ fontFamily: "Space Mono, monospace",
              fontSize: "9px", letterSpacing: "0.14em", textTransform: "uppercase",
              color: "rgba(232,148,26,0.75)" }}>
              Connect Card Balance
            </p>
            <p className="text-4xl leading-none balance-glow"
              style={{ fontFamily: "DM Serif Display, serif", color: "#F2C94C" }}>
              {balance === null
                ? "..."
                : <>₦{balance.toLocaleString()}<span className="text-lg" style={{ color: "rgba(242,201,76,0.5)" }}>.00</span></>
              }
            </p>
            <div className="flex items-center gap-2 mt-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(232,148,26,0.2)",
                  fontFamily: "Space Mono, monospace", fontSize: "8px", color: "#90EE90" }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: "#90EE90" }} />
                Active
              </span>
              <span style={{ fontFamily: "Space Mono, monospace",
                fontSize: "9px", color: "rgba(253,250,245,0.35)" }}>
                •••• 4821
              </span>
            </div>
          </div>
          <Link href="/transport/topup">
            <div className="tile-lift px-4 h-8 rounded-lg flex items-center justify-center text-xs font-bold cursor-pointer relative"
              style={{ background: "linear-gradient(135deg, #F2C94C, #E8941A)", color: "#1A1208", fontSize: "9px",
                boxShadow: "0 4px 14px rgba(232,148,26,0.4)" }}>
              TOP UP
            </div>
          </Link>
        </div>
      </div>

      {/* ── SCROLLABLE CONTENT ── */}
      <div className="flex-1 overflow-y-auto pb-24 px-4">

        {/* Module tiles */}
        <div className="mt-5 mb-1">
          <p className="flex items-center gap-2 mb-3" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#1A6B3C" }}>
            <span className="inline-block w-3.5 h-0.5" style={{ background: "#1A6B3C" }} />
            Platform Modules
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/transport">
              <div className="tile-lift rounded-2xl p-4 flex flex-col gap-2 cursor-pointer relative overflow-hidden"
                style={{ background: "linear-gradient(155deg, #0F3D22, #143D26)",
                  boxShadow: "0 6px 20px rgba(15,61,34,0.25)" }}>
                <span className="text-2xl">🚌</span>
                <span className="font-semibold text-sm text-white"
                  style={{ fontFamily: "DM Serif Display, serif" }}>
                  Green Shuttle
                </span>
                <span className="text-xs" style={{ color: "rgba(253,250,245,0.5)" }}>
                  4 routes · {liveBusCount !== null ? `${liveBusCount} buses live` : "Live tracking"}
                </span>
                <div className="flex items-center justify-between mt-1">
                  <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                    style={{ background: "rgba(26,107,60,0.35)",
                      fontFamily: "Space Mono, monospace", fontSize: "8px", color: "#90EE90" }}>
                    <span className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ background: "#90EE90" }} />
                    Live
                  </span>
                  <span style={{ color: "rgba(253,250,245,0.4)", fontSize: "15px" }}>→</span>
                </div>
              </div>
            </Link>

            <Link href="/environment">
              <div className="tile-lift rounded-2xl p-4 flex flex-col gap-2 cursor-pointer relative overflow-hidden"
                style={{ background: "linear-gradient(155deg, #3D2800, #42280A)",
                  boxShadow: "0 6px 20px rgba(61,40,0,0.25)" }}>
                <span className="text-2xl">🌿</span>
                <span className="font-semibold text-sm text-white"
                  style={{ fontFamily: "DM Serif Display, serif" }}>
                  Environment
                </span>
                <span className="text-xs" style={{ color: "rgba(253,250,245,0.5)" }}>
                  {reportStats ? `${reportStats.total} reports filed` : "Report issues instantly"}
                </span>
                <div className="flex items-center justify-between mt-1">
                  {reportStats && (
                    <span className="px-2 py-0.5 rounded-full"
                      style={{ background: "rgba(232,148,26,0.25)",
                        fontFamily: "Space Mono, monospace", fontSize: "8px", color: "#E8941A" }}>
                      {reportStats.total > 0 ? Math.round((reportStats.resolved / reportStats.total) * 100) : 0}% resolved
                    </span>
                  )}
                  <span style={{ color: "rgba(253,250,245,0.4)", fontSize: "15px" }}>→</span>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Stats row — real, scoped to this citizen */}
        {stats && (
          <div className="rounded-2xl p-4 mt-4"
            style={{ background: "#fff", boxShadow: "0 4px 16px rgba(26,18,8,0.06)" }}>
            <p className="flex items-center gap-2 mb-3" style={{
              fontFamily: "Space Mono, monospace", fontSize: "9px",
              letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
              <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
              Your Activity This Month
            </p>
            <div className="grid grid-cols-2 divide-x divide-gray-100">
              <div className="text-center px-2">
                <p className="text-2xl leading-none"
                  style={{ fontFamily: "DM Serif Display, serif", color: "#E8941A" }}>
                  {stats.ridesThisMonth}
                </p>
                <p className="mt-1.5" style={{ fontFamily: "Space Mono, monospace",
                  fontSize: "8px", letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "#8B7355" }}>
                  Rides
                </p>
              </div>
              <div className="text-center px-2">
                <p className="text-2xl leading-none"
                  style={{ fontFamily: "DM Serif Display, serif", color: "#1A6B3C" }}>
                  ₦{stats.spentThisMonth.toLocaleString()}
                </p>
                <p className="mt-1.5" style={{ fontFamily: "Space Mono, monospace",
                  fontSize: "8px", letterSpacing: "0.08em",
                  textTransform: "uppercase", color: "#8B7355" }}>
                  Spent
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activity — real Transaction history */}
        <div className="mt-5">
          <p className="flex items-center gap-2 mb-3" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10" }}>
            <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
            Recent
          </p>
          {recent.length === 0 ? (
            <div className="rounded-2xl p-5 text-center"
              style={{ background: "#fff", boxShadow: "0 2px 8px rgba(26,18,8,0.05)" }}>
              <p className="text-xs" style={{ color: "#8B7355" }}>
                No activity yet — take your first ride or top up your card.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "#fff", boxShadow: "0 4px 16px rgba(26,18,8,0.05)" }}>
              {recent.map((txn, i) => {
                const routeInfo = txn.route ? ROUTES[txn.route] : null;
                const isFare = txn.type === "fare";
                return (
                  <div key={txn._id} className="flex items-center gap-3 px-4 py-3.5"
                    style={{ borderBottom: i < recent.length - 1 ? "1px solid rgba(26,18,8,0.06)" : "none" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: isFare ? "rgba(26,107,60,0.1)" : "rgba(232,148,26,0.1)" }}>
                      {isFare ? "🚌" : "💳"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold truncate" style={{ color: "#1A1208" }}>
                        {isFare
                          ? `Fare paid${routeInfo ? ` · ${routeInfo.name}` : ""}`
                          : "Card topped up"}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#8B7355" }}>
                        ₦{txn.amount.toLocaleString()} · {isFare ? "Connect Card" : txn.paymentMethod}
                      </p>
                    </div>
                    <span className="flex-shrink-0" style={{
                      fontFamily: "Space Mono, monospace", fontSize: "9px", color: "#8B7355" }}>
                      {formatRelativeTime(txn.createdAt)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── VISION SECTION — landing-page style ── */}
        <div className="mt-8 -mx-4 px-4 py-8 relative overflow-hidden"
          style={{ background: "linear-gradient(180deg, #0F3D22 0%, #1A2E1F 100%)" }}>
          <div className="hero-glow" />

          <div className="relative text-center mb-6">
            <p style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
              letterSpacing: "0.16em", textTransform: "uppercase", color: "#E8941A" }}>
              The Vision
            </p>
            <h2 className="mt-2 mb-3" style={{
              fontFamily: "DM Serif Display, serif", fontSize: "26px",
              lineHeight: 1.25, color: "#fff" }}>
              The Operating System<br />of a Green State
            </h2>
            <p className="text-xs px-2 leading-relaxed" style={{ color: "rgba(253,250,245,0.65)" }}>
              Denmark and Switzerland aren&apos;t green because of one policy —
              they&apos;re green because clean transport, environmental accountability,
              and citizen participation run on shared infrastructure.
              Abia Green is that infrastructure for Abia State.
            </p>
          </div>

          <div className="flex flex-col gap-3 relative">
            {MISSIONS.map((m, i) => (
              <div key={m.key} className="vision-card rounded-2xl p-4"
                style={{ background: m.gradient, animationDelay: `${i * 0.12}s`,
                  boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
                  border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{m.icon}</span>
                  <div>
                    <p className="text-sm font-bold text-white"
                      style={{ fontFamily: "DM Serif Display, serif" }}>
                      {m.name}
                    </p>
                    <p className="mb-2" style={{ fontFamily: "Space Mono, monospace",
                      fontSize: "8px", letterSpacing: "0.06em",
                      textTransform: "uppercase", color: "rgba(253,250,245,0.5)" }}>
                      {m.sub}
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "rgba(253,250,245,0.75)" }}>
                      {m.desc}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative text-center mt-6 pt-5"
            style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            <p className="text-xs italic leading-relaxed px-2" style={{ color: "rgba(253,250,245,0.5)" }}>
              &ldquo;Built by young Abians, for the Abia State they want to live in.&rdquo;
            </p>
          </div>
        </div>

        {/* Club badge */}
        <div className="flex justify-center mt-5 mb-2">
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