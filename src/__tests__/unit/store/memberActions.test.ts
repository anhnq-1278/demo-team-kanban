import { describe, it, expect } from "vitest";
import { createBoard } from "@/store/actions/boardActions";
import { addMember, removeMember, setActiveMember } from "@/store/actions/memberActions";
import type { StoreState } from "@/store/types";

function stateWithBoard(): StoreState {
  return createBoard({ boards: {}, activeMemberId: null, activeBoardId: null }, "B");
}
function getBoardId(s: StoreState) { return Object.keys(s.boards)[0]; }

describe("addMember()", () => {
  it("adds a member to the board", () => {
    let s = stateWithBoard();
    const bId = getBoardId(s);
    s = addMember(s, bId, "Alice");
    expect(s.boards[bId].members).toHaveLength(1);
    expect(s.boards[bId].members[0].name).toBe("Alice");
  });

  it("throws for duplicate name (case-insensitive)", () => {
    let s = stateWithBoard();
    const bId = getBoardId(s);
    s = addMember(s, bId, "alice");
    expect(() => addMember(s, bId, "Alice")).toThrow();
  });

  it("throws for empty name", () => {
    const s = stateWithBoard();
    const bId = getBoardId(s);
    expect(() => addMember(s, bId, "")).toThrow();
  });

  it("throws when member limit (20) reached", () => {
    let s = stateWithBoard();
    const bId = getBoardId(s);
    for (let i = 0; i < 20; i++) s = addMember(s, bId, `M${i}`);
    expect(() => addMember(s, bId, "Extra")).toThrow();
  });
});

describe("removeMember()", () => {
  it("removes a member by ID", () => {
    let s = stateWithBoard();
    const bId = getBoardId(s);
    s = addMember(s, bId, "Bob");
    const mId = s.boards[bId].members[0].id;
    s = removeMember(s, bId, mId);
    expect(s.boards[bId].members).toHaveLength(0);
  });

  it("is a no-op for unknown member ID", () => {
    let s = stateWithBoard();
    const bId = getBoardId(s);
    s = addMember(s, bId, "C");
    const before = s.boards[bId].members.length;
    s = removeMember(s, bId, "unknown-id");
    expect(s.boards[bId].members.length).toBe(before);
  });
});

describe("setActiveMember()", () => {
  it("sets activeMemberId", () => {
    let s = stateWithBoard();
    s = setActiveMember(s, "some-id");
    expect(s.activeMemberId).toBe("some-id");
  });

  it("sets activeMemberId to null", () => {
    let s = stateWithBoard();
    s = { ...s, activeMemberId: "x" };
    s = setActiveMember(s, null);
    expect(s.activeMemberId).toBeNull();
  });
});
