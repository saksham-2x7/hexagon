"use client"

import * as React from "react"
import { usePathname, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { BookOpen, Home, LayoutDashboard, Settings, LogOut, User } from "lucide-react"
import { useAuthStore } from "../../store/useAuthStore"

const SIDEBAR_ITEMS = [
  { label: "Home", href: "/home", icon: Home },
  { label: "Learning", href: "/learning", icon: BookOpen },
  { label: "Planner", href: "/planner", icon: LayoutDashboard },
  { label: "Settings", href: "/settings", icon: Settings },
]

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { isAuthenticated, logout } = useAuthStore()

  React.useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) return null

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar Navigation */}
      <nav className="w-64 border-r border-border bg-card flex flex-col justify-between">
        <div className="p-4">
          <div className="flex items-center space-x-3 mb-8 px-2">
            <div className="h-8 w-8 bg-primary/20 rounded border border-primary/50 flex items-center justify-center">
              <div className="h-3 w-3 bg-primary rounded-sm" />
            </div>
            <span className="font-semibold tracking-tight text-lg">Hexagon</span>
          </div>

          <ul className="space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.href)
              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm transition-colors ${
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </a>
                </li>
              )
            })}
          </ul>
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-muted-foreground">
              <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Student</p>
              <p className="text-xs text-muted-foreground truncate">Intermediate</p>
            </div>
          </div>
          <button
            onClick={() => {
              logout()
              router.push("/login")
            }}
            className="flex w-full items-center space-x-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  )
}
