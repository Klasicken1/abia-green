"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const loading = status === "loading";

  if (loading) {
    return (
      <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-3xl mb-3">🌿</div>
            <p className="text-sm" style={{ color: "#8B7355" }}>Loading...</p>
          </div>
        </div>
        <BottomNav />
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>

      {/* Header */}
      <div className="px-5 pt-12 pb-6" style={{ background: "#0F3D22" }}>
        <div className="flex items-center gap-4">
          {session?.user?.image ? (
            <img src={session.user.image ?? ""} alt="Profile"
  className="w-14 h-14 rounded-full border-2"
  referrerPolicy="no-referrer"
  style={{ borderColor: "rgba(255,255,255,0.2)" }} />
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
              style={{ background: "rgba(255,255,255,0.15)" }}>
              👤
            </div>
          )}
          <div>
            <h1 className="text-xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
              {session?.user?.name || "Abia Resident"}
            </h1>
            <p className="text-xs mt-0.5" style={{
              color: "rgba(253,250,245,0.5)", fontFamily: "Space Mono, monospace" }}>
              {session?.user?.email || "Sign in to access your account"}
            </p>
            {session && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-xs"
                style={{ background: "rgba(26,107,60,0.3)", color: "#90EE90",
                  fontFamily: "Space Mono, monospace", fontSize: "9px" }}>
                ● Signed in
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-24">

        {session ? (
          <>
            {/* Signed in menu */}
            <div className="rounded-xl overflow-hidden mb-4"
              style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
              {[
                { icon: "💳", label: "My Connect Card",  href: "/transport" },
                { icon: "🧭", label: "My Journeys",      href: "/journeys" },
                { icon: "📋", label: "My Reports",       href: "/environment" },
                { icon: "🗺️", label: "Track a Report",   href: "/environment" },
                { icon: "🔔", label: "Notifications",    href: "#" },
              ].map((item, i) => (
                <Link key={i} href={item.href}>
                  <div className="flex items-center gap-3 px-4 py-3.5"
                    style={{ borderBottom: i < 4 ? "1px solid rgba(26,18,8,0.06)" : "none" }}>
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium flex-1" style={{ color: "#1A1208" }}>
                      {item.label}
                    </span>
                    <span style={{ color: "#8B7355" }}>→</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Connect Card */}
            <div className="rounded-xl p-4 mb-4" style={{ background: "#0F3D22" }}>
              <p style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
                letterSpacing: "0.1em", textTransform: "uppercase",
                color: "rgba(255,255,255,0.5)", marginBottom: "4px" }}>
                Connect Card Balance
              </p>
              <p className="text-2xl" style={{ fontFamily: "DM Serif Display, serif", color: "#E8941A" }}>
                ₦2,450.00
              </p>
              <p className="text-xs mt-1 mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                •••• 4821 · Active
              </p>
              <Link href="/transport">
                <button className="px-4 py-2 rounded-lg text-xs font-bold"
                  style={{ background: "#E8941A", color: "#fff" }}>
                  Top Up Card
                </button>
              </Link>
            </div>

            {/* Sign out */}
            <button onClick={() => signOut({ callbackUrl: "/" })}
              className="w-full py-3.5 rounded-xl text-sm font-semibold"
              style={{ background: "transparent", color: "#C0392B",
                border: "1.5px solid rgba(192,57,43,0.2)" }}>
              Sign Out
            </button>
          </>
        ) : (
          <>
            {/* Not signed in */}
            <div className="rounded-xl overflow-hidden mb-4"
              style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
              {[
                { icon: "💳", label: "My Connect Card" },
                { icon: "📋", label: "My Reports" },
                { icon: "🔔", label: "Notifications" },
                { icon: "🗺️", label: "My LGA" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3.5"
                  style={{ borderBottom: i < 3 ? "1px solid rgba(26,18,8,0.06)" : "none",
                    opacity: 0.5 }}>
                  <span className="text-lg">{item.icon}</span>
                  <span className="text-sm font-medium flex-1" style={{ color: "#1A1208" }}>
                    {item.label}
                  </span>
                  <span style={{ color: "#8B7355" }}>→</span>
                </div>
              ))}
            </div>

            <button onClick={() => signIn("google", { callbackUrl: "/profile" })}
              className="w-full py-4 rounded-xl text-sm font-bold flex items-center justify-center gap-3 mb-3"
              style={{ background: "#fff", border: "1.5px solid rgba(26,18,8,0.12)",
                color: "#1A1208", boxShadow: "0 2px 12px rgba(26,18,8,0.06)" }}></button>