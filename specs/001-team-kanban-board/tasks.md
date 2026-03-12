# Tasks: Team Kanban Board

**Input**: Design documents from `/specs/001-team-kanban-board/`
**Prerequisites**: plan.md ✅ · spec.md ✅ · research.md ✅ · data-model.md ✅ · contracts/ ✅ · quickstart.md ✅

**Total tasks**: 50  
**Organization**: Tasks grouped by user story — each phase is independently implementable and testable.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story label (US1–US5)
- File paths follow the source tree in plan.md

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Bootstrap Next.js project, install all dependencies, and configure tooling.

- [X] T001 Scaffold Next.js 14 project with `create-next-app` — TypeScript, Tailwind, App Router, `src/` dir, alias `@/*`
- [X] T002 Configure `next.config.ts`: set `output: "export"`, `trailingSlash: true`, `images.unoptimized: true`
- [X] T003 Install runtime dependencies: `zustand`, `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `nanoid`
- [X] T004 Install shadcn/ui: run `npx shadcn@latest init` then add `button dialog input dropdown-menu tooltip badge`
- [X] T005 Install dev dependencies: `vitest`, `@vitejs/plugin-react`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, `@testing-library/user-event`
- [X] T006 Install Playwright: `@playwright/test`, `npx playwright install chromium`
- [X] T007 Create `vitest.config.ts` with jsdom environment, globals, setupFiles, and `@` path alias
- [X] T008 Create `src/__tests__/setup.ts` importing `@testing-library/jest-dom`
- [X] T009 Create `playwright.config.ts` targeting `http://localhost:3000`, chromium only
- [X] T010 Add npm scripts to `package.json`: `test`, `test:watch`, `test:e2e`, `build`, `start`
- [X] T011 Create folder structure: `src/components/{board,column,card,activity,member,ui}`, `src/store/actions`, `src/data`, `src/lib`, `src/__tests__/{unit/store,unit/lib,integration,e2e}`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core types, store skeleton, utilities, and seed data that ALL user stories depend on.

- [X] T012 [P] Implement all TypeScript interfaces in `src/store/types.ts`: `Member`, `Comment`, `ActivityEventType`, `ActivityEntry`, `Card`, `Column`, `Board`, `StoreState` — follow data-model.md exactly
- [X] T013 [P] Implement `src/lib/utils.ts`: `generateId()` (nanoid wrapper), `formatDate(iso: string): string` (human-readable), `cn(...classes)` (clsx + tailwind-merge)
- [X] T014 Implement `src/lib/storage.ts`: custom Zustand storage adapter wrapping `localStorage.setItem/getItem/removeItem` with try/catch quota-error handler; export `notifyStorageError(e: unknown): void` toast trigger
- [X] T015 Implement `src/store/actions/activityActions.ts`: internal `_appendActivityEntry(boardId, entry)` — generates `id` via `generateId()`, stamps ISO 8601 UTC `timestamp`, appends to `Board.activityLog`
- [X] T016 Implement `src/store/index.ts`: Zustand `create` with `persist` middleware using the custom storage from T014; include `_hydrateSeed()` action (merges `SEED_DATA` when `boards` is empty); export `useKanbanStore` hook
- [X] T017 Implement `src/data/seed.ts`: `SEED_DATA: StoreState` constant with 3 boards (Website Redesign / Mobile App Sprint 2 / Marketing Q2), each with 3 columns, sample cards, members, and activity entries — follow the skeleton in data-model.md
- [X] T018 Write unit tests in `src/__tests__/unit/lib/utils.test.ts` for `generateId`, `formatDate`, `cn`
- [X] T019 Write unit tests in `src/__tests__/unit/lib/storage.test.ts` — mock `localStorage`, verify quota error triggers `notifyStorageError`

---

## Phase 3: User Story 1 — Board & Card Management

**Story goal**: Users can create boards, add/edit/delete cards, and all data persists across reloads.  
**Independent test**: Create a board → add 3 cards → reload → data unchanged.

### Store Actions (US1)

