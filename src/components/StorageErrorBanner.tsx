"use client";

import { useEffect, useState } from "react";
import { registerStorageErrorHandler } from "@/lib/storage";
import { AlertTriangle, X } from "lucide-react";

export default function StorageErrorBanner() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("Storage quota exceeded. Changes may not be saved.");

  useEffect(() => {
    registerStorageErrorHandler((err) => {
      const isQuota =
        err instanceof DOMException &&
        (err.name === "QuotaExceededError" || err.name === "NS_ERROR_DOM_QUOTA_REACHED");
      setMessage(
        isQuota
          ? "Storage quota exceeded — some changes could not be saved."
          : "Failed to save data to local storage."
      );
      setVisible(true);
    });
  }, []);

  if (!visible) return null;

  return (
    <div
      role="alert"
      aria-live="assertive"
      className="fixed bottom-4 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-3 rounded-xl bg-amber-50 border border-amber-300 px-4 py-3 shadow-lg text-sm text-amber-800"
    >
      <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-500" aria-hidden />
      <span>{message}</span>
      <button
        onClick={() => setVisible(false)}
        className="ml-2 rounded p-0.5 hover:bg-amber-100 transition-colors"
        aria-label="Dismiss storage warning"
      >
        <X className="h-4 w-4 text-amber-600" />
      </button>
    </div>
  );
}
