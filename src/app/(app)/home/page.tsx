"use client"

import { useAuthStore } from "../../../store/useAuthStore"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Button } from "../../../components/ui/button"
import { GraduationCap, Play, Trophy, Clock } from "lucide-react"

export default function HomePage() {
  const { profile } = useAuthStore()
  
  if (!profile) return null // Let layout/auth guard handle redirect if needed

  return (
    <div className="flex h-full flex-col p-6 sm:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile.name}</h1>
        <p className="mt-2 text-muted-foreground">Continue your {profile.language} mastery journey.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Next Lesson Card */}
        <Card className="col-span-full lg:col-span-2 border-primary/20 bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle>Resume Learning</CardTitle>
                <CardDescription>Advanced conversational structures</CardDescription>
              </div>
              <Button size="lg" className="h-12 gap-2">
                <Play className="h-5 w-5 fill-current" />
                Start Lesson
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-border/50">
              <div className="flex flex-1 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <GraduationCap className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Level</p>
                  <p className="text-sm text-muted-foreground capitalize">{profile.level}</p>
                </div>
              </div>
              <div className="flex flex-1 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Trophy className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium">Streak</p>
                  <p className="text-sm text-muted-foreground">{profile.streakDays} days</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Study Goal</CardTitle>
            <CardDescription>Daily target: {profile.dailyGoalMinutes} min</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-6">
            <div className="relative flex h-32 w-32 items-center justify-center">
              <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="stroke-muted"
                  strokeWidth="8"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <circle
                  className="stroke-primary"
                  strokeWidth="8"
                  strokeLinecap="round"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * 0.65)} // Fake 65% progress
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-bold tracking-tighter">19</span>
                <span className="text-xs text-muted-foreground">/ 30 min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="mt-10 mb-4 text-xl font-semibold tracking-tight">Recent Activity</h2>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-muted/50">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border bg-background">
                <Clock className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="font-medium">Vocabulary Drill #{i}</p>
                <p className="text-sm text-muted-foreground">Completed {i} day{i !== 1 && 's'} ago</p>
              </div>
            </div>
            <div className="text-sm font-medium">+15 XP</div>
          </div>
        ))}
      </div>
    </div>
  )
}