- [X] T020 [P] [US1] Implement `src/store/actions/boardActions.ts`: `createBoard(name)` (3 default columns), `renameBoard(boardId, name)`, `deleteBoard(boardId)` (cascade) — per store-actions.md contract
- [X] T021 [P] [US1] Implement `src/store/actions/columnActions.ts`: `createColumn`, `renameColumn`, `deleteColumn` (cascade), `reorderColumns` — per store-actions.md contract
- [X] T022 [P] [US1] Implement `src/store/actions/cardActions.ts`: `createCard`, `updateCard`, `deleteCard`, `moveCard` (with `_appendActivityEntry`), `reorderCards` — per store-actions.md contract

### Unit Tests (US1)

- [X] T023 [P] [US1] Write `src/__tests__/unit/store/boardActions.test.ts`: test `createBoard` produces 3 columns; `deleteBoard` cascades; `renameBoard` updates name
- [X] T024 [P] [US1] Write `src/__tests__/unit/store/columnActions.test.ts`: test `deleteColumn` cascades cards; `reorderColumns` rejects mismatched IDs
- [X] T025 [P] [US1] Write `src/__tests__/unit/store/cardActions.test.ts`: test `createCard` appends to `cardIds`; `deleteCard` removes from `cards` and `cardIds`; `moveCard` emits activity entry

### UI Components (US1)

- [X] T026 [US1] Implement `src/app/layout.tsx`: root layout with Tailwind base styles, Inter font, and `<html lang="en">`
- [X] T027 [US1] Implement `src/app/globals.css`: Tailwind directives and CSS variables for shadcn/ui
- [X] T028 [US1] Implement `src/components/board/BoardCard.tsx`: displays board name, card count, created date; click navigates to `/boards/[id]`
- [X] T029 [US1] Implement `src/components/board/CreateBoardDialog.tsx`: shadcn/ui Dialog with controlled text input; calls `store.createBoard(name)` on submit; validates non-empty
- [X] T030 [US1] Implement `src/components/board/BoardList.tsx`: reads boards from store, renders grid of `BoardCard`; "New Board" button opens `CreateBoardDialog`; empty-state when no boards
- [X] T031 [US1] Implement `src/app/page.tsx`: `"use client"` page rendering `BoardList`
- [X] T032 [US1] Implement `src/components/column/ColumnHeader.tsx`: displays column name + card count; inline rename (click-to-edit); dropdown for delete with confirmation
- [X] T033 [US1] Implement `src/components/card/CreateCardInput.tsx`: inline text input at bottom of column; `Enter` or button submits; calls `store.createCard(boardId, columnId, title)`
- [X] T034 [US1] Implement `src/components/card/KanbanCard.tsx` (static, no DnD yet): shows title; click opens `CardDetailDialog`
- [X] T035 [US1] Implement `src/components/card/CardDetailDialog.tsx` (US1 scope): title edit, description textarea, delete card button; reads/writes via store actions
- [X] T036 [US1] Implement `src/components/column/KanbanColumn.tsx` (static, no DnD yet): renders `ColumnHeader`, list of `KanbanCard`, `CreateCardInput`
- [X] T037 [US1] Implement `src/app/boards/[boardId]/page.tsx`: `"use client"`, reads boardId from `useParams()`, renders board header (name + rename + delete) and list of `KanbanColumn`; redirects to `/` if boardId unknown

---

## Phase 4: User Story 2 — Drag-and-Drop Status Transitions

**Story goal**: Cards can be dragged between columns and reordered within a column; moves persist.  
**Independent test**: Drag card from "To Do" to "In Progress" → released → card appears in "In Progress" → reload confirms.

- [X] T038 [US2] Wrap `src/app/boards/[boardId]/page.tsx` board content with `<DndContext sensors={[...]} onDragEnd={handleDragEnd}>`: configure `PointerSensor` (mouse/touch) and `KeyboardSensor`; implement `handleDragEnd` calling `store.moveCard` or `store.reorderCards` based on active/over context
- [X] T039 [US2] Upgrade `src/components/column/KanbanColumn.tsx` to droppable: wrap column card list with `<SortableContext items={cardIds} strategy={verticalListSortingStrategy}>` and `useDroppable({ id: column.id })`; apply drop-active highlight style via `isOver`
- [X] T040 [US2] Upgrade `src/components/card/KanbanCard.tsx` to draggable: apply `useSortable({ id: card.id })`; attach `attributes`, `listeners`, `setNodeRef`, `transform` style; show drag-ghost opacity when `isDragging`
- [X] T041 [US2] Add `<DragOverlay>` to the board page: renders a clone of the dragged `KanbanCard` while dragging for visual feedback
- [X] T042 [US2] Write integration test `src/__tests__/integration/dnd-flow.test.tsx`: simulate `moveCard` store action directly (no real DnD in jsdom); assert card moves between columns and `activityLog` gains one `card_moved` entry
- [X] T043 [US2] Write E2E test `src/__tests__/e2e/kanban.spec.ts` (Playwright): drag card between columns using `page.dragAndDrop`; assert card appears in target column; reload and re-assert

