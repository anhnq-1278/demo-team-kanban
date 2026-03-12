# Data Model: Team Kanban Board

**Branch**: `001-team-kanban-board` | **Date**: 2026-03-12  
**Source file**: `src/store/types.ts`

All types are pure TypeScript interfaces stored entirely client-side in Zustand (`localStorage`
key: `kanban-store`). No database schema, no ORM, no migration required.

---

## Entity Diagram

```
Board  1 ──────── * Column  1 ──────── * Card  1 ──────── * Comment
  │                                      │
  └── * Member ◄──── assigneeId (FK)─────┘
  └── * ActivityEntry
```

---

## Types

### `Member`

```ts
interface Member {
  id: string;          // nanoid — unique within a board
  name: string;        // Display name, e.g., "Alice"
}
```

**Validation**:
- `name` must be non-empty, ≤ 50 characters
- `id` must be unique within the parent board's `members` array

---

### `Comment`

```ts
interface Comment {
  id: string;          // nanoid
  body: string;        // Plain text, non-empty, ≤ 2000 characters
  authorName: string;  // Snapshot of member name at time of posting
  createdAt: string;  // ISO 8601 UTC, e.g., "2026-03-12T08:00:00.000Z"
}
```

**Notes**:
- `authorName` is a snapshot (denormalised). If the member is later renamed or removed, existing
  comments retain the name at posting time.
- Comments are ordered by `createdAt` ascending (FR-021).

---

### `ActivityEntry`

```ts
type ActivityEventType =
  | "card_moved"        // Card moved between columns
  | "card_assigned"     // Assignee set or changed
  | "card_unassigned"   // Assignee cleared
  | "comment_added";    // Comment posted

interface ActivityEntry {
  id: string;                      // nanoid
  timestamp: string;               // ISO 8601 UTC
  actor: string;                   // Member name or "anonymous"
  eventType: ActivityEventType;
  cardId: string;                  // Reference (snapshot: not a live FK)
  cardTitle: string;               // Snapshot of card title at event time
  detail: string;                  // Human-readable detail string (see below)
}
```

**`detail` format by event type**:

| eventType | detail example |
|---|---|
| `card_moved` | `"To Do → In Progress"` |
| `card_assigned` | `"Assigned to Alice"` |
| `card_unassigned` | `"Unassigned"` |
| `comment_added` | `"Left a comment"` |

**Notes**:
- Entries are append-only (never edited or deleted except via cascade board/card delete).
- Displayed newest-first in the Activity Log panel (FR-026).

---

### `Card`

```ts
interface Card {
  id: string;                // nanoid
  title: string;             // Non-empty, ≤ 200 characters
  description: string;       // Plain text, may be empty, ≤ 5000 characters
  assigneeId: string | null; // Member.id or null
  comments: Comment[];       // Ordered by createdAt ascending
  createdAt: string;         // ISO 8601 UTC
  updatedAt: string;         // ISO 8601 UTC — updated on any field change
}
```

**Validation**:
- `title` must be non-empty after trimming whitespace.
- `assigneeId`, when not null, MUST reference a `Member.id` present in the parent Board's
  `members` array (enforced by the `assignCard` store action at write time; retained as a plain
  string if the member is removed post-assignment).

---

### `Column`

```ts
interface Column {
  id: string;         // nanoid
  name: string;       // Non-empty, ≤ 100 characters
  cardIds: string[];  // Ordered array of Card.id — defines display order
}
```

**Default columns** (created with every new Board):

| order | name |
|---|---|
| 0 | To Do |
| 1 | In Progress |
| 2 | Done |

**Validation**:
- Card order is authoritative within `cardIds`; cards not listed are treated as orphans and
  automatically appended at the bottom on the next store read.
- A Column may have 0 cards (empty column is valid).

---

### `Board`

```ts
interface Board {
  id: string;                   // nanoid
  name: string;                 // Non-empty, ≤ 150 characters
  columns: Column[];            // Ordered — defines left-to-right display order
  cards: Record<string, Card>;  // Card.id → Card (flat hash map for O(1) lookup)
  members: Member[];            // Board-scoped member list
  activityLog: ActivityEntry[]; // Append-only, ascending by timestamp
  createdAt: string;            // ISO 8601 UTC
}
```

**Notes**:
- Cards are stored at the board level (flat `Record<id, Card>`) rather than nested inside
  columns. Column.cardIds holds the ordered references. This avoids duplicating card data and
  simplifies moves (no deep object mutation across column boundaries).
- Deleting a Board removes the entire object including all nested data (FR-002).

---

### `StoreState` (Zustand root)

```ts
interface StoreState {
  boards: Record<string, Board>;   // Board.id → Board
  activeMemberId: string | null;   // Persisted "current user" selection
  activeBoardId: string | null;    // Last viewed board (for UX restore)
}
```

---

## State Transitions

### Card lifecycle

```
[not exists]
     │ createCard()
     ▼
[in Column A]  ──dragEnd()──►  [in Column B]
     │                               │
     │ deleteCard()                  │ deleteCard()
     ▼                               ▼
[deleted — removed from Column.cardIds + Board.cards]
```

### Column cascade delete

```
deleteColumn(columnId)
  → remove all Card.id entries in column.cardIds from Board.cards
  → remove all ActivityEntry where cardId matches any deleted card
  → remove Column from Board.columns
```

### Board cascade delete

```
deleteBoard(boardId)
  → remove Board from StoreState.boards (entire object, all nested data)
  → if activeBoardId === boardId → activeBoardId = null
```

---

## Seed Data Shape (`src/data/seed.ts`)

The seed file exports a value of type `StoreState`. Example skeleton:

```ts
export const SEED_DATA: StoreState = {
  activeMemberId: null,
  activeBoardId: "board-001",
  boards: {
    "board-001": {
      id: "board-001",
      name: "Website Redesign",
      createdAt: "2026-03-01T09:00:00.000Z",
      members: [
        { id: "m-001", name: "Alice" },
        { id: "m-002", name: "Bob" },
        { id: "m-003", name: "Carol" },
      ],
      columns: [
        { id: "col-001", name: "To Do",       cardIds: ["card-001", "card-002"] },
        { id: "col-002", name: "In Progress", cardIds: ["card-003"] },
        { id: "col-003", name: "Done",        cardIds: ["card-004", "card-005", "card-006"] },
      ],
      cards: {
        "card-001": {
          id: "card-001", title: "Define color palette", description: "",
          assigneeId: "m-001", comments: [], createdAt: "2026-03-01T10:00:00.000Z", updatedAt: "2026-03-01T10:00:00.000Z"
        },
        // ... more cards
      },
      activityLog: [
        {
          id: "act-001", timestamp: "2026-03-02T11:00:00.000Z", actor: "Alice",
          eventType: "card_moved", cardId: "card-003", cardTitle: "Design homepage wireframe",
          detail: "To Do → In Progress"
        }
      ]
    },
    // "board-002", "board-003" follow same shape
  }
};
```
