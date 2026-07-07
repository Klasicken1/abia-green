"use client";
import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-col min-h-screen items-center justify-center px-4"
      style={{ background: "#F7F3EC" }}>
      <div className="text-center max-w-xs">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl mb-2"
          style={{ fontFamily: "DM Serif Display, serif", color: "#1A1208" }}>
          Something went wrong
        </h1>
        <p className="text-sm mb-6" style={{ color: "#8B7355", lineHeight: "1.6" }}>
          An unexpected error occurred. Please try again or go back to the home screen.
        </p>
        <div className="flex flex-col gap-3">
          <button onClick={reset}
            className="w-full py-3.5 rounded-xl text-sm font-bold"
            style={{ background: "#1A6B3C", color: "#fff" }}>
            Try Again
          </button>
          <Link href="/">
            <button className="w-full py-3.5 rounded-xl text-sm font-semibold"
              style={{ background: "transparent", color: "#1A6B3C",
                border: "1.5px solid rgba(26,107,60,0.25)" }}>
              Back to Home
            </button>
          </Link>
        </div>
        <p className="mt-6 text-xs" style={{
          fontFamily: "Space Mono, monospace", color: "#8B7355",
          fontSize: "8px", letterSpacing: "0.08em" }}>
          ABIA GREEN · MORNING STACK ICT CLUB
        </p>
      </div>
    </main>
  );
}