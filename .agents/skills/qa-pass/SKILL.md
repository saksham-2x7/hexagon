---
name: QA Pass
description: Runs the full suite of automated QA tools for the frontend (Vitest, aXe, TypeScript compiler).
---

# QA Pass Workflow

This skill executes a complete quality assurance pass on the frontend codebase. Use this workflow after completing a meaningful chunk of UI work or before committing changes.

## Prerequisites
- Ensure the project is using `npm` and standard scripts are defined in `package.json`.

## Steps to Execute

1. **Type Checking**
   - Run `npx tsc --noEmit` to verify type safety across the App Router components.
   - Address any TS2307 or TS2322 errors before proceeding.

2. **Unit & Component Testing**
   - Run `npm run test` (or `npx vitest run`) to verify all isolated logic and standard components via Testing Library.

3. **Accessibility (aXe)**
   - If Playwright aXe tests are configured in the `tests/` directory, run them via `npx playwright test --project=chromium`.
   - Ensure color contrast, ARIA roles, and keyboard navigability pass.

4. **Visual & Responsive Verification**
   - Use the `browser_subagent` to render the page locally (e.g., `http://localhost:3000`).
   - If Playwright drivers are unavailable, manually verify the `npm run dev` console output for React hydration warnings.
