# Research: Team Kanban Board

**Branch**: `001-team-kanban-board` | **Date**: 2026-03-12  
**Status**: Complete — no NEEDS CLARIFICATION markers remain

---

## 1. Static Export with Next.js App Router

**Decision**: Use Next.js 14 App Router with `output: "export"` in `next.config.ts`.

**Rationale**: App Router is the current Next.js default and provides first-class TypeScript,
layouts, and metadata APIs. `output: "export"` produces a `dist/` (or `out/`) directory of
pure static HTML/CSS/JS with no Node.js runtime dependency. The output can be served from
GitHub Pages, Netlify static, S3, or opened directly from the filesystem — satisfying the
Static-First constitution principle.

**Key constraint**: App Router static export does not support Server Components that fetch data
at build time via `fetch`. All data originates from client-side Zustand store (seeded from
`src/data/seed.ts`). Route params (`/boards/[boardId]`) require `generateStaticParams()` when
generating static paths — but since board IDs are runtime-generated (not build-time known), the
page must use `"use client"` and read the boardId from `useParams()`. `dynamicParams = false`
is set to avoid 404 on unknown routes at export time; unknown boardIds redirect to home.

**Alternatives rejected**:
- *Vite + React SPA*: Viable but loses Next.js routing conventions and would require manual
  file-based routing setup. Next.js static export is equally simple and more familiar for teams.
- *Plain HTML/Vanilla JS*: Too much boilerplate for component composition; TypeScript type safety
  is valuable for the store's data integrity requirements.

---

## 2. Drag-and-Drop: @dnd-kit vs SortableJS

**Decision**: Use `@dnd-kit/core` + `@dnd-kit/sortable`.

**Rationale**: @dnd-kit is the de-facto standard for React drag-and-drop in 2025–2026. It:
- Is React-native (not a jQuery wrapper or imperative DOM lib)
- Supports both mouse (PointerEvent) and touch out of the box
- Provides keyboard accessibility (`KeyboardSensor`) — required by the constitution
- Has zero peer dependencies beyond React
- Bundle size: ~12 KB gzipped for core + sortable

**SortableJS rejected**: Imperative DOM API requires ref-heavy integration in React. Does not
expose a React state model; synchronising drops back into Zustand requires custom adapter code
that is structurally more fragile than @dnd-kit's `onDragEnd` callback.

**Implementation pattern**:
```
DndContext (wraps entire board page)
  ├── SortableContext (per column, items = cardIds in order)
  │   └── KanbanCard (useSortable hook)
  └── onDragEnd → store.moveCard(cardId, toColumnId, newIndex)
                → store.appendActivityEntry(...)
```

---

## 3. State Management: Zustand + localStorage Persistence

**Decision**: Zustand 4 with `persist` middleware targeting `localStorage`.

**Rationale**: Zustand's `persist` middleware serialises the entire store to a single
`localStorage` key (`kanban-store`) on every write. This satisfies:
- FR-028 (all data survives tab close/reopen)
- FR-029 (storage errors surfaced via `onRehydrationStorage` callback)

The store is seeded once: on first mount, if the persisted state is empty, the seed data from
`src/data/seed.ts` is merged in via a `_hydrateSeed()` action.

**Alternatives rejected**:
- *IndexedDB*: Higher capacity but async API adds significant complexity; the expected data
  volume (< 500 cards) is well within localStorage's 5 MB limit.
- *Redux Toolkit*: More boilerplate; Zustand is lighter and sufficient for this scope.
- *React Context + useReducer*: No built-in persistence; would require custom serialisation.

**Storage quota handling** (FR-029):
```ts
// lib/storage.ts
storage: {
  setItem: (name, value) => {
    try { localStorage.setItem(name, value) }
    catch (e) { notifyStorageError(e) }  // toast notification
  }
}
```

---

## 4. Mock Data Strategy

**Decision**: Embed seed data as a TypeScript constant in `src/data/seed.ts`. The file exports
a `SEED_DATA: StoreState` object with 3 pre-built boards, 3 columns each, and sample cards,
members, and activity log entries. It is plain TypeScript — no JSON import, no external file
fetch, no build-time transformation.

**Rationale**: Satisfies the "no database, data embedded in source code" requirement. TypeScript
constants are type-checked against the store's `StoreState` type, so mock data and schema can
never drift silently. The seed is tree-shaken out of production bundles if seeding is disabled
(a `NEXT_PUBLIC_SEED=false` env var can skip it for empty-state demos).

**Seed content**:
- **Board 1** — "Website Redesign": 3 columns, 6 cards, 3 members (Alice, Bob, Carol)
- **Board 2** — "Mobile App Sprint 2": 3 columns, 5 cards, 2 members (Dave, Eve)
- **Board 3** — "Marketing Q2": 3 columns, 4 cards, 2 members (Frank, Grace)

---

## 5. Tailwind CSS Configuration

**Decision**: Tailwind CSS 3 via PostCSS. Optional: shadcn/ui for accessible primitive
components (Dialog, Dropdown, Tooltip).

**Rationale**: Tailwind is already a first-class citizen in the Next.js starter ecosystem. The
`create-next-app` scaffold installs it automatically. shadcn/ui provides copy-paste accessible
components (Dialog for card detail, DropdownMenu for column actions) without adding a full
component library runtime.

**Alternative rejected**: Styled-components / Emotion — violates the constitution's prohibition
on CSS-in-JS solutions.

---

## 6. Testing Strategy

**Decision**:
- **Unit**: Vitest + jsdom for Zustand action logic (cascade delete, activity log writes,
  referential integrity)
- **Integration**: @testing-library/react for component + store interaction flows (e.g., drag
  triggers activity log entry)
- **E2E**: Playwright for full browser DnD simulation and cross-tab persistence checks

**Rationale**: Vitest shares the TypeScript config with the main app and runs fast in CI.
Playwright is required because jsdom does not support real pointer events for drag-and-drop
testing.

---

## 7. Resolved Clarifications

| Question | Resolution |
|---|---|
| How is the "current user" / actor determined? | User selects their name from the board's member list via a "You are:" selector in the board header. Selection stored in a separate `activeMemberId` key in localStorage. Defaults to `"anonymous"` if not set. |
| Are columns fixed (To Do / In Progress / Done) or configurable? | Defaulted to 3 named columns on board creation; users can rename and add more (up to 10 per board per constitution). |
| Card ordering within column after DnD — index or linked list? | Array of ordered card IDs per column. On move/reorder, the array is spliced and re-saved. Cheap for the expected card count. |
| Should Activity Log entries be paginated? | No — displayed as a flat scrollable list. Oldest entries scroll off view naturally; no deletion needed per constitution. |
| TypeScript strict mode? | Yes — `"strict": true` in tsconfig.json. All store types must be fully typed. |
