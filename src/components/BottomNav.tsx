"use client";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

const RIDER_TABS = [
  { href: "/",            icon: "🏠", label: "Home"      },
  { href: "/transport",   icon: "🚌", label: "Transport"  },
  { href: "/environment", icon: "🌿", label: "Report"     },
  { href: "/profile",     icon: "👤", label: "Profile"    },
];

const DRIVER_TABS = [
  { href: "/driver",       icon: "🚌", label: "Dashboard" },
  { href: "/driver/route", icon: "🗺️", label: "My Route"  },
  { href: "/profile",      icon: "👤", label: "Profile"   },
];

const ADMIN_TABS = [
  { href: "/admin",                icon: "📋", label: "Reports"   },
  { href: "/admin?view=transport", icon: "🚌", label: "Transport" },
  { href: "/profile",              icon: "👤", label: "Profile"   },
];

export default function BottomNav() {
  const path = usePathname();
  const searchParams = useSearchParams();
  const currentView = searchParams.get("view");
  const { data: session } = useSession();
  const role = session?.user?.role;

  const tabs = role === "driver" ? DRIVER_TABS
    : role === "admin" ? ADMIN_TABS
    : RIDER_TABS;

  function isActive(href: string) {
    const [tabPath, tabQuery] = href.split("?");
    if (tabPath !== path) return false;

    if (tabPath === "/admin") {
      const tabView = tabQuery?.includes("view=transport") ? "transport" : "reports";
      const activeView = currentView === "transport" ? "transport" : "reports";
      return tabView === activeView;
    }

    return true;
  }

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
          const active = isActive(tab.href);
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