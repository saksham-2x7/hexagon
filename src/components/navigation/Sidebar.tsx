"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  Library, 
  BarChart2, 
  Settings, 
  Layers, 
  Calendar,
  LogOut,
  ChevronRight,
  Flame,
  Plus
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/tutor", label: "AI Tutor", icon: MessageSquare },
  { href: "/learning", label: "My Learning", icon: BookOpen },
  { href: "/library", label: "Library", icon: Library },
  { href: "/progress", label: "Progress", icon: BarChart2 },
  { href: "/flashcards", label: "Flashcards", icon: Layers },
  { href: "/planner", label: "Planner", icon: Calendar },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useAuthStore();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const initials = profile?.name
    ? profile.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <aside className="w-64 border-r border-hexagon-border bg-hexagon-surface/50 backdrop-blur-xl h-full flex flex-col pt-8 pb-6 px-4 relative">
      {/* Logo */}
      <Link href="/home" className="flex items-center gap-3 px-2 mb-8 group">
        <div className="w-8 h-8 rounded-lg bg-hexagon-accent flex items-center justify-center text-black font-bold text-sm group-hover:scale-105 transition-transform">
          H
        </div>
        <span className="text-xl font-semibold tracking-tight text-hexagon-text-primary">
          HEXAGON
        </span>
      </Link>

      {/* New Learning CTA */}
      <Link 
        href="/setup" 
        className="flex items-center gap-2 px-3 py-2.5 mb-4 rounded-lg border border-hexagon-accent/30 bg-hexagon-accent/5 text-hexagon-accent text-sm font-medium hover:bg-hexagon-accent/10 transition-colors"
      >
        <Plus className="w-4 h-4" />
        New Learning
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={twMerge(
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-hexagon-accent/10 text-hexagon-accent"
                    : "text-hexagon-text-secondary hover:text-hexagon-text-primary hover:bg-hexagon-surface-hover"
                )
              )}
            >
              <item.icon className={clsx("w-4.5 h-4.5 flex-shrink-0", isActive ? "text-hexagon-accent" : "")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="pt-4 border-t border-hexagon-border space-y-0.5">
        <Link
          href="/settings"
          className={twMerge(
            clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
              pathname.startsWith("/settings")
                ? "bg-hexagon-accent/10 text-hexagon-accent"
                : "text-hexagon-text-secondary hover:text-hexagon-text-primary hover:bg-hexagon-surface-hover"
            )
          )}
        >
          <Settings className="w-4.5 h-4.5 flex-shrink-0" />
          Settings
        </Link>

        {/* Profile / User */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-hexagon-text-secondary hover:text-hexagon-text-primary hover:bg-hexagon-surface-hover"
          >
            <div className="w-7 h-7 rounded-full bg-hexagon-accent/20 border border-hexagon-accent/30 flex items-center justify-center text-hexagon-accent font-bold text-xs flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-xs font-medium text-hexagon-text-primary truncate">{profile?.name || "Guest"}</p>
              {profile?.streakDays ? (
                <p className="text-[10px] text-hexagon-text-secondary flex items-center gap-1">
                  <Flame className="w-2.5 h-2.5 text-orange-400" /> {profile.streakDays} day streak
                </p>
              ) : null}
            </div>
            <ChevronRight className={clsx("w-3.5 h-3.5 flex-shrink-0 transition-transform", profileOpen ? "rotate-90" : "")} />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 4, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.95 }}
                className="absolute bottom-full mb-2 left-0 right-0 bg-hexagon-surface border border-hexagon-border rounded-xl shadow-xl overflow-hidden z-50"
              >
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-hexagon-text-primary hover:bg-hexagon-surface-hover transition-colors"
                  onClick={() => setProfileOpen(false)}
                >
                  View Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-red-500/5 transition-colors border-t border-hexagon-border"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}
