"use client"

import { BookOpen } from "lucide-react"
import { EmptyState } from "../../../components/ui/empty-state"

export default function LearningPage() {
  return (
    <div className="flex h-full flex-col p-6 sm:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Curriculum</h1>
        <p className="mt-2 text-muted-foreground">Your structured learning path.</p>
      </header>
      
      <EmptyState
        icon={BookOpen}
        title="No active curriculum"
        description="You haven't enrolled in a specific learning path yet. Start a conversation with your tutor to generate a custom curriculum."
        actionLabel="Go to Tutor"
        onAction={() => window.location.href = '/tutor'}
      />
    </div>
  )
}
