"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import jsQR from "jsqr";
import BottomNav from "@/components/BottomNav";

interface BusInfo {
  _id: string;
  busId: string;
  routeLabel: string;
  status: string;
  fare: string | null;
}

type ScanState = "scanning" | "confirming" | "charging" | "success" | "error";

export default function ScanPage() {
  const { data: session, status } = useSession();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const [scanState, setScanState] = useState<ScanState>("scanning");
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [busInfo, setBusInfo] = useState<BusInfo | null>(null);
  const [chargeError, setChargeError] = useState<string | null>(null);
  const [chargeResult, setChargeResult] = useState<{ balance: number; reference: string; fare: number } | null>(null);

  const scanLoop = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== video.HAVE_ENOUGH_DATA) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      rafRef.current = requestAnimationFrame(scanLoop);
      return;
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code && code.data.startsWith("abiagreen:bus:")) {
      const busId = code.data.replace("abiagreen:bus:", "");
      handleScanned(busId);
      return; // stop the loop, we found a valid code
    }

    rafRef.current = requestAnimationFrame(scanLoop);
  }, []);

  useEffect(() => {
    if (scanState !== "scanning" || !session) return;

    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then(stream => {
        if (cancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
        rafRef.current = requestAnimationFrame(scanLoop);
      })
      .catch(() => {
        setCameraError("Camera access denied or unavailable. Allow camera permissions and reload.");
      });

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, [scanState, session, scanLoop]);

  async function handleScanned(busId: string) {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());

    try {
      const res = await fetch(`/api/buses/${busId}`);
      const data = await res.json();
      if (!res.ok) {
        setChargeError(data.error || "Could not find that bus");
        setScanState("error");
        return;
      }
      if (data.status !== "on_route") {
        setChargeError("This bus is not currently on a trip.");
        setScanState("error");
        return;
      }
      setBusInfo(data);
      setScanState("confirming");
    } catch {
      setChargeError("Failed to look up bus. Check your connection and try again.");
      setScanState("error");
    }
  }

  async function confirmPay() {
    if (!busInfo) return;
    setScanState("charging");
    setChargeError(null);
    try {
      const res = await fetch("/api/wallet/charge-fare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busId: busInfo._id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setChargeError(data.error || "Payment failed");
        setScanState("confirming");
        return;
      }
      setChargeResult(data);
      setScanState("success");
    } catch {
      setChargeError("Payment failed. Check your connection and try again.");
      setScanState("confirming");
    }
  }

  function rescan() {
    setBusInfo(null);
    setChargeError(null);
    setChargeResult(null);
    setScanState("scanning");
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
          <div className="text-4xl mb-4">📷</div>
          <h1 className="text-2xl mb-2" style={{ fontFamily: "DM Serif Display, serif", color: "#1A1208" }}>
            Sign In to Pay
          </h1>
          <p className="text-sm mb-6" style={{ color: "#8B7355" }}>
            Sign in to scan a bus and pay your fare with your Connect Card.
          </p>
          <Link href="/auth/signin">
            <button className="w-full px-6 py-3.5 rounded-xl text-sm font-bold"
              style={{ background: "#1A6B3C", color: "#fff" }}>
              Sign In
            </button>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#0F3D22" }}>
      <div className="px-5 pt-12 pb-4">
        <Link href="/transport" className="text-xs mb-2 flex items-center gap-1"
          style={{ color: "rgba(253,250,245,0.5)", fontFamily: "Space Mono, monospace" }}>
          ← Back
        </Link>
        <h1 className="text-xl text-white text-center" style={{ fontFamily: "DM Serif Display, serif" }}>
          {scanState === "scanning" && "Scan Bus QR to Pay"}
          {scanState === "confirming" && "Confirm Fare"}
          {scanState === "charging" && "Processing…"}
          {scanState === "success" && "Payment Successful"}
          {scanState === "error" && "Scan Failed"}
        </h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-24">

        {scanState === "scanning" && (
          <>
            {cameraError ? (
              <p className="text-sm text-center" style={{ color: "#E8941A" }}>{cameraError}</p>
            ) : (
              <div className="w-full max-w-xs rounded-2xl overflow-hidden" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.3)" }}>
                <video ref={videoRef} playsInline muted className="w-full h-auto" />
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}
            <p className="text-xs text-center mt-4 max-w-xs" style={{ color: "rgba(253,250,245,0.5)" }}>
              Point your camera at the QR code shown on the driver's dashboard.
            </p>
          </>
        )}

        {scanState === "confirming" && busInfo && (
          <div className="w-full max-w-xs bg-white rounded-2xl p-5">
            <p className="text-xs mb-1" style={{ fontFamily: "Space Mono, monospace", fontSize: "9px",
              letterSpacing: "0.1em", textTransform: "uppercase", color: "#8B7355" }}>
              {busInfo.busId}
            </p>
            <p className="text-lg font-bold mb-4" style={{ color: "#1A1208" }}>
              {busInfo.routeLabel}
            </p>
            <div className="flex justify-between items-center mb-4 pb-4" style={{ borderBottom: "1px solid rgba(26,18,8,0.08)" }}>
              <span className="text-sm" style={{ color: "#8B7355" }}>Fare</span>
              <span className="text-2xl" style={{ fontFamily: "DM Serif Display, serif", color: "#E8941A" }}>
                {busInfo.fare}
              </span>
            </div>
            {chargeError && (
              <p className="text-xs mb-3" style={{ color: "#C0392B" }}>{chargeError}</p>
            )}
            <button onClick={confirmPay}
              className="w-full py-3.5 rounded-xl text-sm font-bold mb-2"
              style={{ background: "#1A6B3C", color: "#fff" }}>
              Confirm & Pay
            </button>
            <button onClick={rescan}
              className="w-full py-3 rounded-xl text-sm font-semibold"
              style={{ background: "transparent", color: "#8B7355" }}>
              Cancel
            </button>
          </div>
        )}

        {scanState === "charging" && (
          <div className="text-3xl">⏳</div>
        )}

        {scanState === "success" && chargeResult && (
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 text-center">
            <div className="text-4xl mb-3">✅</div>
            <p className="text-2xl mb-1" style={{ fontFamily: "DM Serif Display, serif", color: "#1A6B3C" }}>
              ₦{chargeResult.fare.toLocaleString()}
            </p>
            <p className="text-xs mb-4" style={{ color: "#8B7355" }}>
              Ref: {chargeResult.reference} · New balance: ₦{chargeResult.balance.toLocaleString()}
            </p>
            <Link href="/transport">
              <button className="w-full py-3 rounded-xl text-sm font-bold"
                style={{ background: "#1A6B3C", color: "#fff" }}>
                Done
              </button>
            </Link>
          </div>
        )}

        {scanState === "error" && (
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 text-center">
            <p className="text-sm mb-4" style={{ color: "#C0392B" }}>{chargeError}</p>
            <button onClick={rescan}
              className="w-full py-3 rounded-xl text-sm font-bold"
              style={{ background: "#1A6B3C", color: "#fff" }}>
              Try Again
            </button>
          </div>
        )}
      </div>

      <BottomNav />
    </main>
  );
}