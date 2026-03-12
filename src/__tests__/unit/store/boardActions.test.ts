import { describe, it, expect } from "vitest";
import { createBoard, renameBoard, deleteBoard } from "@/store/actions/boardActions";
import type { StoreState } from "@/store/types";

function emptyState(): StoreState {
  return { boards: {}, activeMemberId: null, activeBoardId: null };
}

describe("createBoard()", () => {
  it("adds a board with the given name", () => {
    const state = createBoard(emptyState(), "My Board");
    const boards = Object.values(state.boards);
    expect(boards).toHaveLength(1);
    expect(boards[0].name).toBe("My Board");
  });

  it("creates 3 default columns", () => {
    const state = createBoard(emptyState(), "B");
    const board = Object.values(state.boards)[0];
    expect(board.columns).toHaveLength(3);
  });

  it("throws for empty name", () => {
    expect(() => createBoard(emptyState(), "")).toThrow();
  });

  it("throws for name over 150 chars", () => {
    expect(() => createBoard(emptyState(), "x".repeat(151))).toThrow();
  });
});

describe("renameBoard()", () => {
  it("renames an existing board", () => {
    let state = createBoard(emptyState(), "Old");
    const boardId = Object.keys(state.boards)[0];
    state = renameBoard(state, boardId, "New");
    expect(state.boards[boardId].name).toBe("New");
  });

  it("throws for empty name", () => {
    const state = createBoard(emptyState(), "B");
    const id = Object.keys(state.boards)[0];
    expect(() => renameBoard(state, id, "")).toThrow();
  });

  it("throws for unknown boardId", () => {
    expect(() => renameBoard(emptyState(), "nope", "X")).toThrow();
  });
});

describe("deleteBoard()", () => {
  it("removes the board", () => {
    let state = createBoard(emptyState(), "B");
    const id = Object.keys(state.boards)[0];
    state = deleteBoard(state, id);
    expect(state.boards[id]).toBeUndefined();
  });

  it("throws for unknown boardId", () => {
    expect(() => deleteBoard(emptyState(), "nope")).toThrow();
  });

  it("clears activeBoardId if it matched", () => {
    let state = createBoard(emptyState(), "B");
    const id = Object.keys(state.boards)[0];
    state = { ...state, activeBoardId: id };
    state = deleteBoard(state, id);
    expect(state.activeBoardId).toBeNull();
  });
});
