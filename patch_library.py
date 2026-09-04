import re

with open("src/app/(app)/library/page.tsx", "r") as f:
    content = f.read()

# Add useRouter import
if "import { useRouter }" not in content:
    content = content.replace("import { motion } from 'framer-motion';", "import { motion } from 'framer-motion';\nimport { useRouter } from 'next/navigation';")

# Add useRouter hook
if "const router = useRouter();" not in content:
    content = content.replace("export default function LibraryPage() {", "export default function LibraryPage() {\n  const router = useRouter();")

# Add onClick to button
target_button = """                <button className="px-4 py-2 bg-background border border-hexagon-border rounded-lg text-sm hover:bg-hexagon-surface-hover text-hexagon-text-primary">
                  Review
                </button>"""

replacement_button = """                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/tutor?topic=${encodeURIComponent(res.title)}`);
                  }}
                  className="px-4 py-2 bg-background border border-hexagon-border rounded-lg text-sm hover:bg-white/10 hover:border-hexagon-accent/30 text-hexagon-text-primary transition-all"
                >
                  Review
                </button>"""

content = content.replace(target_button, replacement_button)

with open("src/app/(app)/library/page.tsx", "w") as f:
    f.write(content)

print("Patched LibraryPage")
