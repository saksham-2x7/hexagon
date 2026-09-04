"use client"

import { Repeat } from "lucide-react"
import { EmptyState } from "../../../components/ui/empty-state"

export default function RevisionPage() {
  return (
    <div className="flex h-full flex-col p-6 sm:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Revision</h1>
        <p className="mt-2 text-muted-foreground">Spaced repetition and knowledge reinforcement.</p>
      </header>
      <EmptyState
        icon={Repeat}
        title="Nothing to review yet"
        description="As you learn new concepts, they will appear here for spaced repetition."
      />
    </div>
  )
}
