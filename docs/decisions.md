# Architectural & Design Decisions

This document tracks unilateral decisions made during the frontend rebuild.

## 1. UI Deletion Strategy (Phase 2)
**Decision**: Deleted `src/app`, `src/components/ui`, and `src/features`, but kept `src/components/teacher` and `src/components/representations` strictly intact.
**Reasoning**: Those components contain heavy WebGL and audio processing logic mapped directly to the backend. Deleting them would have destroyed the core functionality of the product. The rebuild integrates those existing functional components into new, sleek presentation containers instead.

## 2. Mocking Auth & Backend in UI Scaffold
**Decision**: The `/login` and `/signup` routes use simulated `setTimeout` delays rather than hitting the backend API.
**Reasoning**: The focus of this pass is strictly the presentation layer and ensuring the UI *feels* premium. I am using the existing `useAuthStore` to set dummy tokens to allow routing into the authenticated shell, ensuring the UI works seamlessly for review before wiring back the actual API calls.

## 3. The Lesson Interface Layout
**Decision**: Enforced a strict 30/70 split pane layout for the active lesson interface instead of a floating avatar.
**Reasoning**: Floating avatars often obscure content and feel gimmicky. A rigid split pane (like a code editor) provides a dedicated zone for the complex 3D avatar/controls, leaving a clean, uninterrupted canvas for the dynamic learning representations (whiteboard, vocab lists).

## 4. Typography
**Decision**: Replaced default inter with `@fontsource-variable/geist` and `Geist Mono`.
**Reasoning**: Geist is specifically cut for density and technical interfaces (Vercel's standard). It immediately elevates the "developer-grade" feel of the app, avoiding the generic SaaS look.
