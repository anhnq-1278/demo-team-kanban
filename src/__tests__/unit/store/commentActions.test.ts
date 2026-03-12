import { describe, it, expect } from "vitest";
import { createBoard } from "@/store/actions/boardActions";
import { createCard } from "@/store/actions/cardActions";
import { addMember } from "@/store/actions/memberActions";
import { setActiveMember } from "@/store/actions/memberActions";
import { addComment } from "@/store/actions/commentActions";
import type { StoreState } from "@/store/types";

function baseState(): StoreState & { bId: string; cardId: string; memberId: string } {
  let s: StoreState = createBoard({ boards: {}, activeMemberId: null, activeBoardId: null }, "B");
  const bId = Object.keys(s.boards)[0];
  const colId = s.boards[bId].columns[0].id;
  s = createCard(s, bId, colId, "Card");
  const cardId = s.boards[bId].columns[0].cardIds[0];
  s = addMember(s, bId, "Alice");
  const memberId = s.boards[bId].members[0].id;
  s = setActiveMember(s, memberId);
  return Object.assign(s, { bId, cardId, memberId });
}

describe("addComment()", () => {
  it("appends a comment to the card", () => {
    const { bId, cardId, ...s } = baseState();
    const next = addComment(s as StoreState, bId, cardId, "Hello!");
    expect(next.boards[bId].cards[cardId].comments).toHaveLength(1);
    expect(next.boards[bId].cards[cardId].comments[0].body).toBe("Hello!");
  });

  it("sets authorName from active member", () => {
    const { bId, cardId, ...s } = baseState();
    const next = addComment(s as StoreState, bId, cardId, "Hi");
    expect(next.boards[bId].cards[cardId].comments[0].authorName).toBe("Alice");
  });

  it("uses 'anonymous' when no active member", () => {
    const { bId, cardId, ...s } = baseState();
    (s as StoreState).activeMemberId = null;
    const next = addComment(s as StoreState, bId, cardId, "Anon comment");
    expect(next.boards[bId].cards[cardId].comments[0].authorName).toBe("anonymous");
  });

  it("throws for empty body", () => {
    const { bId, cardId, ...s } = baseState();
    expect(() => addComment(s as StoreState, bId, cardId, "  ")).toThrow();
  });

  it("logs a comment_added activity entry", () => {
    const { bId, cardId, ...s } = baseState();
    const before = (s as StoreState).boards[bId].activityLog.length;
    const next = addComment(s as StoreState, bId, cardId, "Note");
    expect(next.boards[bId].activityLog.length).toBe(before + 1);
    expect(next.boards[bId].activityLog.at(-1)?.eventType).toBe("comment_added");
  });
});
