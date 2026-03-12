import { describe, it, expect } from "vitest";
import { createBoard } from "@/store/actions/boardActions";
import { createCard } from "@/store/actions/cardActions";
import { addMember } from "@/store/actions/memberActions";
import { assignCard } from "@/store/actions/assignActions";
import type { StoreState } from "@/store/types";

function stateWithCardAndMember(): { s: StoreState; bId: string; cardId: string; memberId: string } {
  let s = createBoard({ boards: {}, activeMemberId: null, activeBoardId: null }, "B");
  const bId = Object.keys(s.boards)[0];
  const colId = s.boards[bId].columns[0].id;
  s = createCard(s, bId, colId, "Card A");
  const cardId = s.boards[bId].columns[0].cardIds[0];
  s = addMember(s, bId, "Alice");
  const memberId = s.boards[bId].members[0].id;
  return { s, bId, cardId, memberId };
}

describe("assignCard()", () => {
  it("assigns a member to a card", () => {
    const { s, bId, cardId, memberId } = stateWithCardAndMember();
    const next = assignCard(s, bId, cardId, memberId, "actor");
    expect(next.boards[bId].cards[cardId].assigneeId).toBe(memberId);
  });

  it("unassigns when memberId is null", () => {
    const { s: initial, bId, cardId, memberId } = stateWithCardAndMember();
    let s = assignCard(initial, bId, cardId, memberId, "actor");
    s = assignCard(s, bId, cardId, null, "actor");
    expect(s.boards[bId].cards[cardId].assigneeId).toBeNull();
  });

  it("logs a card_assigned activity entry", () => {
    const { s, bId, cardId, memberId } = stateWithCardAndMember();
    const before = s.boards[bId].activityLog.length;
    const next = assignCard(s, bId, cardId, memberId, "actor");
    expect(next.boards[bId].activityLog.length).toBe(before + 1);
    expect(next.boards[bId].activityLog.at(-1)?.eventType).toBe("card_assigned");
  });

  it("throws for unknown memberId (non-null)", () => {
    const { s, bId, cardId } = stateWithCardAndMember();
    expect(() => assignCard(s, bId, cardId, "unknown-member", "actor")).toThrow();
  });
});
