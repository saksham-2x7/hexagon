"use client"

import { useState } from "react"
import { useAuthStore, Language, TutorGender } from "../../store/useAuthStore"
import { useRouter } from "next/navigation"
import { Button } from "../../components/ui/button"
import { Label } from "../../components/ui/label"
import { Card } from "../../components/ui/card"
import { cn } from "../../lib/utils"

export default function SetupPage() {
  const { profile, updateProfile } = useAuthStore()
  const router = useRouter()
  
  const [language, setLanguage] = useState<Language>(profile?.language || "en")
  const [level, setLevel] = useState<"beginner" | "intermediate" | "advanced">(profile?.level || "beginner")
  const [tutorGender, setTutorGender] = useState<TutorGender>(profile?.tutorGender || "female")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateProfile({ language, level, tutorGender })
    router.push("/home")
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold tracking-tight">Personalize your experience</h2>
          <p className="mt-2 text-muted-foreground">Let us tailor the curriculum to your goals.</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <Label className="text-base font-semibold">What language do you want to learn?</Label>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "en", label: "English" },
                { id: "hi", label: "Hindi" },
                { id: "kn", label: "Kannada" },
                { id: "hinglish", label: "Hinglish" },
              ].map((lang) => (
                <div
                  key={lang.id}
                  onClick={() => setLanguage(lang.id as Language)}
                  className={cn(
                    "cursor-pointer rounded-lg border p-4 text-center transition-colors",
                    language === lang.id ? "border-primary bg-primary/10 text-primary" : "bg-card hover:bg-muted"
                  )}
                >
                  <span className="font-medium">{lang.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Current proficiency level</Label>
            <div className="grid gap-3">
              {[
                { id: "beginner", label: "Beginner", desc: "Just starting out" },
                { id: "intermediate", label: "Intermediate", desc: "Can hold basic conversations" },
                { id: "advanced", label: "Advanced", desc: "Looking to perfect fluency" },
              ].map((lvl) => (
                <div
                  key={lvl.id}
                  onClick={() => setLevel(lvl.id as any)}
                  className={cn(
                    "cursor-pointer rounded-lg border p-4 transition-colors",
                    level === lvl.id ? "border-primary bg-primary/10 text-primary" : "bg-card hover:bg-muted"
                  )}
                >
                  <div className="font-medium">{lvl.label}</div>
                  <div className={cn("text-sm", level === lvl.id ? "text-primary/80" : "text-muted-foreground")}>{lvl.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">AI Tutor Voice</Label>
            <div className="flex gap-4">
              {[
                { id: "female", label: "Female" },
                { id: "male", label: "Male" },
              ].map((gender) => (
                <div
                  key={gender.id}
                  onClick={() => setTutorGender(gender.id as TutorGender)}
                  className={cn(
                    "cursor-pointer flex-1 rounded-lg border p-3 text-center transition-colors",
                    tutorGender === gender.id ? "border-primary bg-primary/10 text-primary" : "bg-card hover:bg-muted"
                  )}
                >
                  <span className="font-medium capitalize">{gender.label}</span>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full">
            Complete Setup
          </Button>
        </form>
      </div>
    </div>
  )
}
