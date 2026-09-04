"use client"

import { UserCircle } from "lucide-react"
import { useAuthStore } from "../../../store/useAuthStore"

export default function ProfilePage() {
  const { profile, logout } = useAuthStore()

  if (!profile) return null

  return (
    <div className="flex h-full flex-col p-6 sm:p-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="mt-2 text-muted-foreground">Your personal learner details.</p>
      </header>
      <div className="max-w-2xl space-y-6">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary text-2xl font-bold">
              {profile.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-semibold">{profile.name}</h2>
              <p className="text-muted-foreground">{profile.email}</p>
            </div>
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Learning Language</dt>
              <dd className="mt-1 text-sm">{profile.language}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Current Level</dt>
              <dd className="mt-1 text-sm capitalize">{profile.level}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Tutor Preference</dt>
              <dd className="mt-1 text-sm capitalize">{profile.tutorGender}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-muted-foreground">Joined</dt>
              <dd className="mt-1 text-sm">{new Date(profile.joinedAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>
        <button 
          onClick={logout}
          className="text-sm font-medium text-destructive hover:underline"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
