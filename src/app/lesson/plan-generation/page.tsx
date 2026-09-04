"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

export default function PlanGenerationPage() {
  const router = useRouter()

  React.useEffect(() => {
    // Simulate generation delay
    const timer = setTimeout(() => {
      // In a real app, we get the lesson ID from the backend
      router.push("/lesson/test-lesson-id")
    }, 2500)
    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-6 max-w-sm text-center">
        {/* Sleek Loader */}
        <div className="relative h-16 w-16">
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary/20"
          />
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, ease: "linear", repeat: Infinity }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
        </div>
        
        <div className="space-y-2">
          <h2 className="text-xl font-medium tracking-tight">Generating Session</h2>
          <p className="text-sm text-muted-foreground">
            Assembling vocabulary, context, and dynamic representations for your learning level...
          </p>
        </div>
      </div>
    </div>
  )
}
