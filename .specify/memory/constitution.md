<!--
SYNC IMPACT REPORT
==================
Version change: [template] → 1.0.0 (initial ratification)

Modified principles: N/A (first fill from template)

Added sections:
  - Core Principles (5 principles defined)
  - Technology & Constraints
  - Development Workflow
  - Governance

Removed sections: N/A

Templates checked:
  ✅ .specify/templates/plan-template.md       — Constitution Check gates align with 5 principles
  ✅ .specify/templates/spec-template.md       — Scope/requirements consistent with static-first + simplicity principles
  ✅ .specify/templates/tasks-template.md      — Task categories cover UI components, drag-and-drop, persistence, activity log
  ✅ .specify/templates/constitution-template.md — Source template; no changes required

Follow-up TODOs: None — all placeholders resolved.
-->

# Demo Team Kanban Constitution

## Core Principles

### I. Static-First (NON-NEGOTIABLE)

The application MUST run as a pure static site — plain HTML, CSS, and
client-side JavaScript only. No server-side rendering, no backend API,
no build server is required to serve the app. All persistent state MUST
be stored in the browser (localStorage or IndexedDB). The app MUST be
fully functional when opened directly from the filesystem or served from
any static file host (e.g., GitHub Pages, Netlify).

**Rationale**: Keeps deployment friction at zero for small teams and
eliminates infrastructure cost and complexity.

### II. Component-Driven UI

The UI MUST be structured as discrete, self-contained components:
**Board**, **Column (List)**, and **Card**. Each component owns its
rendering logic and exposes clear inputs/outputs. Global state mutations
MUST only occur through defined store actions — no ad-hoc DOM writes
that bypass state. New UI elements MUST fit the existing component
hierarchy before a new level is introduced.

**Rationale**: Ensures the interface remains maintainable as boards and
cards grow in number, and allows independent testing of each layer.

### III. Data Integrity

All CRUD operations MUST preserve referential integrity:

- Deleting a **Board** MUST cascade-delete its Columns and all their Cards.
- Deleting a **Column** MUST cascade-delete all its Cards.
- Deleting a **Card** MUST remove its comments and activity entries.
- A Card's `assignee` field MUST either be empty or reference a valid
  member name/identifier stored within the same Board's member list.
- Card position order within a Column MUST be persisted and restored on
  reload.

**Rationale**: Orphaned records cause silent data corruption in a
localStorage-backed store with no schema enforcement layer.

### IV. Interaction Fidelity

Drag-and-drop MUST be the primary mechanism for moving Cards between
columns (status transitions: To Do → In Progress → Done and back). Every
status transition MUST produce an Activity Log entry immediately and
atomically with the state change. The drag-and-drop implementation MUST
work on both desktop (mouse) and tablet (touch) viewports without
additional configuration.

**Rationale**: The core value proposition of a Kanban board is visual
task flow. Interaction that breaks or loses state undermines team trust.

### V. Simplicity & YAGNI

The feature scope is permanently fixed to:

- Board creation, renaming, and deletion
- Column management (default 3 columns: **To Do**, **In Progress**, **Done**)
- Card CRUD: title, description, assignee (single member), comments
- Drag-and-drop status transitions
- Basic Activity Log per Board (status changes, assignments, comments)

Features outside this scope (e.g., multi-board sharing, auth, labels,
due-date notifications, integrations) MUST NOT be implemented without a
formal constitution amendment. When in doubt, do less.

**Rationale**: Scope creep is the primary risk for side-project tools.
Constraints protect long-term maintainability.

## Technology & Constraints

**Target platform**: Modern evergreen browsers (Chrome ≥ 110, Firefox ≥ 110,
Safari ≥ 16, Edge ≥ 110). No IE or legacy mobile browser support required.

**Language/Runtime**: Vanilla JavaScript (ES2022+) or TypeScript compiled to
ES modules. No server-side runtime.

**Styling**: Plain CSS or a utility-first CSS framework (e.g., Tailwind CSS
via CDN). CSS-in-JS solutions are prohibited — they add build complexity
incompatible with the Static-First principle.

**State persistence**: `localStorage` is the MUST-use storage layer.
`IndexedDB` MAY be used for large datasets (>500 cards), but MUST fall back
gracefully when unavailable.

**Drag-and-drop**: A lightweight library (e.g., SortableJS) is permitted.
Custom DnD implementations are allowed only if they support pointer events.
No jQuery dependency.

**Build tooling**: Optional. If a bundler (Vite, esbuild) is used, the output
MUST be a self-contained `dist/` of static assets deployable without a Node
runtime. The `dist/` folder MUST be committed if no CI pipeline is configured.

**Performance**: Initial page load MUST complete (DOMContentLoaded) within
2 seconds on a mid-range mobile device on 4G. Total JS payload MUST stay
below 150 KB (gzipped).

**Accessibility**: Interactive elements (cards, buttons, column headers) MUST
have accessible names (`aria-label` or visible text). Keyboard navigation
MUST be possible as an alternative to drag-and-drop for status transitions.

## Development Workflow

**Branching**: Feature work MUST use short-lived branches named
`[###-feature-name]` from `main`. Direct commits to `main` are permitted only
for documentation and hotfixes.

**Review**: Every PR MUST include a self-reviewed Constitution Check confirming
compliance with all five Core Principles before merge.

**Testing**: UI interaction tests (drag-and-drop, CRUD flows) MUST be written
for every user story before the story is considered complete. Unit tests are
REQUIRED for all state-management functions (store actions, cascade deletes,
activity log writes). Test runner: Vitest or Jest (browser environment mode).

**Activity Log format**: Each log entry MUST record
`{ timestamp, actor, action, entityType, entityId, detail }`.
Timestamps MUST be ISO 8601 UTC. `actor` is the current user's display name
or `"anonymous"` when no member is active.

**Commit messages**: Follow Conventional Commits
(`feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`). Constitution
amendments MUST use `docs: amend constitution to vX.Y.Z (...)`.

## Governance

This Constitution supersedes all other written or verbal practices for the
Demo Team Kanban project. In any conflict between a spec, plan, or task
document and this Constitution, the Constitution prevails.

**Amendment procedure**:
1. Open a PR with the proposed change to `.specify/memory/constitution.md`.
2. State the version bump type (MAJOR / MINOR / PATCH) and rationale in the
   PR description.
3. All active contributors MUST review and approve before merge.
4. After merge, update `.specify/templates/` files and runtime docs as needed
   per the Sync Impact Report embedded in the constitution header.

**Versioning policy**:
- MAJOR: Removal or fundamental redefinition of a Core Principle, or removal
  of a mandatory feature from scope.
- MINOR: New principle added, new mandatory section introduced, scope expanded.
- PATCH: Wording clarification, typo fix, non-semantic refinement.

**Compliance review**: Each sprint (or every two weeks) the team MUST review
open issues and PRs against this Constitution. Non-compliant code MUST NOT be
merged; non-compliant code already merged MUST be tracked as a tech-debt issue
and resolved within the next sprint.

**Version**: 1.0.0 | **Ratified**: 2026-03-12 | **Last Amended**: 2026-03-12
