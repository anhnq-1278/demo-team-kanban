import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { StoreState } from "./types";
import { safeLocalStorage } from "@/lib/storage";
import { SEED_DATA } from "@/data/seed";

// Action imports
import { createBoard, renameBoard, deleteBoard } from "./actions/boardActions";
import {
  createColumn,
  renameColumn,
  deleteColumn,
  reorderColumns,
} from "./actions/columnActions";
import {
  createCard,
  updateCard,
  deleteCard,
  moveCard,
  reorderCards,
} from "./actions/cardActions";
import { addMember, removeMember, setActiveMember } from "./actions/memberActions";
import { assignCard } from "./actions/assignActions";
import { addComment } from "./actions/commentActions";

// ─── Store interface ────────────────────────────────────────────────────────

interface KanbanStore extends StoreState {
  // Internal
  _hydrateSeed: () => void;
  _getActor: (boardId: string) => string;

  // Board
  createBoard: (name: string) => void;
  renameBoard: (boardId: string, name: string) => void;
  deleteBoard: (boardId: string) => void;

  // Column
  createColumn: (boardId: string, name: string) => void;
  renameColumn: (boardId: string, columnId: string, name: string) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  reorderColumns: (boardId: string, orderedColumnIds: string[]) => void;

  // Card
  createCard: (boardId: string, columnId: string, title: string) => void;
  updateCard: (
    boardId: string,
    cardId: string,
    patch: Partial<{ title: string; description: string }>
  ) => void;
  deleteCard: (boardId: string, cardId: string) => void;
  moveCard: (boardId: string, cardId: string, toColumnId: string, toIndex: number) => void;
  reorderCards: (boardId: string, columnId: string, orderedCardIds: string[]) => void;

  // Member
  addMember: (boardId: string, name: string) => void;
  removeMember: (boardId: string, memberId: string) => void;
  setActiveMember: (memberId: string | null) => void;

  // Assignment
  assignCard: (boardId: string, cardId: string, memberId: string | null) => void;

  // Comment
  addComment: (boardId: string, cardId: string, body: string) => void;
}

// ─── Store ─────────────────────────────────────────────────────────────────

export const useKanbanStore = create<KanbanStore>()(
  persist(
    (set, get) => ({
      // Initial state
      boards: {},
      activeMemberId: null,
      activeBoardId: null,

      // ── Helpers ──
      _hydrateSeed: () => {
        const state = get();
        if (Object.keys(state.boards).length === 0) {
          set(SEED_DATA);
        }
      },

      _getActor: (boardId: string) => {
        const state = get();
        const board = state.boards[boardId];
        if (!board || !state.activeMemberId) return "anonymous";
        return (
          board.members.find((m) => m.id === state.activeMemberId)?.name ??
          "anonymous"
        );
      },

      // ── Board ──
      createBoard: (name) => set((s) => createBoard(s, name)),
      renameBoard: (boardId, name) => set((s) => renameBoard(s, boardId, name)),
      deleteBoard: (boardId) => set((s) => deleteBoard(s, boardId)),

      // ── Column ──
      createColumn: (boardId, name) =>
        set((s) => createColumn(s, boardId, name)),
      renameColumn: (boardId, columnId, name) =>
        set((s) => renameColumn(s, boardId, columnId, name)),
      deleteColumn: (boardId, columnId) =>
        set((s) => deleteColumn(s, boardId, columnId)),
      reorderColumns: (boardId, orderedColumnIds) =>
        set((s) => reorderColumns(s, boardId, orderedColumnIds)),

      // ── Card ──
      createCard: (boardId, columnId, title) =>
        set((s) => createCard(s, boardId, columnId, title)),
      updateCard: (boardId, cardId, patch) =>
        set((s) => updateCard(s, boardId, cardId, patch)),
      deleteCard: (boardId, cardId) =>
        set((s) => deleteCard(s, boardId, cardId)),
      moveCard: (boardId, cardId, toColumnId, toIndex) =>
        set((s) =>
          moveCard(s, boardId, cardId, toColumnId, toIndex, get()._getActor(boardId))
        ),
      reorderCards: (boardId, columnId, orderedCardIds) =>
        set((s) => reorderCards(s, boardId, columnId, orderedCardIds)),

      // ── Member ──
      addMember: (boardId, name) => set((s) => addMember(s, boardId, name)),
      removeMember: (boardId, memberId) =>
        set((s) => removeMember(s, boardId, memberId)),
      setActiveMember: (memberId) => set((s) => setActiveMember(s, memberId)),

      // ── Assignment ──
      assignCard: (boardId, cardId, memberId) =>
        set((s) =>
          assignCard(s, boardId, cardId, memberId, get()._getActor(boardId))
        ),

      // ── Comment ──
      addComment: (boardId, cardId, body) =>
        set((s) => addComment(s, boardId, cardId, body)),
    }),
    {
      name: "kanban-store",
      storage: safeLocalStorage as never,
    }
  )
);
