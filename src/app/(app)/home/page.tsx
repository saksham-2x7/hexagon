"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Play, Clock, TrendingUp, BookOpen } from "lucide-react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"

export default function HomePage() {
  const router = useRouter()

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Welcome back.</h1>
        <p className="text-muted-foreground mt-2">You're on a 4-day streak. Let's keep the momentum going.</p>
      </div>

      {/* Primary Action Hero */}
      <Card className="border-primary/20 bg-primary/5 overflow-hidden relative">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/10 to-transparent pointer-events-none" />
        <CardContent className="p-8 flex items-center justify-between">
          <div className="space-y-4 max-w-lg">
            <div className="inline-flex items-center space-x-2 bg-primary/20 text-primary px-2.5 py-1 rounded-full text-xs font-medium uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Up Next</span>
            </div>
            <h2 className="text-2xl font-semibold">Conversational Fluidity: Ordering Coffee</h2>
            <p className="text-muted-foreground text-sm">
              Practice real-time speech and comprehension in a simulated cafe environment.
            </p>
            <Button 
              size="lg" 
              className="mt-4"
              onClick={() => router.push("/lesson/plan-generation")}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Lesson
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Time Learning</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold font-mono">14.2 hrs</div>
            <p className="text-xs text-muted-foreground mt-1">+2.1 hrs from last week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Fluency Score</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold font-mono">78/100</div>
            <p className="text-xs text-muted-foreground mt-1">Intermediate High</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vocab Mastered</CardTitle>
            <BookOpen className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold font-mono">1,240</div>
            <p className="text-xs text-muted-foreground mt-1">words in active memory</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
