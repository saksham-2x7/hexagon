import { redirect } from "next/navigation"

export default function RootPage() {
  // In a real app, we'd check auth state server-side.
  // For now, redirect to login.
  redirect("/login")
}
