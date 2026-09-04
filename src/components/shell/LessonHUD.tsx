"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSemanticDispatcher } from "../../lib/api/useSemanticDispatcher";
import { ChevronLeft, MoreHorizontal } from "lucide-react";
import { Progress } from "../ui/progress";
import { Button } from "../ui/button";

export default function LessonHUD() {
  const router = useRouter();
  const events = useSemanticDispatcher((state) => state.events);

  return (
    <div className="w-full h-16 border-b border-border bg-card/90 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 shadow-sm">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/home")}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-sm font-semibold">Conversational Structures</h1>
          <p className="text-xs text-muted-foreground">Module 3 • Lesson 1</p>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8 hidden sm:block">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-muted-foreground">Lesson Progress</span>
          <span className="text-xs font-medium">45%</span>
        </div>
        <Progress value={45} className="h-1.5" />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
