import type { Member, StoreState } from "@/store/types";
import { generateId } from "@/lib/utils";

export function addMember(
  state: StoreState,
  boardId: string,
  name: string
): StoreState {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Member name cannot be empty");
  const board = state.boards[boardId];
  if (!board) throw new Error(`Board ${boardId} not found`);
  if (board.members.length >= 20) throw new Error("Maximum 20 members per board");

  // Case-insensitive dedup
  const exists = board.members.some(
    (m) => m.name.toLowerCase() === trimmed.toLowerCase()
  );
  if (exists) throw new Error(`Member "${trimmed}" already exists on this board`);

  const member: Member = { id: generateId(), name: trimmed };
  return {
    ...state,
    boards: {
      ...state.boards,
      [boardId]: { ...board, members: [...board.members, member] },
    },
  };
}

export function removeMember(
  state: StoreState,
  boardId: string,
  memberId: string
): StoreState {
  const board = state.boards[boardId];
  if (!board) throw new Error(`Board ${boardId} not found`);

  // Cards that are assigned to this member retain their assigneeId (dangling ref)
  return {
    ...state,
    boards: {
      ...state.boards,
      [boardId]: {
        ...board,
        members: board.members.filter((m) => m.id !== memberId),
      },
    },
  };
}

export function setActiveMember(
  state: StoreState,
  memberId: string | null
): StoreState {
  return { ...state, activeMemberId: memberId };
}
