/**
 * T042 – Integration test for the DnD move-card flow.
 *
 * These tests exercise the store action layer directly (no DOM / real drag events)
 * to verify that moving a card across columns produces the expected state mutations
 * and activity-log entries.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { moveCard, createCard, reorderCards } from "@/store/actions/cardActions";
import { createBoard } from "@/store/actions/boardActions";
import type { StoreState } from "@/store/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function emptyState(): StoreState {
  return { boards: {}, activeBoardId: null };
}

function buildBoard(): StoreState {
  let s = emptyState();
  // createBoard seeds 3 default columns: "To Do", "In Progress", "Done"
  s = createBoard(s, "Integration Board");
  const boardId = Object.keys(s.boards)[0];
  // Create two cards in the first default column ("To Do")
  s = createCard(s, boardId, s.boards[boardId].columns[0].id, "Card Alpha");
  s = createCard(s, boardId, s.boards[boardId].columns[0].id, "Card Beta");
  return s;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("DnD flow – moveCard integration", () => {
  let state: StoreState;
  let boardId: string;
  let todoColId: string;
  let inProgressColId: string;
  let doneColId: string;
  let cardAlphaId: string;
  let cardBetaId: string;

  beforeEach(() => {
    state = buildBoard();
    boardId = Object.keys(state.boards)[0];
    todoColId = state.boards[boardId].columns[0].id;
    inProgressColId = state.boards[boardId].columns[1].id;
    doneColId = state.boards[boardId].columns[2].id;
    const cardIds = state.boards[boardId].columns[0].cardIds;
    cardAlphaId = cardIds[0];
    cardBetaId = cardIds[1];
  });

  it("moves a card from one column to another", () => {
    const next = moveCard(state, boardId, cardAlphaId, inProgressColId, 0, "tester");
    const board = next.boards[boardId];

    // Card is removed from source column
    expect(board.columns.find((c) => c.id === todoColId)!.cardIds).not.toContain(cardAlphaId);
    // Card is present in target column at position 0
    expect(board.columns.find((c) => c.id === inProgressColId)!.cardIds[0]).toBe(cardAlphaId);
  });

  it("leaves the other card in the source column unchanged", () => {
    const next = moveCard(state, boardId, cardAlphaId, inProgressColId, 0, "tester");
    const todoCardIds = next.boards[boardId].columns.find((c) => c.id === todoColId)!.cardIds;
    expect(todoCardIds).toContain(cardBetaId);
    expect(todoCardIds).toHaveLength(1);
  });

  it("appends a card_moved activity entry", () => {
    const next = moveCard(state, boardId, cardAlphaId, inProgressColId, 0, "tester");
    const log = next.boards[boardId].activityLog;
    const entry = log.find((e) => e.eventType === "card_moved" && e.cardId === cardAlphaId);
    expect(entry).toBeDefined();
    expect(entry!.actor).toBe("tester");
    expect(entry!.detail).toBe("To Do → In Progress");
  });

  it("activity entry detail contains source → target column names", () => {
    const next = moveCard(state, boardId, cardBetaId, doneColId, 0, "alice");
    const log = next.boards[boardId].activityLog;
    const entry = log.find((e) => e.eventType === "card_moved" && e.cardId === cardBetaId);
    expect(entry!.detail).toBe("To Do → Done");
  });

  it("move card to specific index within target column", () => {
    // First move Alpha to In Progress
    let next = moveCard(state, boardId, cardAlphaId, inProgressColId, 0, "tester");
    // Now move Beta to In Progress at index 1 (after Alpha)
    next = moveCard(next, boardId, cardBetaId, inProgressColId, 1, "tester");
    const cardIds = next.boards[boardId].columns.find((c) => c.id === inProgressColId)!.cardIds;
    expect(cardIds[0]).toBe(cardAlphaId);
    expect(cardIds[1]).toBe(cardBetaId);
  });

  it("reorderCards within the same column updates order without activity entry", () => {
    const before = state.boards[boardId].activityLog.length;
    const reversed = [cardBetaId, cardAlphaId];
    const next = reorderCards(state, boardId, todoColId, reversed);
    const cardIds = next.boards[boardId].columns.find((c) => c.id === todoColId)!.cardIds;
    expect(cardIds).toEqual(reversed);
    // No new activity entry
    expect(next.boards[boardId].activityLog).toHaveLength(before);
  });

  it("throws when boardId is invalid", () => {
    expect(() => moveCard(state, "bad-board", cardAlphaId, inProgressColId, 0, "x")).toThrow("bad-board");
  });

  it("throws when cardId is invalid", () => {
    expect(() => moveCard(state, boardId, "bad-card", inProgressColId, 0, "x")).toThrow("bad-card");
  });

  it("throws when target columnId is invalid", () => {
    expect(() => moveCard(state, boardId, cardAlphaId, "bad-col", 0, "x")).toThrow("bad-col");
  });
});
