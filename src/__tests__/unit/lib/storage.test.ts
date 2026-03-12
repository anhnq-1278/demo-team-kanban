import { describe, it, expect, beforeEach } from "vitest";
import { safeLocalStorage, registerStorageErrorHandler } from "@/lib/storage";

describe("safeLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("getItem returns null for missing key", () => {
    expect(safeLocalStorage.getItem("missing")).toBeNull();
  });

  it("setItem and getItem round-trip", () => {
    safeLocalStorage.setItem("key", "value");
    expect(safeLocalStorage.getItem("key")).toBe("value");
  });

  it("removeItem deletes the key", () => {
    safeLocalStorage.setItem("del", "x");
    safeLocalStorage.removeItem("del");
    expect(safeLocalStorage.getItem("del")).toBeNull();
  });

  it("handles setItem quota errors gracefully", () => {
    const errors: unknown[] = [];
    registerStorageErrorHandler((e) => errors.push(e));

    // Fill up storage to capacity with a large value to trigger quota
    // In jsdom, localStorage doesn't actually have a quota, so we instead
    // directly test the error path by patching the prototype.
    const originalSetItem = Object.getOwnPropertyDescriptor(
      Storage.prototype,
      "setItem"
    );
    Object.defineProperty(Storage.prototype, "setItem", {
      configurable: true,
      value: () => {
        throw new DOMException("QuotaExceededError");
      },
    });

    expect(() => safeLocalStorage.setItem("big", "data")).not.toThrow();
    expect(errors).toHaveLength(1);

    // Restore original implementation
    Object.defineProperty(Storage.prototype, "setItem", originalSetItem!);
    registerStorageErrorHandler(() => {});
  });

  it("handles getItem errors gracefully", () => {
    vi.spyOn(localStorage, "getItem").mockImplementationOnce(() => {
      throw new Error("security error");
    });
    expect(() => safeLocalStorage.getItem("x")).not.toThrow();
    expect(safeLocalStorage.getItem("x")).toBeNull();
    vi.restoreAllMocks();
  });
});
