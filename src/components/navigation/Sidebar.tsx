"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  Home, 
  BookOpen, 
  Library, 
  Bot, 
  Calendar, 
  Repeat, 
  GraduationCap, 
  Layers, 
  LineChart, 
  Settings,
  UserCircle
} from "lucide-react"
import { cn } from "../../lib/utils"

const NAV_ITEMS = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/learning", label: "Learning", icon: BookOpen },
  { href: "/tutor", label: "Tutor", icon: Bot },
  { href: "/library", label: "Library", icon: Library },
  { href: "/planner", label: "Planner", icon: Calendar },
  { href: "/revision", label: "Revision", icon: Repeat },
  { href: "/exam", label: "Exams", icon: GraduationCap },
  { href: "/flashcards", label: "Cards", icon: Layers },
  { href: "/progress", label: "Progress", icon: LineChart },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-16 flex-col border-r bg-card transition-all duration-300 sm:w-64">
      {/* Brand */}
      <div className="flex h-16 shrink-0 items-center justify-center sm:justify-start sm:px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="ml-3 hidden text-lg font-semibold tracking-tight sm:block">Hexagon</span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 space-y-1 px-2 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href)
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-colors sm:justify-start",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
              title={item.label}
            >
              <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground")} />
              <span className="ml-3 hidden sm:block">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer Nav */}
      <div className="border-t p-2">
        <Link
          href="/settings"
          className={cn(
            "group flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-colors sm:justify-start",
            pathname.startsWith("/settings") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          title="Settings"
        >
          <Settings className="h-5 w-5 shrink-0" />
          <span className="ml-3 hidden sm:block">Settings</span>
        </Link>
        <Link
          href="/profile"
          className={cn(
            "group mt-1 flex items-center justify-center rounded-md px-2 py-2 text-sm font-medium transition-colors sm:justify-start",
            pathname.startsWith("/profile") ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
          title="Profile"
        >
          <UserCircle className="h-5 w-5 shrink-0" />
          <span className="ml-3 hidden sm:block">Profile</span>
        </Link>
      </div>
    </aside>
  )
}
