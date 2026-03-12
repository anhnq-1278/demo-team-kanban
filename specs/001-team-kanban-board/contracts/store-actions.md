# Contract: Zustand Store Actions

**Branch**: `001-team-kanban-board` | **Date**: 2026-03-12  
**Source file**: `src/store/index.ts` + `src/store/actions/`

All mutations to application state MUST go through these store actions. Direct state assignment
outside of these actions is prohibited (Constitution Principle II). Every action that moves a
card or changes assignment MUST atomically call `_appendActivityEntry` before returning.

---

## Notation

```
action(params): ReturnType
  Preconditions  — checked at invocation; throw Error if violated
  Postconditions — guaranteed after successful execution
  Side effects   — additional state mutations triggered
```

---

## Board Actions

### `createBoard(name: string): Board`
- **Pre**: `name.trim().length > 0`
- **Post**: New `Board` added to `StoreState.boards` with 3 default columns (To Do, In Progress,
  Done) and empty `cards`, `members`, `activityLog`. `activeBoardId` set to new board `id`.
- **Side**: None

### `renameBoard(boardId: string, name: string): void`
- **Pre**: Board `boardId` exists; `name.trim().length > 0`
- **Post**: `Board.name` updated
- **Side**: None

### `deleteBoard(boardId: string): void`
- **Pre**: Board `boardId` exists
- **Post**: Board and all nested data (columns, cards, comments, activity log) removed from
  store. If `activeBoardId === boardId` → `activeBoardId = null`.
- **Side**: None

---

## Column Actions

### `createColumn(boardId: string, name: string): Column`
- **Pre**: Board exists; `name.trim().length > 0`; board has fewer than 10 columns
- **Post**: New column appended to `Board.columns`
- **Side**: None

### `renameColumn(boardId: string, columnId: string, name: string): void`
- **Pre**: Board and column exist; `name.trim().length > 0`
- **Post**: `Column.name` updated
- **Side**: None

### `deleteColumn(boardId: string, columnId: string): void`
- **Pre**: Board and column exist
- **Post**: All cards in column removed from `Board.cards`. All matching `ActivityEntry` records
  removed. Column removed from `Board.columns`.
- **Side**: Cascade — see data-model.md

### `reorderColumns(boardId: string, orderedColumnIds: string[]): void`
- **Pre**: Board exists; `orderedColumnIds` contains exactly the same IDs as current
  `Board.columns` (no additions or deletions)
- **Post**: `Board.columns` reordered to match provided order
- **Side**: None

---

## Card Actions

### `createCard(boardId: string, columnId: string, title: string): Card`
- **Pre**: Board and column exist; `title.trim().length > 0`
- **Post**: New `Card` added to `Board.cards`; card `id` appended to `Column.cardIds`
- **Side**: None

### `updateCard(boardId: string, cardId: string, patch: Partial<Pick<Card, "title" | "description">>): void`
- **Pre**: Card exists; if `title` provided, must be non-empty after trim
- **Post**: Card fields updated; `updatedAt` refreshed
- **Side**: None

### `moveCard(boardId: string, cardId: string, toColumnId: string, toIndex: number): void`
- **Pre**: Board, card, and target column exist; `toIndex >= 0`
- **Post**: Card `id` removed from its current column's `cardIds`; inserted at `toIndex` in
  target column's `cardIds`. `Card.updatedAt` refreshed.
- **Side**: `_appendActivityEntry` called with `eventType: "card_moved"`, `detail:
  "<fromColumnName> → <toColumnName>"`

### `reorderCards(boardId: string, columnId: string, orderedCardIds: string[]): void`
- **Pre**: Column exists; `orderedCardIds` is a permutation of current `Column.cardIds`
- **Post**: `Column.cardIds` updated to new order
- **Side**: None

### `deleteCard(boardId: string, cardId: string): void`
- **Pre**: Card exists in board
- **Post**: Card removed from `Board.cards`; card `id` removed from its column's `cardIds`;
  all `ActivityEntry` records referencing `cardId` removed from `Board.activityLog`.
- **Side**: Cascade

---

## Member Actions

### `addMember(boardId: string, name: string): Member`
- **Pre**: Board exists; `name.trim().length > 0`; board has fewer than 20 members; no existing
  member in board has the same trimmed name (case-insensitive)
- **Post**: New `Member` appended to `Board.members`
- **Side**: None

### `removeMember(boardId: string, memberId: string): void`
- **Pre**: Member exists in board
- **Post**: Member removed from `Board.members`. Cards currently assigned to this member retain
  their `assigneeId` value as a dangling string (not cleared automatically — visible on card as
  "Former member").
- **Side**: None

### `setActiveMember(boardId: string, memberId: string | null): void`
- **Pre**: If not null, member must exist in board
- **Post**: `StoreState.activeMemberId` updated
- **Side**: None

---

## Assignment Actions

### `assignCard(boardId: string, cardId: string, memberId: string | null): void`
- **Pre**: Card exists; if `memberId` not null, it must exist in `Board.members`
- **Post**: `Card.assigneeId` updated; `Card.updatedAt` refreshed
- **Side**: `_appendActivityEntry` called with:
  - `eventType: "card_assigned"`, `detail: "Assigned to <memberName>"` (when memberId set)
  - `eventType: "card_unassigned"`, `detail: "Unassigned"` (when memberId null)

---

## Comment Actions

### `addComment(boardId: string, cardId: string, body: string): Comment`
- **Pre**: Card exists; `body.trim().length > 0`
- **Post**: New `Comment` appended to `Card.comments`
- **Side**: `_appendActivityEntry` called with `eventType: "comment_added"`, `detail: "Left a comment"`

---

## Internal: Activity Log

### `_appendActivityEntry(boardId, entry: Omit<ActivityEntry, "id" | "timestamp">): void`
- **Visibility**: Internal. Called only by other store actions. Never called directly from components.
- **Pre**: Board exists
- **Post**: New `ActivityEntry` (with generated `id` and current UTC timestamp) appended to
  `Board.activityLog`. Log is never trimmed automatically.
- **Side**: None
