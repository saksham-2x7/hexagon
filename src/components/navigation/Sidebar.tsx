"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  MessageSquare, 
  BookOpen, 
  Library, 
  BarChart2, 
  Settings, 
  Layers, 
  Calendar 
} from "lucide-react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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

  return (
    <aside className="w-64 border-r border-hexagon-border bg-hexagon-surface/50 backdrop-blur-xl h-full flex flex-col pt-8 pb-6 px-4">
      {/* Logo */}
      <Link href="/home" className="flex items-center gap-3 px-2 mb-10 group">
        <div className="w-8 h-8 rounded-lg bg-hexagon-accent flex items-center justify-center text-black font-bold group-hover:scale-105 transition-transform">
          H
        </div>
        <span className="text-xl font-medium tracking-tight text-hexagon-text-primary">
          HEXAGON
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={twMerge(
                clsx(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-hexagon-accent/10 text-hexagon-accent"
                    : "text-hexagon-text-secondary hover:text-hexagon-text-primary hover:bg-hexagon-surface-hover"
                )
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings / Bottom Area */}
      <div className="pt-4 border-t border-hexagon-border space-y-1">
        <Link
          href="/settings"
          className={twMerge(
            clsx(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              pathname.startsWith("/settings")
                ? "bg-hexagon-accent/10 text-hexagon-accent"
                : "text-hexagon-text-secondary hover:text-hexagon-text-primary hover:bg-hexagon-surface-hover"
            )
          )}
        >
          <Settings className="w-5 h-5" />
          Settings
        </Link>
      </div>
    </aside>
  );
}
