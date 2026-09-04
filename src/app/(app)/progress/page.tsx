"use client"

import { LineChart } from "lucide-react"
import { EmptyState } from "../../../components/ui/empty-state"

export default function ProgressPage() {
  return (
    <div className="flex h-full flex-col p-6 sm:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Progress</h1>
        <p className="mt-2 text-muted-foreground">Analytics and performance metrics.</p>
      </header>
      <EmptyState
        icon={LineChart}
        title="Not enough data"
        description="Complete a few more lessons to unlock detailed performance analytics and insights."
      />
    </div>
  )
}
