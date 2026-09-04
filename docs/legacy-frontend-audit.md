# Legacy Frontend Audit

## 1. Routes and Pages

### Public / Auth Routes
- `/`: The landing page.
- `/login`: User login flow.
- `/signup`: User registration.
- `/setup`: Onboarding / profile creation flow (sets initial level, goals, language, tutor gender).

### Authenticated Application Routes (`/src/app/(app)/*`)
- `/home`: Dashboard / main entry point.
- `/tutor`: Main AI tutoring interface (chat, voice, avatar integration).
- `/learning`: Curated learning paths / curriculum overview.
- `/library`: Access to materials, textbooks, documents.
- `/planner`: Calendar and study schedule.
- `/revision`: Spaced repetition and review interface.
- `/exam`: Practice tests and assessment UI.
- `/flashcards`: Interactive flashcard UI.
- `/progress`: Analytics and performance tracking.
- `/settings`: User preferences and profile management.
- `/profile`: Detailed learner profile view.

### Lesson specific Routes
- `/lesson/plan-generation`: Loading/generation screen for creating a new custom lesson.
- `/lesson/summary`: Post-lesson debrief, score, and next steps.
- `/lesson/[id]`: The active lesson runner interface.

### Developer Routes
- `/dev/playground`: Developer sandbox for testing representations and models.

## 2. API Endpoints (Frontend -> Backend)
The frontend communicates with a FastAPI backend (running typically on `http://localhost:8000`).
- **POST `/api/v1/sessions`**: Creates a new teaching session. Receives the `LearnerProfile` object as payload. Returns a `session_id`.
- **GET `/api/v1/sessions/{session_id}/stream`**: Server-Sent Events (SSE) stream endpoint for live tutoring. Streams `TeachingTurn` and `VisualIntent` JSON objects.
- **GET `/api/v1/tts`**: Text-to-Speech proxy endpoint. 
  - *Query Params*: `text` (string), `gender` (female/male).
  - *Response*: Audio stream (mp3).

## 3. Auth Flow and Environment Variables
- **Auth**: Managed entirely client-side via `zustand` with `persist` middleware (`useAuthStore`). It simulates a mock login/signup delay and stores a `LearnerProfile` locally. There is currently no true secure JWT backend auth implemented in the UI layer.
- **Environment Variables**: 
  - `NEXT_PUBLIC_BACKEND_URL`: Defines the FastAPI base URL. (Defaults to `http://localhost:8000`).

## 4. State Management and Stores (`zustand`)
- **`useAuthStore`**: Handles user profile, mock authentication state, and preferences.
- **`useAIIntentStore`**: Central store for the lesson runner state. Manages `lessonPhase`, `teacherState` (speaking, listening, waiting), `representation` (the current visual layout, e.g. code, timeline, diagram), `activeQuestion`, and `scaffoldLevel`.
- **`useInteractionStore`**: Captures user interactions (clicks, answers) to feed back to the semantic dispatcher.

## 5. Third-Party SDKs and Core Libraries
- **Three.js (`@react-three/fiber`, `@react-three/drei`)**: Used for rendering 3D procedural avatars (`ProceduralAvatar.tsx`, `.glb` models).
- **Web Audio API (`useAudioLipSync.ts`)**: Used to analyze the TTS audio frequencies in real-time to drive avatar mouth movements (visemes).
- **`reactflow`**: Used for diagram and node-based representations (`GraphRepresentation`, `NodeCanvasRepresentation`).
- **`framer-motion`**: Used for UI animations and transitions.
- **Tailwind CSS & `lucide-react`**: Core styling and iconography.

## 6. Business Logic in the UI Layer
- **Audio Routing**: The `LiveAIEngine.tsx` component is responsible for intercepting the SSE stream, extracting the text message, generating the TTS URL, and immediately binding it to a browser `Audio` element. It also handles connecting this Audio element to the lip-sync hook.
- **Semantic Event Dispatcher**: `useSemanticDispatcher.ts` and event-driven logic (e.g. `answer_submitted`) intercepts user UI actions and handles mock feedback loops (like "Correct!" praises) in `LiveAIEngine.tsx`. This logic acts as a client-side mock orchestrator when live SSE is unavailable.
