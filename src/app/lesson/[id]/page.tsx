"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Mic, MicOff, Settings2, ShieldAlert } from "lucide-react"
import { Button } from "../../../components/ui/button"

// In a real app, these would import the preserved WebGL and SSE components:
// import { ProceduralAvatar } from "../../../components/teacher/ProceduralAvatar"
// import { RepresentationRegistry } from "../../../lib/registry/RepresentationRegistry"

export default function LessonInterfacePage() {
  const params = useParams()
  const router = useRouter()
  const [isMicMuted, setIsMicMuted] = React.useState(false)
  const [sessionState, setSessionState] = React.useState<"connecting" | "active" | "error">("active")

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden selection:bg-primary/30">
      {/* 
        SPLIT PANE LAYOUT
        Left: 30% - Avatar & Core Controls
        Right: 70% - Dynamic Representations (Whiteboard/Context)
      */}
      
      {/* LEFT PANE - Avatar */}
      <div className="w-[30%] min-w-[320px] max-w-[400px] border-r border-border bg-card flex flex-col relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.2)]">
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-4 border-b border-border bg-card/50 backdrop-blur-md absolute top-0 w-full z-20">
          <Button variant="ghost" size="icon" onClick={() => router.push("/home")} className="h-8 w-8 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${sessionState === 'active' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="text-xs font-mono font-medium text-muted-foreground uppercase tracking-wider">
              {sessionState}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
            <Settings2 className="w-4 h-4" />
          </Button>
        </header>

        {/* Avatar Viewport */}
        <div className="flex-1 bg-[#0a0a0c] relative overflow-hidden flex items-center justify-center">
          {/* Mock Procedural Avatar */}
          <div className="text-center space-y-4 relative z-10">
            <div className="h-32 w-32 mx-auto rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center">
              <span className="text-primary/40 font-mono text-xs">WebGL Canvas</span>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Aura (Tutor)</p>
          </div>
          
          {/* Ambient Lighting Mock */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-0" />
        </div>

        {/* Audio/Mic Controls */}
        <div className="h-24 border-t border-border bg-card p-4 flex items-center justify-center space-x-4">
          <Button 
            size="lg"
            variant={isMicMuted ? "secondary" : "default"}
            className={`w-16 h-16 rounded-full flex-shrink-0 transition-all ${!isMicMuted && 'shadow-[0_0_20px_var(--color-primary)]'}`}
            onClick={() => setIsMicMuted(!isMicMuted)}
          >
            {isMicMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </Button>
        </div>
      </div>

      {/* RIGHT PANE - Dynamic Content */}
      <div className="flex-1 bg-background relative flex flex-col">
        {/* Dynamic Context Header */}
        <div className="h-14 border-b border-border flex items-center px-6">
          <h2 className="text-sm font-medium text-muted-foreground tracking-wide">
            Module Context <span className="text-border mx-2">/</span> Ordering Coffee
          </h2>
        </div>

        {/* Representation Canvas */}
        <div className="flex-1 p-8 flex items-center justify-center relative">
          {/* Semantic Representation Registry output would render here */}
          <AnimatePresence mode="wait">
            <motion.div
              key="mock-rep"
              initial={{ opacity: 0, scale: 0.95, filter: "blur(4px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 1.05, filter: "blur(4px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="max-w-2xl w-full"
            >
              <div className="rounded-lg border border-border bg-card/50 p-8 shadow-sm">
                <div className="flex items-center space-x-3 mb-6">
                  <span className="bg-primary/20 text-primary px-2 py-1 rounded text-xs font-mono font-medium">Prompt</span>
                </div>
                <h3 className="text-3xl font-semibold leading-tight tracking-tight mb-4">
                  "I would like a large iced latte with oat milk, please."
                </h3>
                <div className="flex flex-wrap gap-2 mt-8">
                  <span className="px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium">iced latte</span>
                  <span className="px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium">oat milk</span>
                  <span className="px-3 py-1.5 rounded-md border border-border bg-background text-sm font-medium">please</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Subtitles Overlay */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 max-w-xl w-full px-6 py-4 rounded-xl bg-black/80 backdrop-blur-md border border-white/10 text-center shadow-2xl">
            <p className="text-lg font-medium text-white/90">
              Great! Now try saying it exactly like that, but add that it's for here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
