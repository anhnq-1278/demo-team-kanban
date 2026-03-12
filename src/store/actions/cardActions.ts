import type { Card, StoreState } from "@/store/types";
import { generateId } from "@/lib/utils";
import { appendActivityEntry } from "./activityActions";

export function createCard(
  state: StoreState,
  boardId: string,
  columnId: string,
  title: string
): StoreState {
  const trimmed = title.trim();
  if (!trimmed) throw new Error("Card title cannot be empty");
  const board = state.boards[boardId];
  if (!board) throw new Error(`Board ${boardId} not found`);
  const col = board.columns.find((c) => c.id === columnId);
  if (!col) throw new Error(`Column ${columnId} not found`);

  const now = new Date().toISOString();
  const card: Card = {
    id: generateId(),
    title: trimmed,
    description: "",
    assigneeId: null,
    comments: [],
    createdAt: now,
    updatedAt: now,
  };

  return {
    ...state,
    boards: {
      ...state.boards,
      [boardId]: {
        ...board,
        cards: { ...board.cards, [card.id]: card },
        columns: board.columns.map((c) =>
          c.id === columnId ? { ...c, cardIds: [...c.cardIds, card.id] } : c
        ),
      },
    },
  };
}

export function updateCard(
  state: StoreState,
  boardId: string,
  cardId: string,
  patch: Partial<Pick<Card, "title" | "description">>
): StoreState {
  const board = state.boards[boardId];
  if (!board) throw new Error(`Board ${boardId} not found`);
  const card = board.cards[cardId];
  if (!card) throw new Error(`Card ${cardId} not found`);
  if (patch.title !== undefined && !patch.title.trim()) {
    throw new Error("Card title cannot be empty");
  }

  const updated: Card = {
    ...card,
    ...patch,
    title: patch.title?.trim() ?? card.title,
    updatedAt: new Date().toISOString(),
  };

  return {
    ...state,
    boards: {
      ...state.boards,
      [boardId]: { ...board, cards: { ...board.cards, [cardId]: updated } },
    },
  };
}

export function deleteCard(
  state: StoreState,
  boardId: string,
  cardId: string
): StoreState {
  const board = state.boards[boardId];
  if (!board) throw new Error(`Board ${boardId} not found`);
  if (!board.cards[cardId]) throw new Error(`Card ${cardId} not found`);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [cardId]: _removed, ...newCards } = board.cards;
  const newLog = board.activityLog.filter((e) => e.cardId !== cardId);

  return {
    ...state,
    boards: {
      ...state.boards,
      [boardId]: {
        ...board,
        cards: newCards,
        columns: board.columns.map((c) => ({
          ...c,
          cardIds: c.cardIds.filter((id) => id !== cardId),
        })),
        activityLog: newLog,
      },
    },
  };
}

export function moveCard(
  state: StoreState,
  boardId: string,
  cardId: string,
  toColumnId: string,
  toIndex: number,
  actor: string
): StoreState {
  const board = state.boards[boardId];
  if (!board) throw new Error(`Board ${boardId} not found`);
  const card = board.cards[cardId];
  if (!card) throw new Error(`Card ${cardId} not found`);
  const toCol = board.columns.find((c) => c.id === toColumnId);
  if (!toCol) throw new Error(`Column ${toColumnId} not found`);

  // Find source column
  const fromCol = board.columns.find((c) => c.cardIds.includes(cardId));
  const fromColName = fromCol?.name ?? "Unknown";
  const toColName = toCol.name;

  // Build new columns array
  const newColumns = board.columns.map((col) => {
    if (col.id === fromCol?.id && col.id !== toColumnId) {
      return { ...col, cardIds: col.cardIds.filter((id) => id !== cardId) };
    }
    if (col.id === toColumnId) {
      const ids = col.cardIds.filter((id) => id !== cardId);
      ids.splice(toIndex, 0, cardId);
      return { ...col, cardIds: ids };
    }
    return col;
  });

  const now = new Date().toISOString();
  const updatedCard: Card = { ...card, updatedAt: now };

  let updatedBoard = {
    ...board,
    cards: { ...board.cards, [cardId]: updatedCard },
    columns: newColumns,
  };

  // Append activity log entry
  updatedBoard = appendActivityEntry(updatedBoard, {
    actor,
    eventType: "card_moved",
    cardId,
    cardTitle: card.title,
    detail: `${fromColName} → ${toColName}`,
  });

  return {
    ...state,
    boards: { ...state.boards, [boardId]: updatedBoard },
  };
}

export function reorderCards(
  state: StoreState,
  boardId: string,
  columnId: string,
  orderedCardIds: string[]
): StoreState {
  const board = state.boards[boardId];
  if (!board) throw new Error(`Board ${boardId} not found`);
  const col = board.columns.find((c) => c.id === columnId);
  if (!col) throw new Error(`Column ${columnId} not found`);

  return {
    ...state,
    boards: {
      ...state.boards,
      [boardId]: {
        ...board,
        columns: board.columns.map((c) =>
          c.id === columnId ? { ...c, cardIds: orderedCardIds } : c
        ),
      },
    },
  };
}
