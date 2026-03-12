import type { Comment, StoreState } from "@/store/types";
import { generateId } from "@/lib/utils";
import { appendActivityEntry } from "./activityActions";

export function addComment(
  state: StoreState,
  boardId: string,
  cardId: string,
  body: string
): StoreState {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("Comment body cannot be empty");

  const board = state.boards[boardId];
  if (!board) throw new Error(`Board ${boardId} not found`);
  const card = board.cards[cardId];
  if (!card) throw new Error(`Card ${cardId} not found`);

  // Resolve current actor name
  const actor =
    state.activeMemberId !== null
      ? (board.members.find((m) => m.id === state.activeMemberId)?.name ??
        "anonymous")
      : "anonymous";

  const comment: Comment = {
    id: generateId(),
    body: trimmed,
    authorName: actor,
    createdAt: new Date().toISOString(),
  };

  const now = new Date().toISOString();
  const updatedCard = {
    ...card,
    comments: [...card.comments, comment],
    updatedAt: now,
  };

  let updatedBoard = {
    ...board,
    cards: { ...board.cards, [cardId]: updatedCard },
  };

  updatedBoard = appendActivityEntry(updatedBoard, {
    actor,
    eventType: "comment_added",
    cardId,
    cardTitle: card.title,
    detail: "Left a comment",
  });

  return {
    ...state,
    boards: { ...state.boards, [boardId]: updatedBoard },
  };
}
