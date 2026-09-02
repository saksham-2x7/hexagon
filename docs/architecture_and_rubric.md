# Virtual Hawks: Architectural Overview & Rubric Mapping

## 1. Architectural Overview & Team Division

To ensure a robust, scalable, and decoupled system for the AI Innovation Hackathon 2026, the Virtual Hawks divided the project into three distinct pairs:

- **Pair 1 (Pedagogy & State)**: Responsible for the core pedagogical logic. This includes the deterministic Finite State Machine (FSM), the `AdaptiveRouter` engine, Pydantic data schemas, and the overarching scenario orchestrator.
- **Pair 2 (Frontend & UI)**: Responsible for the React UI, integrating a dynamic whiteboard canvas capable of rendering multi-modal `visual_intent` tags (equations, diagrams, code), and the virtual avatar.
- **Pair 3 (LLM Integration & Backend)**: Responsible for interfacing with the actual LLM APIs, persisting the `golden_trace.json` structures to the database, and managing real-time speech-to-text/text-to-speech pipelines.

## 2. The Deterministic Engine (Pair 1 Focus)

Most AI tutors are merely wrappers around conversational LLMs. The Virtual Hawks AI Teacher employs a **Deterministic Pedagogical Engine**:
1. **Strict Finite State Machine**: The teaching loop strictly enforces states (`TEACHING` -> `WAITING_FOR_STUDENT` -> `EVALUATING` -> `ADAPTING`). The LLM is structurally prevented from ignoring student input or hallucinating the end of a lesson.
2. **Misconception Taxonomy**: We don't just classify answers as "correct" or "incorrect." We classify errors (e.g., `CONCEPTUAL_FLAW`, `FACTUAL_ERROR`, `MISSING_PREREQUISITE`).
3. **Adaptive Router**: A deterministic rule matrix that Maps a diagnosed misconception to a specific pedagogical intervention (e.g., triggering a `REEXPLAIN_WITH_ANALOGY`).

## 3. Rubric Checklist (100 Marks)

This section maps our core implementation directly to the Hackathon judging criteria:

### Human-Like Teaching & Adaptation (20 Marks)
- **Feature**: `AdaptiveRouter` (`core/pedagogy/engine/router.py`) and `MisconceptionType` taxonomy.
- **Proof**: The engine detects when a student thinks "more resistance = more current" as a `CONCEPTUAL_FLAW` and adaptively changes its teaching style to use a water-pipe analogy.

### AI/LLM Implementation (15 Marks)
- **Feature**: Pydantic Schemas (`contracts/pedagogy/models.py`) and `TeachingTurnAssembler`.
- **Proof**: LLM outputs are tightly constrained to strict JSON schemas, forcing the model to explicitly state its `understanding_status`, `confidence_score`, and `pedagogical_rationale`.

### Multilingual Capability (10 Marks)
- **Feature**: `LANGUAGE_CODE_SWITCHING_PROMPT` (`core/pedagogy/engine/language_policy.py`).
- **Proof**: The system natively supports conversational "Hinglish," blending Hindi grammar with English technical terminology (e.g., "Voltage", "Current") to prevent confusing transliterations.

### Subject-Aware Modality (10 Marks)
- **Feature**: `VISUAL_DISPATCH_PROMPT` (`core/pedagogy/engine/visual_policy.py`).
- **Proof**: The AI dynamically chooses between `equation`, `diagram_ref`, `code`, or `timeline` based on the subject matter context.

### *(Placeholders for Pair 2 & 3)*
- **User Interface & Avatar Rendering (20 Marks)** -> [Pair 2 Documentation]
- **Real-Time Voice Latency (15 Marks)** -> [Pair 3 Documentation]
- **Innovation & Presentation (10 Marks)** -> [Live Pitch]
