"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Trophy, Wallet, ClipboardList, User } from "lucide-react";

export default function BottomNav() {
  const location = usePathname();

  if (location === "/admin" || location === "/login" || location === "/signup") {
    return null;
  }

  const tabs = [
    { id: "home",    path: "/",        icon: Home,          label: "Home"     },
    { id: "matches", path: "/matches", icon: Trophy,        label: "Matches"  },
    { id: "wallet",  path: "/wallet",  icon: Wallet,        label: "Wallet"   },
    { id: "picks",   path: "/picks",   icon: ClipboardList, label: "My Picks" },
    { id: "profile", path: "/profile", icon: User,          label: "Profile"  },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pointer-events-none">
      <div className="w-full max-w-[430px] bg-card border-t border-border px-6 py-3 pb-safe pointer-events-auto shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-between items-center">
          {tabs.map((tab) => {
            const isActive = location === tab.path || (tab.path !== "/" && location.startsWith(tab.path));
            const Icon = tab.icon;
            return (
              <Link key={tab.id} href={tab.path} className="flex flex-col items-center gap-1 group">
                <Icon
                  size={24}
                  className={`transition-colors duration-300 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}
                />
                <span className={`text-[10px] font-medium transition-colors duration-300 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`}>
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
