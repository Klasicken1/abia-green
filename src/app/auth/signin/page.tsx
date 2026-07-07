"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");

  async function handleGoogle() {
    setLoading(true);
    await signIn("google", { callbackUrl: "/" });
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    await signIn("credentials", { email, password, callbackUrl: "/" });
    setLoading(false);
  }

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>
      <div className="px-5 pt-12 pb-8 text-center" style={{ background: "#0F3D22" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl mx-auto mb-4"
          style={{ background: "rgba(255,255,255,0.1)" }}>
          🌿
        </div>
        <h1 className="text-2xl text-white mb-1"
          style={{ fontFamily: "DM Serif Display, serif" }}>
          Welcome to Abia Green
        </h1>
        <p className="text-xs" style={{ color: "rgba(253,250,245,0.5)" }}>
          Sign in to access your Connect Card and reports
        </p>
      </div>

      <div className="flex-1 px-4 pt-6 pb-8">

        {/* Google Sign In */}
        <button onClick={handleGoogle} disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-xl mb-4 font-semibold text-sm"
          style={{ background: "#fff", border: "1.5px solid rgba(26,18,8,0.12)",
            color: "#1A1208", boxShadow: "0 2px 12px rgba(26,18,8,0.06)" }}>
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.01c-.72.48-1.63.77-2.7.77-2.08 0-3.84-1.4-4.47-3.29H1.85v2.07A8 8 0 0 0 8.98 17z"/>
            <path fill="#FBBC05" d="M4.51 10.53c-.16-.48-.25-.99-.25-1.53s.09-1.05.25-1.53V5.4H1.85A8 8 0 0 0 .98 9c0 1.29.31 2.51.87 3.6l2.66-2.07z"/>
            <path fill="#EA4335" d="M8.98 3.58c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 .87 5.4L3.53 7.47c.63-1.89 2.39-3.89 5.45-3.89z"/>
          </svg>
          {loading ? "Signing in..." : "Continue with Google"}
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: "rgba(26,18,8,0.1)" }} />
          <span className="text-xs" style={{ color: "#8B7355",
            fontFamily: "Space Mono, monospace" }}>OR</span>
          <div className="flex-1 h-px" style={{ background: "rgba(26,18,8,0.1)" }} />
        </div>

        {/* Email Sign In */}
        <form onSubmit={handleEmail}>
          <p className="text-xs mb-1" style={{ fontFamily: "Space Mono, monospace",
            fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase",
            color: "#8B7355" }}>
            Email
          </p>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="your@email.com" required
            className="w-full p-3 rounded-xl text-sm mb-3"
            style={{ background: "#fff", border: "1.5px solid rgba(26,18,8,0.12)",
              color: "#1A1208", fontFamily: "Inter, sans-serif", outline: "none" }} />

          <p className="text-xs mb-1" style={{ fontFamily: "Space Mono, monospace",
            fontSize: "9px", letterSpacing: "0.1em", textTransform: "uppercase",
            color: "#8B7355" }}>
            Password
          </p>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="••••••••" required
            className="w-full p-3 rounded-xl text-sm mb-4"
            style={{ background: "#fff", border: "1.5px solid rgba(26,18,8,0.12)",
              color: "#1A1208", fontFamily: "Inter, sans-serif", outline: "none" }} />

          <button type="submit" disabled={loading}
            className="w-full py-4 rounded-xl text-sm font-bold mb-3"
            style={{ background: "#1A6B3C", color: "#fff" }}>
            {loading ? "Signing in..." : "Sign In with Email"}
          </button>
        </form>

        <p className="text-center text-xs" style={{ color: "#8B7355" }}>
          Government staff? Use your{" "}
          <span style={{ color: "#1A6B3C", fontWeight: 600 }}>
            @abiastate.gov.ng
          </span>{" "}
          email for admin access.
        </p>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs" style={{ color: "#8B7355" }}>
            ← Back to Abia Green
          </Link>
        </div>
      </div>
    </main>
  );
}