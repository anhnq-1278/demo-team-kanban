import { describe, it, expect } from "vitest";
import { createBoard } from "@/store/actions/boardActions";
import { createCard, updateCard, deleteCard, moveCard, reorderCards } from "@/store/actions/cardActions";
import type { StoreState } from "@/store/types";

function stateWithBoard() {
  return createBoard({ boards: {}, activeMemberId: null, activeBoardId: null }, "T");
}
function getBoardId(s: StoreState) { return Object.keys(s.boards)[0]; }

describe("createCard()", () => {
  it("adds a card to specified column", () => {
    let s = stateWithBoard();
    const bId = getBoardId(s);
    const colId = s.boards[bId].columns[0].id;
    s = createCard(s, bId, colId, "My Card");
    expect(s.boards[bId].columns[0].cardIds.length).toBe(1);
    const cardId = s.boards[bId].columns[0].cardIds[0];
    expect(s.boards[bId].cards[cardId].title).toBe("My Card");
  });

  it("throws for empty title", () => {
    const s = stateWithBoard();
    const bId = getBoardId(s);
    const colId = s.boards[bId].columns[0].id;
    expect(() => createCard(s, bId, colId, "")).toThrow();
  });
});

describe("updateCard()", () => {
  it("updates card title", () => {
    let s = stateWithBoard();
    const bId = getBoardId(s);
    const colId = s.boards[bId].columns[0].id;
    s = createCard(s, bId, colId, "Old");
    const cardId = s.boards[bId].columns[0].cardIds[0];
    s = updateCard(s, bId, cardId, { title: "New" });
    expect(s.boards[bId].cards[cardId].title).toBe("New");
  });
});

describe("deleteCard()", () => {
  it("removes the card from column and cards map", () => {
    let s = stateWithBoard();
    const bId = getBoardId(s);
    const colId = s.boards[bId].columns[0].id;
    s = createCard(s, bId, colId, "X");
    const cardId = s.boards[bId].columns[0].cardIds[0];
    s = deleteCard(s, bId, cardId);
    expect(s.boards[bId].cards[cardId]).toBeUndefined();
    expect(s.boards[bId].columns[0].cardIds).not.toContain(cardId);
  });
});

describe("moveCard()", () => {
  it("moves a card from one column to another", () => {
    let s = stateWithBoard();
    const bId = getBoardId(s);
    const col0 = s.boards[bId].columns[0].id;
    const col1 = s.boards[bId].columns[1].id;
    s = createCard(s, bId, col0, "Move Me");
    const cardId = s.boards[bId].columns[0].cardIds[0];
    s = moveCard(s, bId, cardId, col1, 0, "tester");
    expect(s.boards[bId].columns[0].cardIds).not.toContain(cardId);
    expect(s.boards[bId].columns[1].cardIds).toContain(cardId);
  });
});

describe("reorderCards()", () => {
  it("reorders cards within a column", () => {
    let s = stateWithBoard();
    const bId = getBoardId(s);
    const colId = s.boards[bId].columns[0].id;
    s = createCard(s, bId, colId, "A");
    s = createCard(s, bId, colId, "B");
    const [id1, id2] = s.boards[bId].columns[0].cardIds;
    s = reorderCards(s, bId, colId, [id2, id1]);
    expect(s.boards[bId].columns[0].cardIds[0]).toBe(id2);
    expect(s.boards[bId].columns[0].cardIds[1]).toBe(id1);
  });
});
