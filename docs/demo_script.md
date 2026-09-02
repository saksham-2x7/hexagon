# Virtual Hawks: AI Teacher Demo Script
**Target Length**: 4-5 minutes
**Scenario**: Ohm's Law (Physics), Beginner Level, Hinglish.

---

## Scene 1: Introduction (0:00 - 0:45)
**Visual**: Presenter (Kaustubh) on camera, split-screen with the AI Teacher UI (React Frontend).
**Audio (Narrator)**: "Welcome to the Virtual Hawks AI Teacher. Most educational AI today operates as a simple Q&A chatbot. But human teachers don't just answer questions—they drive the lesson, evaluate understanding, and dynamically adapt their teaching strategies based on student misconceptions. Today, we'll demonstrate our deterministic pedagogical engine teaching Ohm's Law."

---

## Scene 2: The Core Loop & Multilingual Support (0:45 - 1:45)
**Visual**: UI shows the AI Avatar speaking. A text bubble appears on the whiteboard: "Voltage (Push) vs Resistance (Block)". 
**Audio (AI Avatar)**: "Voltage is the push, resistance is the block. Agar resistance badh gaya, toh current ka kya hoga?"

**Narrator interjection**:
> *"Notice how the AI seamlessly blends conversational Hindi with English technical terms like 'voltage' and 'current' without hallucinating formal translations. This fulfills the **[Multilingual: 10 marks]** criteria by adhering to our strict `LANGUAGE_CODE_SWITCHING_PROMPT`."*

**Visual**: Student types/speaks: "Current increases." 

---

## Scene 3: The Climax - Misconception & Adaptation (1:45 - 3:15)
**Visual**: Backend debug console flashes briefly, showing the FSM transitioning from `WAITING_FOR_STUDENT` to `EVALUATING`. A JSON payload highlights: `"misconception_type": "CONCEPTUAL_FLAW"`.

**Narrator interjection**:
> *"Here is where our architecture shines. The student made a mistake. Instead of just saying 'wrong', our M1 Evaluation schema categorizes this as a `CONCEPTUAL_FLAW`. Our M2 `AdaptiveRouter` intercepts this and deterministically prescribes a `REEXPLAIN_WITH_ANALOGY` action. Watch the whiteboard change!"*
> ***[Human-Like Teaching & Adaptation: 20 marks]***

**Visual**: The whiteboard UI clears the text and renders a diagram of a water pipe with a blockage (`diagram_ref`).
**Audio (AI Avatar)**: "Socho pipe mein kachra (resistance) phasa hai. Agar kachra badhega, toh paani (current) kam nikalega na? So if resistance increases, what happens to current?"

---

## Scene 4: Resolution & Architecture (3:15 - 4:30)
**Visual**: Student responds: "Current decreases." 
**Visual**: Debug console flashes: `"understanding_status": "UNDERSTOOD"`. The FSM transitions to `PLANNING` for the next module.

**Narrator interjection**:
> *"The student gets it! Our deterministic Finite State Machine (FSM) guarantees that the LLM cannot skip ahead or hallucinate an end to the lesson until the conceptual check passes. By structuring the LLM output into rigid Pydantic data contracts (like `TeachingTurn` and `PedagogicalEvaluation`), we ensure complete control over the teaching loop."*
> ***[AI/LLM Implementation: 15 marks]***

**Visual**: Screen recording scrolling through `golden_trace.json` to prove it's a programmatic state machine, not a black-box LLM prompt.

---

## Scene 5: Conclusion (4:30 - 5:00)
**Visual**: Full team slide (Virtual Hawks).
**Audio (Narrator)**: "By separating the pedagogical state machine from the generative AI, we've built a truly scalable, adaptive, and human-like AI Educator. Thank you from Pair 1, Pair 2, and Pair 3 of the Virtual Hawks!"
