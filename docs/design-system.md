# Hexagon Design System

## Philosophy
This design system embraces confident restraint and real craft in the details. It avoids generic SaaS templates in favor of a sleek, app-like interface. The goal is to feel like it was built by a huge, well-resourced team: precise typography, intentional layout, deliberate motion, and an interface that feels snappy and native.

## Color
We use a disciplined palette to ensure the 3D learning content is the hero.

**Base Theme (Dark Mode Default):**
- **Background**: Deep Charcoal (`#12141A` / `hsl(225, 18%, 9%)`) - Soft on the eyes, feels premium.
- **Surface**: Elevated Gray (`#1D2029` / `hsl(225, 17%, 14%)`) - For cards, sidebars, and modals.
- **Border**: Subtle Subdued (`#2B303B` / `hsl(221, 15%, 20%)`) - Very light borders, no heavy lines.

**Accent:**
- **Primary Indigo**: (`#5C6CFF` / `hsl(234, 100%, 68%)`) - Used sparingly for primary actions, active states, and focus rings.

**Text:**
- **Primary**: High-contrast Off-White (`#F3F4F6` / `hsl(220, 14%, 96%)`)
- **Secondary**: Muted Ash (`#9CA3AF` / `hsl(215, 14%, 65%)`)

## Typography
- **Primary Typeface**: `Inter` (sans-serif) for all UI elements. Chosen for its exceptional legibility and crisp geometry at small sizes.
- **Weights**: Regular (400) for body, Medium (500) for labels/buttons, Semibold (600) for headers.
- **Line Lengths**: Kept under 80 characters for comfortable reading.
- **Scale**: Strict modular scale (12px, 14px, 16px, 20px, 24px, 32px).

## Layout
- **Global Structure**: Full-height application shell (100vh). No scrolling on the `<body>`. Scrollable areas are constrained to specific content panes.
- **Navigation**: Ultra-slim, left-aligned sidebar with simple icons and subtle active states.
- **Lesson View**: Split-pane layout. Left pane for the 3D Avatar and interaction controls. Right pane for dynamic representations (code, diagrams, timelines).
- **Alignment**: Deliberate left-alignment for text. No forced justification. Cards have consistent 16px or 24px padding with a subtle 8px border-radius (not overly rounded).

## Motion
- **Tooling**: `framer-motion`
- **Style**: Snappy, physics-based springs (`type: "spring", stiffness: 300, damping: 30`). 
- **Usage**: Used to respond to user actions. Modals slide up slightly from the bottom, dropdowns scale out from the origin. No slow fades or decorative hover lifts.

## Voice
- **Tone**: Plain, active-voice, end-user focused.
- **Rules**:
  - Name things by what they mean to the user (e.g., "Start Lesson", not "Initialize Session").
  - Clear verbs ("Save", "Delete", "Confirm").
  - Empty states guide action (e.g., "You have no upcoming lessons. View curriculum to schedule one.") rather than apologizing ("Sorry, no lessons found").
