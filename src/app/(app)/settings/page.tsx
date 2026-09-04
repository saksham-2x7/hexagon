"use client"

import { Settings } from "lucide-react"
import { EmptyState } from "../../../components/ui/empty-state"

export default function SettingsPage() {
  return (
    <div className="flex h-full flex-col p-6 sm:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">Manage your account preferences.</p>
      </header>
      <div className="max-w-2xl">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-medium">Coming Soon</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Account management and billing features are currently under development.
          </p>
        </div>
      </div>
    </div>
  )
}
