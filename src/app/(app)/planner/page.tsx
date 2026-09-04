"use client"

import { Calendar } from "lucide-react"
import { EmptyState } from "../../../components/ui/empty-state"

export default function PlannerPage() {
  return (
    <div className="flex h-full flex-col p-6 sm:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Planner</h1>
        <p className="mt-2 text-muted-foreground">Schedule your study sessions.</p>
      </header>
      <EmptyState
        icon={Calendar}
        title="No upcoming sessions"
        description="Your schedule is clear. Plan your next study block to keep your streak alive."
        actionLabel="Schedule Session"
        onAction={() => {}}
      />
    </div>
  )
}
