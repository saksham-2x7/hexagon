---
name: Scaffold UI Component
description: A standardized workflow for scaffolding new React UI components adhering to our strict design system.
---

# Scaffold UI Component Workflow

This skill ensures that every new UI component built for this repository aligns perfectly with the established design system and avoids generic Tailwind bloat.

## Prerequisites
- Familiarity with `docs/design-system.md` (or the equivalent design tokens reference).

## Steps to Execute

1. **Review Existing Tokens**
   - Use `view_file` on `src/app/globals.css` to confirm exact CSS variables for colors (e.g., `--background`, `--primary`, `--border`).

2. **Component Creation**
   - Create the component inside `src/components/ui/` (for generic primitives) or `src/components/features/` (for domain-specific blocks).
   - Export standard React functional components. Use `"use client"` only when interactivity (hooks) is strictly required.

3. **Styling Rules**
   - **DO NOT** use raw color literals like `text-red-500`. Use token-mapped utilities like `text-destructive`.
   - **DO NOT** apply heavy box shadows. Use `border-border` and subtle `bg-card` elevation.
   - For variant management, utilize `class-variance-authority` (cva) and the `cn` utility (from `src/lib/utils.ts`) to merge Tailwind classes efficiently.

4. **Props & Accessibility**
   - Strongly type all props using TypeScript interfaces.
   - Forward refs where applicable using `React.forwardRef`.
   - Include proper `aria-` labels for interactive elements (e.g., `aria-hidden="true"` on purely decorative icons).

5. **Self-QA**
   - Mount the component locally and ensure it renders flawlessly on desktop and mobile viewports.
