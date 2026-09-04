"use client"

import { Layers } from "lucide-react"
import { EmptyState } from "../../../components/ui/empty-state"

export default function FlashcardsPage() {
  return (
    <div className="flex h-full flex-col p-6 sm:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Flashcards</h1>
        <p className="mt-2 text-muted-foreground">Quick recall practice.</p>
      </header>
      <EmptyState
        icon={Layers}
        title="No decks found"
        description="Ask your tutor to generate a flashcard deck for your current topic."
      />
    </div>
  )
}
