import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Hexagon - AI Language Tutor",
  description: "Advanced language learning powered by AI.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className="antialiased selection:bg-primary/30">
        {children}
      </body>
    </html>
  )
}
