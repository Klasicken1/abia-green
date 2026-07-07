import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-col min-h-screen items-center justify-center px-4"
      style={{ background: "#F7F3EC" }}>
      <div className="text-center max-w-xs">
        <div className="text-5xl mb-4">🔍</div>
        <h1 className="text-2xl mb-2"
          style={{ fontFamily: "DM Serif Display, serif", color: "#1A1208" }}>
          Page Not Found
        </h1>
        <p className="text-sm mb-6" style={{ color: "#8B7355", lineHeight: "1.6" }}>
          The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <button className="w-full py-3.5 rounded-xl text-sm font-bold"
            style={{ background: "#1A6B3C", color: "#fff" }}>
            Back to Home
          </button>
        </Link>
        <p className="mt-6 text-xs" style={{
          fontFamily: "Space Mono, monospace", color: "#8B7355",
          fontSize: "8px", letterSpacing: "0.08em" }}>
          ABIA GREEN · MORNING STACK ICT CLUB
        </p>
      </div>
    </main>
  );
}