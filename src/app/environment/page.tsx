import BottomNav from "@/components/BottomNav";
import Link from "next/link";

export default function EnvironmentPage() {
  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#F7F3EC" }}>

      {/* Header */}
      <div className="px-5 pt-12 pb-5" style={{ background: "#3D2800" }}>
        <Link href="/" className="text-xs mb-3 flex items-center gap-1"
          style={{ color: "rgba(253,250,245,0.5)", fontFamily: "Space Mono, monospace" }}>
          ← Back
        </Link>
        <p className="text-xs mb-1" style={{
          fontFamily: "Space Mono, monospace", letterSpacing: "0.12em",
          textTransform: "uppercase", color: "rgba(232,148,26,0.8)"
        }}>
          Platform 02 · Environment
        </p>
        <h1 className="text-2xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
          Environmental Intelligence
        </h1>
        <p className="text-xs mt-1" style={{ color: "rgba(253,250,245,0.45)" }}>
          527 reports filed · 71% resolved · 17 LGAs
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 px-4 pt-4">

        {/* Report types */}
        <p className="flex items-center gap-2 mb-3" style={{
          fontFamily: "Space Mono, monospace", fontSize: "9px",
          letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10"
        }}>
          <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
          Submit a Report
        </p>

        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { icon: "🗑️", name: "Illegal Dump",     color: "#C0392B" },
            { icon: "🏔️", name: "Erosion",          color: "#E8941A" },
            { icon: "🌊", name: "Flooding",          color: "#2471A3" },
            { icon: "🌳", name: "Illegal Logging",   color: "#1A6B3C" },
          ].map((type, i) => (
            <div key={i} className="p-3 rounded-xl flex items-center gap-3 cursor-pointer"
              style={{ background: "#fff", border: "1.5px solid rgba(26,18,8,0.08)",
                boxShadow: "0 2px 8px rgba(26,18,8,0.04)" }}>
              <span className="text-xl">{type.icon}</span>
              <span className="text-xs font-semibold" style={{ color: "#1A1208" }}>
                {type.name}
              </span>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="rounded-xl p-4 mb-4"
          style={{ background: "#fff", boxShadow: "0 2px 12px rgba(26,18,8,0.05)" }}>
          <p className="flex items-center gap-2 mb-3" style={{
            fontFamily: "Space Mono, monospace", fontSize: "9px",
            letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10"
          }}>
            <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
            2025 Overview
          </p>
          <div className="grid grid-cols-3 text-center">
            {[
              { val: "527", lbl: "Reports" },
              { val: "71%", lbl: "Resolved" },
              { val: "47",  lbl: "Erosion Sites" },
            ].map((s, i) => (
              <div key={i} className={i < 2 ? "border-r" : ""}
                style={{ borderColor: "rgba(26,18,8,0.06)" }}>
                <p className="text-lg" style={{
                  fontFamily: "DM Serif Display, serif", color: "#E8941A"
                }}>
                  {s.val}
                </p>
                <p className="text-xs mt-0.5" style={{
                  fontFamily: "Space Mono, monospace", fontSize: "8px",
                  textTransform: "uppercase", color: "#8B7355"
                }}>
                  {s.lbl}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent reports */}
        <p className="flex items-center gap-2 mb-3" style={{
          fontFamily: "Space Mono, monospace", fontSize: "9px",
          letterSpacing: "0.14em", textTransform: "uppercase", color: "#C27A10"
        }}>
          <span className="inline-block w-3.5 h-0.5" style={{ background: "#C27A10" }} />
          Recent Reports
        </p>

        {[
          { id: "AG-481923", type: "Illegal Dump",  lga: "Umuahia North", status: "In Progress", color: "#E8941A" },
          { id: "AG-481891", type: "Erosion",       lga: "Isuikwuato",    status: "Pending",     color: "#C0392B" },
          { id: "AG-481850", type: "Flooding",      lga: "Aba South",     status: "Resolved",    color: "#1A6B3C" },
        ].map((r, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl mb-2"
            style={{ background: "#fff", boxShadow: "0 2px 8px rgba(26,18,8,0.04)" }}>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5">
                <p className="text-xs font-semibold" style={{ color: "#1A1208" }}>
                  {r.type}
                </p>
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: `${r.color}15`, color: r.color,
                    fontFamily: "Space Mono, monospace", fontSize: "8px" }}>
                  {r.status}
                </span>
              </div>
              <p className="text-xs" style={{ color: "#8B7355" }}>
                {r.lga}
              </p>
            </div>
            <p style={{
              fontFamily: "Space Mono, monospace", fontSize: "9px", color: "#8B7355"
            }}>
              {r.id}
            </p>
          </div>
        ))}
      </div>

      <BottomNav />
    </main>
  );
}