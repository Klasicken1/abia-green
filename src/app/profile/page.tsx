import BottomNav from "@/components/BottomNav";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>
      <div className="px-5 pt-12 pb-6" style={{ background: "#0F3D22" }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
            style={{ background: "rgba(255,255,255,0.15)" }}>
            👤
          </div>
          <div>
            <h1 className="text-xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
              Abia Resident
            </h1>
            <p className="text-xs mt-0.5" style={{
              color: "rgba(253,250,245,0.5)", fontFamily: "Space Mono, monospace"
            }}>
              Sign in to access your account
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 pt-4 pb-24">
        <div className="rounded-xl overflow-hidden mb-4"
          style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
          {[
            { icon: "💳", label: "My Connect Card" },
            { icon: "📋", label: "My Reports" },
            { icon: "🔔", label: "Notifications" },
            { icon: "🗺️", label: "My LGA" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5"
              style={{ borderBottom: i < 3 ? "1px solid rgba(26,18,8,0.06)" : "none" }}>
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm font-medium flex-1" style={{ color: "#1A1208" }}>
                {item.label}
              </span>
              <span style={{ color: "#8B7355" }}>→</span>
            </div>
          ))}
        </div>

        <button className="w-full py-3.5 rounded-xl text-sm font-bold"
          style={{ background: "#1A6B3C", color: "#fff" }}>
          Sign In / Create Account
        </button>

        <p className="text-center mt-4 text-xs" style={{
          fontFamily: "Space Mono, monospace", color: "#8B7355",
          fontSize: "8px", letterSpacing: "0.08em"
        }}>
          MORNING STACK ICT CLUB · IBEKU HIGH SCHOOL
        </p>
      </div>

      <BottomNav />
    </main>
  );
}