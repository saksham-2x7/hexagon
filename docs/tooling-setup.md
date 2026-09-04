# Frontend Tooling & Setup Audit

## 1. Environment Audit
- **Framework:** Next.js 16.3 (App Router) + TypeScript. The backend is a decoupled FastAPI service (`http://localhost:8000`), accessed via `fetch` and SSE.
- **Styling:** Tailwind CSS v4 is used with `clsx` and `tailwind-merge`.
- **Existing Libraries:** `framer-motion`, `zustand`, `lucide-react`, `@react-three/fiber`, `@react-three/drei`.
- **CI/CD:** None currently exist.
- **MCP Servers:** None were set up globally or per-workspace initially.

## 2. MCP Server Integrations
The following MCP servers have been configured in `~/.gemini/config/mcp_config.json`:
1. **Chrome DevTools MCP** (`chrome-devtools-mcp`): For DOM, network, and performance profiling.
2. **Context7** (`@context7/mcp-server`): To fetch real-time, version-correct docs (Next.js 16, Tailwind v4). (Anonymous tier used pending API key).
3. **shadcn/ui MCP** (`@jpisnice/shadcn-ui-mcp-server`): To pull standard component blocks.
4. **Playwright MCP** (`@playwright/mcp-server`): For programmatic, reliable browser automation.

*(Note: Figma and GitHub MCPs were skipped as no tokens/PATs were provided and they are not strictly necessary for this repo context).*

## 3. The Frontend Stack Setup
The following core libraries will be used in the rebuild pass:
- **UI & Components:** Tailwind CSS v4, shadcn/ui primitives.
- **State & Data:** Zustand (Local state), TanStack Query (Server state).
- **Forms:** React Hook Form + Zod.
- **Testing & Quality:** Vitest (unit), Playwright (E2E), `@axe-core/playwright` (A11y), Prettier, ESLint, Husky, lint-staged.
- **Typography:** Vercel Geist (`@fontsource-variable/geist`) for a precise, modern aesthetic instead of default Inter.
- **Icons & Motion:** Lucide React, Framer Motion.

## 4. Design Reference Patterns
To achieve a best-in-class UI, we will draw on patterns from Linear, Vercel, and Stripe:
- **Grounded Modals/Dialogs:** Modals that slide up from the bottom with spring physics, anchoring to the interface rather than floating aimlessly.
- **Subtle Surface Elevation:** Utilizing dark grays and extremely faint `1px` borders instead of heavy, muddy drop shadows.
- **Data Density:** Precise `16px` padded grids that don't overcrowd data, utilizing a mono-spaced font variant for numbers to improve scannability.
- **Definitive Empty States:** Action-oriented empty states that act as onboarding steps rather than dead ends.
