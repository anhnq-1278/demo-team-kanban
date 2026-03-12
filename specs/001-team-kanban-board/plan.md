# Implementation Plan: Team Kanban Board

**Branch**: `001-team-kanban-board` | **Date**: 2026-03-12 | **Spec**: [spec.md](spec.md)  
**Input**: Feature specification from `/specs/001-team-kanban-board/spec.md`

## Summary

Build a client-side Kanban board static web application for small teams. Users manage Boards, Columns
(To Do / In Progress / Done), and Cards with drag-and-drop status transitions, member assignment,
comments, and an Activity Log. The application is a Next.js static export (no server runtime) styled
with Tailwind CSS. All state is seeded from embedded TypeScript mock data and persisted to
`localStorage`. No backend, no database, no build-time data fetching.

## Technical Context

**Language/Version**: TypeScript 5.x on Node.js 20 LTS  
**Framework**: Next.js 14 (App Router, `output: "export"` — full static export)  
**UI / Styling**: Tailwind CSS 3, shadcn/ui component primitives  
**Drag-and-Drop**: @dnd-kit/core + @dnd-kit/sortable (pointer-events, touch support)  
**State Management**: Zustand 4 (single store, persisted to `localStorage` via `zustand/middleware/persist`)  
**Mock Data**: TypeScript constants in `src/data/seed.ts` — auto-loaded into the store on first run (when `localStorage` is empty)  
**Storage**: `localStorage` only — no database, no API, no server  
**Testing**: Vitest + @testing-library/react (jsdom), Playwright for E2E drag-and-drop flows  
**Target Platform**: Static files served from any CDN / GitHub Pages; modern evergreen browsers  
**Project Type**: Static web application  
**Performance Goals**: LCP < 1.5 s on broadband; Total JS (gzipped) < 150 KB  
**Constraints**: Zero server runtime; no auth; offline-capable; touch + mouse DnD; keyboard-navigable  
**Scale/Scope**: Up to 10 boards × 10 columns × 100 cards each in localStorage; 1–20 members per board

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|---|---|---|
| I. Static-First | ✅ PASS | Next.js `output: "export"` produces pure static assets; no server runtime required |
| II. Component-Driven UI | ✅ PASS | Board / Column / Card mapped to discrete React components; mutations via Zustand store actions only |
| III. Data Integrity | ✅ PASS | Zustand actions enforce cascade-delete and referential integrity; position indexes persisted |
| IV. Interaction Fidelity | ✅ PASS | @dnd-kit handles mouse + touch; every drop triggers store action that writes Activity Log atomically |
| V. Simplicity & YAGNI | ✅ PASS | No auth, no sync, no labels, no notifications — scope matches constitution exactly |

**Post-design re-check**: All five principles still pass after Phase 1 design (see data-model.md and contracts/).

## Project Structure

### Documentation (this feature)

```text
specs/001-team-kanban-board/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   ├── store-actions.md # Zustand store public action contract
│   └── ui-contracts.md  # Component prop contracts
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source Code (repository root)

```text
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (Tailwind base, fonts)
│   ├── page.tsx                  # Board list home page
│   ├── boards/
│   │   └── [boardId]/
│   │       └── page.tsx          # Board detail page (column + card view)
│   └── globals.css               # Tailwind directives
│
├── components/
│   ├── board/
│   │   ├── BoardCard.tsx         # Board list item
│   │   ├── BoardList.tsx         # Home page board grid
│   │   └── CreateBoardDialog.tsx # New board modal
│   ├── column/
│   │   ├── KanbanColumn.tsx      # Droppable column with card list
│   │   └── ColumnHeader.tsx      # Rename / delete column actions
│   ├── card/
│   │   ├── KanbanCard.tsx        # Draggable card face (title + assignee badge)
│   │   ├── CardDetailDialog.tsx  # Full card editor (description, assignee, comments)
│   │   └── CreateCardInput.tsx   # Inline quick-add input
│   ├── activity/
│   │   └── ActivityLogPanel.tsx  # Slide-over log panel
│   ├── member/
│   │   └── MemberManager.tsx     # Add/remove members on a board
│   └── ui/                       # shadcn/ui re-exports (Button, Dialog, Input, etc.)
│
├── store/
│   ├── index.ts                  # Zustand store definition + persist middleware
│   ├── types.ts                  # Shared TypeScript types (Board, Column, Card, etc.)
│   └── actions/
│       ├── boardActions.ts       # createBoard, renameBoard, deleteBoard
│       ├── columnActions.ts      # createColumn, renameColumn, deleteColumn, reorderColumns
│       ├── cardActions.ts        # createCard, updateCard, deleteCard, moveCard, reorderCards
│       ├── memberActions.ts      # addMember, removeMember, setActiveMember
│       ├── commentActions.ts     # addComment
│       └── activityActions.ts   # appendActivityEntry (internal, called by other actions)
│
├── data/
│   └── seed.ts                   # Embedded TypeScript mock data (3 boards, sample cards/members)
│
├── lib/
│   ├── storage.ts                # localStorage read/write helpers + quota-error handler
│   └── utils.ts                  # nanoid wrapper, date formatting, class merge (cn)
│
└── __tests__/
    ├── unit/
    │   ├── store/                 # Action unit tests (boardActions, cardActions, etc.)
    │   └── lib/                   # storage.ts, utils.ts tests
    ├── integration/
    │   └── dnd-flow.test.tsx      # Drag-and-drop state transition + activity log integration
    └── e2e/
        └── kanban.spec.ts         # Playwright: create board → add card → drag → comment

tests/                             # (alias for src/__tests__ if project prefers top-level)
public/                            # Next.js public assets (favicon, og image)
next.config.ts                     # output: "export", basePath if needed
tailwind.config.ts
tsconfig.json
vitest.config.ts
playwright.config.ts
package.json
```

**Structure Decision**: Single Next.js project at repository root. App Router used for clean
page-level routing (`/` board list, `/boards/[boardId]` board detail). No `backend/` or `api/`
directories — the application is entirely client-side.
