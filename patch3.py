import re

with open("src/app/(app)/tutor/page.tsx", "r") as f:
    content = f.read()

# Add import if missing
if "import { useRouter }" not in content:
    content = content.replace("import { useState, useRef, useEffect, useMemo } from 'react';", "import { useState, useRef, useEffect, useMemo } from 'react';\nimport { useRouter } from 'next/navigation';")

# Add Back button
target_str = """      <header className="h-14 border-b border-hexagon-border bg-hexagon-surface/60 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-hexagon-accent/10 border border-hexagon-accent/30 flex items-center justify-center text-hexagon-accent">
            <Brain className="w-4 h-4" />
          </div>"""

replacement = """      <header className="h-14 border-b border-hexagon-border bg-hexagon-surface/60 backdrop-blur-md px-6 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.push('/home')}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 border border-transparent hover:border-white/10 transition-colors mr-2"
          >
            <ArrowRight className="w-4 h-4 rotate-180 text-gray-400 hover:text-white" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-hexagon-accent/10 border border-hexagon-accent/30 flex items-center justify-center text-hexagon-accent">
            <Brain className="w-4 h-4" />
          </div>"""

content = content.replace(target_str, replacement)

with open("src/app/(app)/tutor/page.tsx", "w") as f:
    f.write(content)
