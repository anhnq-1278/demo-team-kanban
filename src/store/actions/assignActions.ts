import type { StoreState } from "@/store/types";
import { appendActivityEntry } from "./activityActions";

export function assignCard(
  state: StoreState,
  boardId: string,
  cardId: string,
  memberId: string | null,
  actor: string
): StoreState {
  const board = state.boards[boardId];
  if (!board) throw new Error(`Board ${boardId} not found`);
  const card = board.cards[cardId];
  if (!card) throw new Error(`Card ${cardId} not found`);

  // Validate memberId if not clearing
  let memberName: string | null = null;
  if (memberId !== null) {
    const member = board.members.find((m) => m.id === memberId);
    if (!member) throw new Error(`Member ${memberId} not found on board`);
    memberName = member.name;
  }

  const now = new Date().toISOString();
  const updatedCard = { ...card, assigneeId: memberId, updatedAt: now };

  let updatedBoard = {
    ...board,
    cards: { ...board.cards, [cardId]: updatedCard },
  };

  updatedBoard = appendActivityEntry(updatedBoard, {
    actor,
    eventType: memberId !== null ? "card_assigned" : "card_unassigned",
    cardId,
    cardTitle: card.title,
    detail: memberId !== null ? `Assigned to ${memberName}` : "Unassigned",
  });

  return {
    ...state,
    boards: { ...state.boards, [boardId]: updatedBoard },
  };
}
