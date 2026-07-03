"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/",            icon: "🏠", label: "Home"      },
  { href: "/transport",   icon: "🚌", label: "Transport"  },
  { href: "/environment", icon: "🌿", label: "Report"     },
  { href: "/profile",     icon: "👤", label: "Profile"    },
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
      <div
        className="flex items-start justify-around pt-2 pb-1 border-t"
        style={{
          background: "#fff",
          borderColor: "rgba(26,18,8,0.08)",
          height: "72px",
        }}
      >
        {tabs.map((tab) => {
          const active = path === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex flex-col items-center gap-1 px-3 py-1"
              style={{ color: active ? "#1A6B3C" : "#8B7355" }}
            >
              <span className="text-xl leading-none">{tab.icon}</span>
              <span
                className="text-center"
                style={{
                  fontFamily: "Space Mono, monospace",
                  fontSize: "8px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}