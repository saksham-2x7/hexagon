# Legacy Frontend Audit

## Routes and Pages
The application structure is heavily nested within Next.js App Router conventions:

- `/` (`src/app/page.tsx`): Root landing page (currently redirects to `/login` or `/home`).
- **Auth Flow**:
  - `/login`: Standard user login.
  - `/signup`: User registration.
  - `/setup`: Onboarding questionnaire (Language, Level, Tutor Preference).
- **Authenticated Shell (`(app)`)**:
  - `/home`: Dashboard / Student Hub showing progress and current lesson.
  - `/learning`: Curriculum map.
  - `/library`: Uploaded documents.
  - `/planner`: Calendar and session scheduling.
  - `/progress`: Analytics.
  - `/revision`, `/exam`, `/flashcards`: Various assessment views.
  - `/tutor`: General tutor conversation interface.
  - `/settings`, `/profile`: User management.
- **Lesson Engine (`/lesson`)**:
  - `/lesson/plan-generation`: Interstitial loading state while AI generates lesson.
  - `/lesson/[id]`: The core learning interface (Three.js avatar, SSE data stream, dynamic representations).
  - `/lesson/summary`: Post-lesson debrief.

## API & Backend Integration
- **Backend API**: The frontend expects a decoupled backend, heavily utilizing `fetch` requests relative to `NEXT_PUBLIC_BACKEND_URL`.
- **Server-Sent Events (SSE)**: The real-time tutor engine is entirely dependent on `src/services/liveSSEClient.ts`. The SSE stream provides semantic events (speech, representations, assessments).
- **Audio Synthesizer**: `src/services/speechSynthesizer.ts` manages text-to-speech audio streams.

## State Management (Zustand)
- `useAuthStore.ts`: Manages JWT tokens, user profiles (Language, Level, TutorGender).
- `useAIIntentStore.ts`: Stores the current question/assessment data injected via SSE.
- `useInteractionStore.ts`: Handles UI interaction states.
- `useUniverseStore.ts`: (Legacy/dev) Manages complex multi-node graphs.

## UI / Complex Logic Boundary
- The components in `src/components/teacher/` (`AITeacherPiP.tsx`, `ProceduralAvatar.tsx`) and `src/components/representations/` contain massive amounts of WebGL (`@react-three/fiber`) and audio processing math. These are **strictly functional** components that must be preserved and reskinned, not blindly deleted and rewritten from scratch, to avoid losing the lip-sync and 3D rendering pipeline.
