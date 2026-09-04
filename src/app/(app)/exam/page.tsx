"use client"

import { GraduationCap } from "lucide-react"
import { EmptyState } from "../../../components/ui/empty-state"

export default function ExamPage() {
  return (
    <div className="flex h-full flex-col p-6 sm:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
        <p className="mt-2 text-muted-foreground">Mock tests and assessments.</p>
      </header>
      <EmptyState
        icon={GraduationCap}
        title="No exams available"
        description="You do not have any mock exams scheduled for your current curriculum."
      />
    </div>
  )
}
