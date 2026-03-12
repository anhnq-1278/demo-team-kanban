// ─────────────────────────────────────────────
// Core domain types — source of truth for the
// Zustand store and all UI components.
// ─────────────────────────────────────────────

export interface Member {
  id: string;   // nanoid
  name: string; // display name, ≤ 50 chars
}

export interface Comment {
  id: string;
  body: string;        // non-empty, ≤ 2000 chars
  authorName: string;  // snapshot of member name at posting time
  createdAt: string;   // ISO 8601 UTC
}

export type ActivityEventType =
  | "card_moved"
  | "card_assigned"
  | "card_unassigned"
  | "comment_added";

export interface ActivityEntry {
  id: string;
  timestamp: string;          // ISO 8601 UTC
  actor: string;              // member display name or "anonymous"
  eventType: ActivityEventType;
  cardId: string;             // snapshot reference
  cardTitle: string;          // snapshot of card title at event time
  detail: string;             // e.g. "To Do → In Progress"
}

export interface Card {
  id: string;
  title: string;              // non-empty, ≤ 200 chars
  description: string;        // may be empty, ≤ 5000 chars
  assigneeId: string | null;  // Member.id or null
  comments: Comment[];        // ascending by createdAt
  createdAt: string;          // ISO 8601 UTC
  updatedAt: string;          // ISO 8601 UTC
}

export interface Column {
  id: string;
  name: string;       // non-empty, ≤ 100 chars
  cardIds: string[];  // ordered Card.id list
}

export interface Board {
  id: string;
  name: string;                      // non-empty, ≤ 150 chars
  columns: Column[];                 // ordered left-to-right
  cards: Record<string, Card>;       // Card.id → Card (flat map)
  members: Member[];
  activityLog: ActivityEntry[];      // append-only, ascending
  createdAt: string;                 // ISO 8601 UTC
}

export interface StoreState {
  boards: Record<string, Board>;     // Board.id → Board
  activeMemberId: string | null;     // persisted "current user"
  activeBoardId: string | null;      // last viewed board
}
