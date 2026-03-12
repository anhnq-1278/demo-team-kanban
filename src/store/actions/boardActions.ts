import type { Board, Column, StoreState } from "@/store/types";
import { generateId } from "@/lib/utils";

const DEFAULT_COLUMNS = ["To Do", "In Progress", "Done"];

function makeDefaultColumns(): Column[] {
  return DEFAULT_COLUMNS.map((name) => ({
    id: generateId(),
    name,
    cardIds: [],
  }));
}

export function createBoard(state: StoreState, name: string): StoreState {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Board name cannot be empty");
  if (trimmed.length > 150) throw new Error("Board name must be 150 characters or fewer");

  const id = generateId();
  const now = new Date().toISOString();
  const board: Board = {
    id,
    name: trimmed,
    columns: makeDefaultColumns(),
    cards: {},
    members: [],
    activityLog: [],
    createdAt: now,
  };
  return {
    ...state,
    boards: { ...state.boards, [id]: board },
    activeBoardId: id,
  };
}

export function renameBoard(
  state: StoreState,
  boardId: string,
  name: string
): StoreState {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Board name cannot be empty");
  const board = state.boards[boardId];
  if (!board) throw new Error(`Board ${boardId} not found`);

  return {
    ...state,
    boards: {
      ...state.boards,
      [boardId]: { ...board, name: trimmed },
    },
  };
}

export function deleteBoard(state: StoreState, boardId: string): StoreState {
  if (!state.boards[boardId]) throw new Error(`Board ${boardId} not found`);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { [boardId]: _removed, ...rest } = state.boards;
  return {
    ...state,
    boards: rest,
    activeBoardId:
      state.activeBoardId === boardId ? null : state.activeBoardId,
  };
}
