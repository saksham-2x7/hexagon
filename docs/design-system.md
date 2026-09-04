# Design System: Hexagon

## Overview
Hexagon is a premium AI language tutor. It should feel deeply capable, grounded, and focused. The interface will avoid the sci-fi "hologram" cliches, instead adopting the aesthetic of high-end developer tools (like Vercel, Linear, or Raycast): a strictly disciplined dark-mode UI that gets out of the way of the content.

## Color Palette
The app is entirely dark mode. We use a single, focused accent color against deep charcoal backgrounds to create contrast without noise.

- **Background (`--background`)**: `hsl(225, 18%, 9%)` — A deep, cool charcoal.
- **Card/Surface (`--card`)**: `hsl(225, 18%, 12%)` — Slightly elevated charcoal.
- **Borders (`--border`)**: `hsl(225, 18%, 18%)` — Hairline structure.
- **Primary Text (`--foreground`)**: `hsl(225, 15%, 95%)` — Off-white, avoiding the harshness of pure `#fff`.
- **Muted Text (`--muted-foreground`)**: `hsl(225, 10%, 65%)` — Secondary information.
- **Accent/Primary (`--primary`)**: `hsl(217, 91%, 60%)` — An intense, vibrant azure blue used exclusively for primary actions, active states, and focus rings. 

## Typography
- **Primary Typeface**: `Geist` (`@fontsource-variable/geist`). Used for all body text, headings, and UI chrome.
- **Secondary Typeface**: `Geist Mono`. Used exclusively for data points, structural IDs, semantic logs, and code blocks to provide technical density.
- **Scale & Weights**:
  - `H1`: 24px (text-2xl), Semi-bold, tight tracking (`tracking-tight`).
  - `H2`: 20px (text-xl), Medium.
  - `Body`: 14px (text-sm), Normal. Long form text is restricted to `max-w-[65ch]` to preserve reading rhythm.
  - `Micro`: 11px (text-[11px]), Medium, uppercase, `tracking-wider`.

## Layout Concepts
- **Grid Density**: Interfaces use strict 16px or 24px padding increments. 
- **The Split Pane**: The `/lesson/[id]` interface uses a rigid 30/70 split pane (left: avatar & controls, right: dynamic content). No floating widget chaos.
- **Elevation**: Elements are separated by `1px` borders, not aggressive drop shadows. Modal overlays receive a pure black backdrop blur (`bg-black/80 backdrop-blur-sm`).

## Motion
Animations are exclusively used to confirm user intent. We use Framer Motion with real physics:
- **Spring Settings**: `type: "spring", stiffness: 400, damping: 30` (fast, decisive, zero bounce).
- **Triggers**: Modals slide up `y: 20 -> y: 0`, expanding items reveal their height seamlessly. Zero "scroll reveal" decorations.

## Voice & Tone
- **Active & Direct**: "Start Lesson" (not "Click here to start").
- **Clear System State**: When an action is taken, the system responds exactly ("Saving..." -> "Saved").
- **Actionable Errors**: Instead of "Oops, something went wrong", use "Connection lost. Reconnecting to tutor engine."