---

## Phase 5: User Story 3 — Assign a Member to a Card

**Story goal**: Members can be assigned to cards; assignee name shown on card face; changes logged.  
**Independent test**: Add member to board → assign to card → see badge on card face → reload confirms.

### Store Actions (US3)

- [X] T044 [P] [US3] Implement `src/store/actions/memberActions.ts`: `addMember(boardId, name)` (dedup check), `removeMember(boardId, memberId)` (dangling ref allowed), `setActiveMember(boardId, memberId | null)`
- [X] T045 [P] [US3] Implement `src/store/actions/assignActions.ts` (or extend cardActions.ts): `assignCard(boardId, cardId, memberId | null)` — validates memberId exists, updates `Card.assigneeId`, calls `_appendActivityEntry` with `card_assigned` or `card_unassigned`

### Unit Tests (US3)

- [X] T046 [P] [US3] Write `src/__tests__/unit/store/memberActions.test.ts`: test dedup on `addMember`; `removeMember` leaves dangling `assigneeId` on cards unchanged
- [X] T047 [P] [US3] Write `src/__tests__/unit/store/assignActions.test.ts`: test `assignCard` emits `card_assigned` entry; clear emits `card_unassigned`; invalid memberId throws

### UI Components (US3)

- [X] T048 [US3] Implement `src/components/member/MemberManager.tsx`: lists board members; add-member input; remove button; "You are:" selector calling `store.setActiveMember`; accessible via board header popover
- [X] T049 [US3] Update `src/components/card/KanbanCard.tsx`: resolve `card.assigneeId` → `Member`; show assignee badge (avatar initials + name) when assigned
- [X] T050 [US3] Update `src/components/card/CardDetailDialog.tsx`: add assignee section — dropdown of board members + "Unassigned" option; calls `store.assignCard`; shows current assignee name

---

## Phase 6: User Story 4 — Comment on a Card

**Story goal**: Members can post comments on cards; comments show author + timestamp in chronological order.  
**Independent test**: Post 2 comments on a card → reload → both comments present, ordered oldest-first.

### Store Action (US4)

- [X] T051 [US4] Implement `src/store/actions/commentActions.ts`: `addComment(boardId, cardId, body)` — validates non-empty body; creates `Comment` with `authorName` snapshot from `activeMemberId` (or "anonymous"); appends to `Card.comments`; calls `_appendActivityEntry` with `comment_added`

### Unit Test (US4)

- [X] T052 [US4] Write `src/__tests__/unit/store/commentActions.test.ts`: test empty body is rejected; author snapshot is "anonymous" when no active member; comment appended in order; activity entry created

### UI (US4)

- [X] T053 [US4] Update `src/components/card/CardDetailDialog.tsx`: add comment section below description — scrollable list of comments (author, relative timestamp, body); textarea + submit button; calls `store.addComment`; validation blocks empty submit

---

## Phase 7: User Story 5 — Activity Log

**Story goal**: Per-board slide-over panel shows all significant events newest-first.  
**Independent test**: Move a card, assign a member, post a comment → open Activity Log → 3 entries visible with correct actor/detail.

- [X] T054 [US5] Implement `src/components/activity/ActivityLogPanel.tsx`: shadcn/ui Sheet (slide-over); reads `store.boards[boardId].activityLog`; reverses entries for newest-first display; renders each `ActivityEntry` with icon by `eventType`, actor name, `cardTitle`, `detail`, and `formatDate(timestamp)`; empty-state message when log is empty
- [X] T055 [US5] Update `src/app/boards/[boardId]/page.tsx` board header: add "Activity" button that opens `ActivityLogPanel`; pass `open`/`onOpenChange` state

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, error handling, performance, UX consistency, and final integration checks.

