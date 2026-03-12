import { describe, it, expect } from "vitest";
import { createBoard } from "@/store/actions/boardActions";
import {
  createColumn,
  renameColumn,
  deleteColumn,
  reorderColumns,
} from "@/store/actions/columnActions";
import type { StoreState } from "@/store/types";

function stateWithBoard() {
  return createBoard({ boards: {}, activeMemberId: null, activeBoardId: null }, "Test");
}

function getBoardId(state: StoreState) {
  return Object.keys(state.boards)[0];
}

describe("createColumn()", () => {
  it("adds a column to the board", () => {
    let state = stateWithBoard();
    const boardId = getBoardId(state);
    const before = state.boards[boardId].columns.length;
    state = createColumn(state, boardId, "New Col");
    expect(state.boards[boardId].columns.length).toBe(before + 1);
  });

  it("throws for empty name", () => {
    const state = stateWithBoard();
    const boardId = getBoardId(state);
    expect(() => createColumn(state, boardId, "")).toThrow();
  });
});

describe("renameColumn()", () => {
  it("renames a column", () => {
    let state = stateWithBoard();
    const boardId = getBoardId(state);
    const colId = state.boards[boardId].columns[0].id;
    state = renameColumn(state, boardId, colId, "Renamed");
    expect(state.boards[boardId].columns[0].name).toBe("Renamed");
  });
});

describe("deleteColumn()", () => {
  it("removes a column", () => {
    let state = stateWithBoard();
    const boardId = getBoardId(state);
    const colId = state.boards[boardId].columns[0].id;
    const before = state.boards[boardId].columns.length;
    state = deleteColumn(state, boardId, colId);
    expect(state.boards[boardId].columns.length).toBe(before - 1);
  });
});

describe("reorderColumns()", () => {
  it("reorders columns to the given permutation", () => {
    let state = stateWithBoard();
    const boardId = getBoardId(state);
    const cols = state.boards[boardId].columns;
    const reversed = [...cols].reverse().map((c) => c.id);
    state = reorderColumns(state, boardId, reversed);
    expect(state.boards[boardId].columns.map((c) => c.id)).toEqual(reversed);
  });

  it("throws for invalid permutation", () => {
    const state = stateWithBoard();
    const boardId = getBoardId(state);
    expect(() => reorderColumns(state, boardId, ["fake-id"])).toThrow();
  });
});
