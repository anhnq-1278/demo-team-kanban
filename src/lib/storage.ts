import { type StateStorage } from "zustand/middleware";

type StorageErrorCallback = (error: unknown) => void;

let _onError: StorageErrorCallback | null = null;

/**
 * Register a callback that fires when a localStorage write fails
 * (e.g. storage quota exceeded). Call this once at app startup.
 */
export function registerStorageErrorHandler(cb: StorageErrorCallback): void {
  _onError = cb;
}

export function notifyStorageError(error: unknown): void {
  if (_onError) {
    _onError(error);
  } else {
    console.error("[kanban] localStorage write failed:", error);
  }
}

/**
 * Custom Zustand storage adapter that wraps localStorage and
 * surfaces quota errors via notifyStorageError instead of throwing.
 */
export const safeLocalStorage: StateStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch (error) {
      notifyStorageError(error);
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {
      // ignore removal errors
    }
  },
};