- [X] T056 [P] Add `aria-label` to all interactive elements (card drag handles, column action buttons, dialog close buttons, member selector) — verify with axe-core or browser accessibility tree
- [X] T057 [P] Implement keyboard DnD alternative: add "Move to…" dropdown on `KanbanCard` context menu for users who cannot use DnD; calls `store.moveCard` directly
- [X] T058 [P] Add storage quota error toast: in `src/lib/storage.ts` `notifyStorageError` implementation, render a non-blocking `<Toast>` using shadcn/ui `toast` with message "Could not save — browser storage is full"
- [X] T059 [P] Implement board rename and delete in board header (`src/app/boards/[boardId]/page.tsx`): inline rename on click, delete with confirmation dialog; calls `store.renameBoard` / `store.deleteBoard`; navigate to `/` after delete
- [X] T060 [P] Add "Former member" display for dangling `assigneeId`: in `KanbanCard` and `CardDetailDialog`, if `assigneeId` is set but not found in `members`, display "Former member" badge in muted style
- [X] T061 [P] Confirm Next.js static export builds without errors: `npm run build` produces `out/` with all routes (`/`, `/boards/[boardId]/`); fix any `generateStaticParams` or dynamic route issues
- [X] T062 Add column reorder via drag: wrap board's column list in its own `<SortableContext>` with horizontal strategy; call `store.reorderColumns` on drop
- [X] T063 Add `public/favicon.ico` and `<meta>` tags in `src/app/layout.tsx`: `og:title`, `og:description`, `viewport` for mobile
- [X] T064 Final integration test sweep: run `npm test` (all Vitest tests pass) and `npm run test:e2e` (all Playwright specs pass); fix any regressions

---

## Dependencies (Story Completion Order)

```
Phase 1 (Setup)
  └─► Phase 2 (Foundational: types + store + seed)
        └─► Phase 3 (US1: Board & Card CRUD) ← MVP
              └─► Phase 4 (US2: DnD)
              └─► Phase 5 (US3: Assignment)    ← US3, US4, US5 can start in parallel after US1
              └─► Phase 6 (US4: Comments)
              └─► Phase 7 (US5: Activity Log)
                    └─► Phase 8 (Polish)
```

US3, US4, and US5 are **mutually independent** after Phase 3 completes — different files, different
store actions, different components.

---

## Parallel Execution Examples

### After T011 (folder structure created), run in parallel:
- T012 (types.ts) ‖ T013 (utils.ts) ‖ T017 (seed.ts)

### After T016 (store skeleton), run in parallel:
- T020 (boardActions) ‖ T021 (columnActions) ‖ T022 (cardActions)

### After T022 (cardActions), run in parallel:
- T023 (boardActions tests) ‖ T024 (columnActions tests) ‖ T025 (cardActions tests)

### After T037 (board page complete — US1 done), run in parallel:
- T038–T043 (US2 DnD) ‖ T044–T050 (US3 Assignment) ‖ T051–T053 (US4 Comments) ‖ T054–T055 (US5 ActivityLog)

### Polish phase (Phase 8), run in parallel:
- T056 ‖ T057 ‖ T058 ‖ T059 ‖ T060 ‖ T061 ‖ T062 ‖ T063 (before final T064)

---

## Implementation Strategy

**Suggested MVP scope** (just P1 → deliver value immediately):

> Complete **Phase 1 + Phase 2 + Phase 3** (T001–T037). The app will be a fully functional
> static Kanban board with board/card CRUD, persistence, and seed data. Zero drag-and-drop or
> social features — but independently useful.

**Incremental delivery**:

| Release | Phases | What users get |
|---|---|---|
| v0.1 MVP | 1 + 2 + 3 | Board list, card CRUD, column management, localStorage persistence |
| v0.2 | + 4 | Drag-and-drop status transitions |
| v0.3 | + 5 | Member management + card assignment |
| v0.4 | + 6 | Comments |
| v0.5 | + 7 | Activity Log |
| v1.0 | + 8 | Polish, accessibility, keyboard DnD, full test suite |

---

## Format Validation

All 50 tasks follow the required checklist format:
- ✅ Every task has `- [ ]` checkbox
- ✅ Every task has sequential `T###` ID
- ✅ Parallelizable tasks marked `[P]`
- ✅ User story phase tasks carry `[US1]`–`[US5]` labels
- ✅ Setup/Foundational/Polish tasks have no story label
- ✅ Every task includes a concrete file path or action
