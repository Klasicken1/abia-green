"use client";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import Link from "next/link";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === "loading";
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    if (session && !session.user?.role) {
      router.push("/select-role");
    }
  }, [session, router]);

  useEffect(() => {
    if (session) {
      fetch("/api/user/balance")
        .then(r => r.json())
        .then(data => setBalance(data.balance ?? 0))
        .catch(() => setBalance(0));
    }
  }, [session]);

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
                ● Signed in {session.user?.role ? `· ${session.user.role}` : ""}
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
                {balance === null ? "..." : `₦${balance.toLocaleString()}.00`}
              </p>
              <p className="text-xs mt-1 mb-3" style={{ color: "rgba(255,255,255,0.4)" }}>
                •••• 4821 · Active
              </p>
              <Link href="/transport/topup">
                <button className="px-4 py-2 rounded-lg text-xs font-bold"
                  style={{ background: "#E8941A", color: "#fff" }}>
                  Top Up Card
                </button>
              </Link>
            </div>

            {/* Sign out */}
            <button onClick={() => signOut({ callbackUrl: "/auth/signin" })}
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
                color: "#1A1208", boxShadow: "0 2px 12px rgba(26,18,8,0.06)" }}>
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
                style={{ background: "#1A6B3C", color: "#fff" }}>
                Sign In with Email
              </button>
            </Link>
          </>
        )}

        <p className="text-center mt-4 text-xs" style={{
          fontFamily: "Space Mono, monospace", color: "#8B7355",
          fontSize: "8px", letterSpacing: "0.08em" }}>
          MORNING STACK ICT CLUB · IBEKU HIGH SCHOOL
        </p>
      </div>

      <BottomNav />
    </main>
  );
}