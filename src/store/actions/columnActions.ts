import type { Column, StoreState } from "@/store/types";
import { generateId } from "@/lib/utils";

export function createColumn(
  state: StoreState,
  boardId: string,
  name: string
): StoreState {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Column name cannot be empty");
  const board = state.boards[boardId];
  if (!board) throw new Error(`Board ${boardId} not found`);
  if (board.columns.length >= 10) throw new Error("Maximum 10 columns per board");

  const col: Column = { id: generateId(), name: trimmed, cardIds: [] };
  return {
    ...state,
    boards: {
      ...state.boards,
      [boardId]: { ...board, columns: [...board.columns, col] },
    },
  };
}

export function renameColumn(
  state: StoreState,
  boardId: string,
  columnId: string,
  name: string
): StoreState {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Column name cannot be empty");
  const board = state.boards[boardId];
  if (!board) throw new Error(`Board ${boardId} not found`);

  return {
    ...state,
    boards: {
      ...state.boards,
      [boardId]: {
        ...board,
        columns: board.columns.map((c) =>
          c.id === columnId ? { ...c, name: trimmed } : c
        ),
      },
    },
  };
}

export function deleteColumn(
  state: StoreState,
  boardId: string,
  columnId: string
): StoreState {
  const board = state.boards[boardId];
  if (!board) throw new Error(`Board ${boardId} not found`);

  const col = board.columns.find((c) => c.id === columnId);
  if (!col) throw new Error(`Column ${columnId} not found`);

  // Collect card ids to remove
  const removedCardIds = new Set(col.cardIds);

  // Remove cards from the flat map
  const newCards = { ...board.cards };
  removedCardIds.forEach((cid) => delete newCards[cid]);

  // Remove activity entries referencing deleted cards
  const newLog = board.activityLog.filter(
    (e) => !removedCardIds.has(e.cardId)
  );

  return {
    ...state,
    boards: {
      ...state.boards,
      [boardId]: {
        ...board,
        columns: board.columns.filter((c) => c.id !== columnId),
        cards: newCards,
        activityLog: newLog,
      },
    },
  };
}

export function reorderColumns(
  state: StoreState,
  boardId: string,
  orderedColumnIds: string[]
): StoreState {
  const board = state.boards[boardId];
  if (!board) throw new Error(`Board ${boardId} not found`);

  const existing = new Set(board.columns.map((c) => c.id));
  const incoming = new Set(orderedColumnIds);
  const same =
    existing.size === incoming.size &&
    Array.from(existing).every((id) => incoming.has(id));
  if (!same) throw new Error("orderedColumnIds must be a permutation of existing column IDs");

  const colMap = Object.fromEntries(board.columns.map((c) => [c.id, c]));
  return {
    ...state,
    boards: {
      ...state.boards,
      [boardId]: {
        ...board,
        columns: orderedColumnIds.map((id) => colMap[id]),
      },
    },
  };
}
