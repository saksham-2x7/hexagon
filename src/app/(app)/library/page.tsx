"use client"

import { Library } from "lucide-react"
import { EmptyState } from "../../../components/ui/empty-state"

export default function LibraryPage() {
  return (
    <div className="flex h-full flex-col p-6 sm:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Library</h1>
        <p className="mt-2 text-muted-foreground">Your uploaded documents and materials.</p>
      </header>
      <EmptyState
        icon={Library}
        title="Your library is empty"
        description="Upload PDFs, notes, or textbooks to give your AI tutor access to your specific materials."
        actionLabel="Upload Document"
        onAction={() => {}}
      />
    </div>
  )
}
