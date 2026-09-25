"use client";
import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import QRCode from "qrcode";

interface Bus {
  _id: string;
  busId: string;
  route: string;
  routeLabel: string;
  status: "idle" | "on_route";
}

export default function DriverQRPage() {
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const [bus, setBus] = useState<Bus | null>(null);
  const [loading, setLoading] = useState(true);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (session && role === "driver") {
      fetch("/api/buses/mine")
        .then(r => (r.ok ? r.json() : null))
        .then(data => setBus(data))
        .catch(() => setBus(null))
        .finally(() => setLoading(false));
    } else if (status !== "loading") {
      setLoading(false);
    }
  }, [session, role, status]);

  useEffect(() => {
    if (bus?._id && bus.status === "on_route") {
      // The QR encodes only the bus's Mongo _id, prefixed so the scanner
      // can validate it's an Abia Green code before doing anything with it.
      const payload = `abiagreen:bus:${bus._id}`;
      QRCode.toDataURL(payload, {
        width: 600,
        margin: 2,
        color: { dark: "#0F3D22", light: "#FFFFFF" },
      })
        .then(setQrDataUrl)
        .catch(() => setQrDataUrl(null));
    }
  }, [bus]);

  if (status === "loading" || loading) {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center"
        style={{ background: "#F7F3EC" }}>
        <div className="text-3xl mb-3">⏳</div>
        <p className="text-sm" style={{ color: "#8B7355" }}>Loading...</p>
      </main>
    );
  }

  if (!session || role !== "driver") {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center px-4"
        style={{ background: "#F7F3EC" }}>
        <div className="text-center max-w-xs">
          <div className="text-4xl mb-4">🚫</div>
          <h1 className="text-2xl mb-2"
            style={{ fontFamily: "DM Serif Display, serif", color: "#1A1208" }}>
            Restricted
          </h1>
          <Link href="/">
            <button className="w-full px-6 py-3.5 rounded-xl text-sm font-bold mt-4"
              style={{ background: "#1A6B3C", color: "#fff" }}>
              Back to Home
            </button>
          </Link>
        </div>
      </main>
    );
  }

  if (!bus || bus.status !== "on_route") {
    return (
      <main className="flex flex-col min-h-screen items-center justify-center px-4"
        style={{ background: "#F7F3EC" }}>
        <div className="text-center max-w-xs">
          <div className="text-4xl mb-4">🚌</div>
          <h1 className="text-xl mb-2"
            style={{ fontFamily: "DM Serif Display, serif", color: "#1A1208" }}>
            No Active Trip
          </h1>
          <p className="text-sm mb-6" style={{ color: "#8B7355" }}>
            Start a trip from your dashboard before displaying the boarding QR code.
          </p>
          <Link href="/driver">
            <button className="w-full px-6 py-3.5 rounded-xl text-sm font-bold"
              style={{ background: "#1A6B3C", color: "#fff" }}>
              Go to Dashboard
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen items-center justify-center px-6 py-10"
      style={{ background: "#0F3D22" }}>
      <Link href="/driver/route" className="absolute top-6 left-6 text-xs flex items-center gap-1"
        style={{ color: "rgba(253,250,245,0.5)", fontFamily: "Space Mono, monospace" }}>
        ← Back
      </Link>

      <p className="text-xs mb-1 text-center" style={{
        fontFamily: "Space Mono, monospace", letterSpacing: "0.14em",
        textTransform: "uppercase", color: "rgba(232,148,26,0.8)" }}>
        {bus.busId} · {bus.routeLabel}
      </p>
      <h1 className="text-2xl text-white mb-6 text-center"
        style={{ fontFamily: "DM Serif Display, serif" }}>
        Scan to Board
      </h1>

      <div className="bg-white rounded-2xl p-6" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
        {qrDataUrl ? (
          <img src={qrDataUrl} alt="Boarding QR code" className="w-64 h-64" />
        ) : (
          <div className="w-64 h-64 flex items-center justify-center">
            <span className="text-sm" style={{ color: "#8B7355" }}>Generating code…</span>
          </div>
        )}
      </div>

      <p className="text-xs mt-6 text-center max-w-xs" style={{ color: "rgba(253,250,245,0.5)" }}>
        Passengers scan this code with the Abia Green app to pay their fare automatically.
      </p>

      <canvas ref={canvasRef} className="hidden" />
    </main>
  );
}