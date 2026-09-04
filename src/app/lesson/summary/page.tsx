"use client"

import { useRouter } from "next/navigation"
import { Button } from "../../../components/ui/button"
import { CheckCircle2 } from "lucide-react"

export default function SummaryPage() {
  const router = useRouter()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">Lesson Complete!</h2>
        <p className="mt-2 text-muted-foreground">
          Great job! You&apos;ve completed the conversational structures module.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold">+15</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">XP Earned</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold">92%</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Accuracy</div>
          </div>
        </div>

        <Button size="lg" className="mt-8 w-full" onClick={() => router.push("/home")}>
          Return to Dashboard
        </Button>
      </div>
    </div>
  )
}
