# Contract: UI Component Props

**Branch**: `001-team-kanban-board` | **Date**: 2026-03-12  
**Source files**: `src/components/`

These contracts define the external interface of each major UI component. Implementation details
(hooks, internal state) are not prescribed here. Components must not mutate store state directly
— they call store actions from `store-actions.md`.

---

## `BoardList`

**File**: `src/components/board/BoardList.tsx`  
**Purpose**: Home page — displays all boards as a grid of cards; hosts "New Board" trigger.

```ts
// No explicit props — reads directly from Zustand store
// boards: Board[] from useKanbanStore(s => Object.values(s.boards))
```

**Renders**: A `BoardCard` for each board, a "New Board" button.  
**User interactions**: Click board → navigate to `/boards/[boardId]`; click "New Board" → open
`CreateBoardDialog`.

---

## `BoardCard`

**File**: `src/components/board/BoardCard.tsx`

```ts
interface BoardCardProps {
  board: Pick<Board, "id" | "name" | "createdAt">;
  cardCount: number;   // precomputed: sum of all cards across all columns
}
```

---

## `CreateBoardDialog`

**File**: `src/components/board/CreateBoardDialog.tsx`

```ts
interface CreateBoardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Calls**: `store.createBoard(name)` on submit.

---

## `KanbanColumn`

**File**: `src/components/column/KanbanColumn.tsx`  
**Purpose**: Droppable container. Renders its cards as sortable items.

```ts
interface KanbanColumnProps {
  boardId: string;
  column: Column;
  cards: Card[];        // pre-resolved from Column.cardIds → Board.cards lookup
  members: Member[];    // board members for assignee display
}
```

**DnD role**: `useDroppable({ id: column.id })`.  
**Renders**: `ColumnHeader`, list of `KanbanCard`, `CreateCardInput`.

---

## `ColumnHeader`

**File**: `src/components/column/ColumnHeader.tsx`

```ts
interface ColumnHeaderProps {
  boardId: string;
  column: Pick<Column, "id" | "name">;
  cardCount: number;
}
```

**Calls**: `store.renameColumn(...)`, `store.deleteColumn(...)`.

---

## `KanbanCard`

**File**: `src/components/card/KanbanCard.tsx`  
**Purpose**: Draggable card face. Shows title + assignee badge.

```ts
interface KanbanCardProps {
  boardId: string;
  card: Card;
  assignee: Member | null;  // resolved from card.assigneeId
}
```

**DnD role**: `useSortable({ id: card.id })`.  
**User interactions**: Click → open `CardDetailDialog`.

---

## `CardDetailDialog`

**File**: `src/components/card/CardDetailDialog.tsx`  
**Purpose**: Full card editor — title, description, assignee selector, comment list.

```ts
interface CardDetailDialogProps {
  boardId: string;
  cardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Reads** card data from store by `cardId`.  
**Calls**: `store.updateCard(...)`, `store.assignCard(...)`, `store.addComment(...)`,
`store.deleteCard(...)`.

---

## `CreateCardInput`

**File**: `src/components/card/CreateCardInput.tsx`

```ts
interface CreateCardInputProps {
  boardId: string;
  columnId: string;
}
```

**Calls**: `store.createCard(boardId, columnId, title)` on submit.

---

## `ActivityLogPanel`

**File**: `src/components/activity/ActivityLogPanel.tsx`  
**Purpose**: Slide-over panel listing activity entries newest-first.

```ts
interface ActivityLogPanelProps {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

**Reads**: `store.boards[boardId].activityLog` — displayed newest-first (reversed in render).

---

## `MemberManager`

**File**: `src/components/member/MemberManager.tsx`

```ts
interface MemberManagerProps {
  boardId: string;
}
```

**Calls**: `store.addMember(...)`, `store.removeMember(...)`.  
**Also renders**: "You are:" active member selector → calls `store.setActiveMember(...)`.
