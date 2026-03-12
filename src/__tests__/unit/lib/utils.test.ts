import { describe, it, expect } from "vitest";
import { cn, generateId, formatDate, getInitials } from "@/lib/utils";

describe("cn()", () => {
  it("merges class names", () => {
    expect(cn("a", "b")).toBe("a b");
  });

  it("resolves tailwind conflicts (last wins)", () => {
    const result = cn("p-4", "p-2");
    expect(result).toBe("p-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "nope", "yes")).toBe("base yes");
  });
});

describe("generateId()", () => {
  it("returns a non-empty string", () => {
    const id = generateId();
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(0);
  });

  it("returns unique values", () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateId()));
    expect(ids.size).toBe(100);
  });
});

describe("formatDate()", () => {
  it("returns a string for a valid ISO date", () => {
    const result = formatDate(new Date().toISOString());
    expect(typeof result).toBe("string");
    expect(result.length).toBeGreaterThan(0);
  });

  it("handles past dates gracefully", () => {
    const past = new Date(Date.now() - 1000 * 60 * 5).toISOString();
    const result = formatDate(past);
    expect(result).toBeTruthy();
  });
});

describe("getInitials()", () => {
  it("returns first letter of single word", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("returns first letters of two words", () => {
    expect(getInitials("Alice Bob")).toBe("AB");
  });

  it("returns initials from first 2 space-separated words", () => {
    // "Jean-Claude" and "Van" are separate words by space splitting → J, V
    expect(getInitials("Jean-Claude Van Damme")).toBe("JV");
  });

  it("handles empty string", () => {
    expect(getInitials("")).toBe("");
  });

  it("uppercases result", () => {
    expect(getInitials("alice bob")).toBe("AB");
  });
});
