"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function PlanGenerationPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = setTimeout(() => {
      // Fake generation delay then redirect to a fake lesson id
      router.push("/lesson/live-session-123")
    }, 2500)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-center px-4">
      <div className="relative mb-8 h-16 w-16">
        <div className="absolute inset-0 rounded-full border-4 border-muted"></div>
        <div className="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
      <h2 className="text-2xl font-bold tracking-tight">Generating your custom lesson...</h2>
      <p className="mt-2 text-muted-foreground max-w-md">
        Your AI tutor is analyzing your progress and assembling the optimal learning materials for this session.
      </p>
    </div>
  )
}
