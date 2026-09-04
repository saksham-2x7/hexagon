import os

with open("src/app/(app)/tutor/page.tsx", "r") as f:
    content = f.read()

# Add Suspense to react imports if not present
if "Suspense" not in content.split("from 'react'")[0]:
    content = content.replace("import { useState, useRef, useEffect, useCallback } from 'react';", "import { useState, useRef, useEffect, useCallback, Suspense } from 'react';")

# Wrap LiveAIEngine in Suspense
content = content.replace("<LiveAIEngine />", "<Suspense fallback={null}><LiveAIEngine /></Suspense>")

with open("src/app/(app)/tutor/page.tsx", "w") as f:
    f.write(content)
