"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import {
  isPushSupported,
  getPushPermissionState,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/push-client";

export default function NotificationsPage() {
  const { data: session, status } = useSession();

  const [supported, setSupported] = useState<boolean | null>(null);
  const [permission, setPermission] = useState<NotificationPermission | "unsupported" | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setSupported(isPushSupported());
    getPushPermissionState().then(setPermission);
  }, []);

  async function handleEnable() {
    setLoading(true);
    setError(null);
    const result = await subscribeToPush();
    if (!result.ok) {
      setError(result.error || "Failed to enable notifications.");
    } else {
      setPermission("granted");
    }
    setLoading(false);
  }

  async function handleDisable() {
    setLoading(true);
    setError(null);
    const result = await unsubscribeFromPush();
    if (!result.ok) {
      setError(result.error || "Failed to disable notifications.");
    } else {
      setPermission(await getPushPermissionState());
    }
    setLoading(false);
  }

  if (status === "loading") {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center" style={{ background: "#F7F3EC" }}>
        <p className="text-sm" style={{ color: "#8B7355" }}>Loading...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center px-4" style={{ background: "#F7F3EC" }}>
        <div className="text-center max-w-xs">
          <h1 className="text-xl mb-2" style={{ fontFamily: "DM Serif Display, serif", color: "#1A1208" }}>
            Sign In Required
          </h1>
          <Link href="/auth/signin">
            <button className="w-full px-6 py-3.5 rounded-xl text-sm font-bold mt-4"
              style={{ background: "#1A6B3C", color: "#fff" }}>
              Sign In
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>
      <div className="px-5 pt-12 pb-6" style={{ background: "#0F3D22" }}>
        <Link href="/profile" className="text-xs mb-3 flex items-center gap-1"
          style={{ color: "rgba(253,250,245,0.5)", fontFamily: "Space Mono, monospace" }}>
          ← Back
        </Link>
        <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          Notifications
        </h1>
        <p className="text-xs mt-1" style={{ color: "rgba(253,250,245,0.45)" }}>
          Get alerts even when the app is closed
        </p>
      </div>

      <div className="flex-1 px-4 pt-6 pb-24">

        {supported === false && (
          <div className="rounded-xl p-4 mb-4" style={{ background: "rgba(232,148,26,0.1)", border: "1px solid rgba(232,148,26,0.3)" }}>
            <p className="text-sm font-semibold mb-1" style={{ color: "#C27A10" }}>Not supported here</p>
            <p className="text-xs" style={{ color: "#8B7355" }}>
              Push notifications aren&apos;t supported on this browser. On iPhone, install Abia Green to your
              Home Screen first (Share → Add to Home Screen), then try again from the installed app.
            </p>
          </div>
        )}

        {supported && (
          <div className="rounded-xl p-5 mb-4" style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🔔</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1A1208" }}>
                  Push Notifications
                </p>
                <p className="text-xs" style={{ color: "#8B7355" }}>
                  {permission === "granted" ? "Enabled on this device" : "Not enabled on this device"}
                </p>
              </div>
            </div>

            {error && (
              <p className="text-xs mb-3" style={{ color: "#C0392B" }}>{error}</p>
            )}

            {permission === "granted" ? (
              <button onClick={handleDisable} disabled={loading}
                className="w-full py-3 rounded-xl text-sm font-bold"
                style={{ background: "transparent", color: "#C0392B", border: "1.5px solid rgba(192,57,43,0.25)" }}>
                {loading ? "..." : "Disable Notifications"}
              </button>
            ) : (
              <button onClick={handleEnable} disabled={loading || permission === "denied"}
                className="w-full py-3 rounded-xl text-sm font-bold"
                style={{ background: permission === "denied" ? "rgba(26,107,60,0.4)" : "#1A6B3C", color: "#fff" }}>
                {loading ? "..." : permission === "denied" ? "Blocked in Browser Settings" : "Enable Notifications"}
              </button>
            )}

            {permission === "denied" && (
              <p className="text-xs mt-3" style={{ color: "#8B7355" }}>
                You&apos;ve blocked notifications for this site. Re-enable them in your browser&apos;s site settings to continue.
              </p>
            )}
          </div>
        )}

        <div className="rounded-xl p-4" style={{ background: "rgba(26,107,60,0.06)", border: "1px solid rgba(26,107,60,0.15)" }}>
          <p className="text-xs font-semibold mb-2" style={{ color: "#1A6B3C" }}>What you&apos;ll be notified about</p>
          <ul className="text-xs space-y-1" style={{ color: "#8B7355" }}>
            <li>• Updates on reports you&apos;ve submitted</li>
            <li>• Your incident reports being reviewed or resolved</li>
            <li>• Service disruption alerts on routes you use</li>
          </ul>
        </div>
      </div>

      <BottomNav />
    </main>
  );
}