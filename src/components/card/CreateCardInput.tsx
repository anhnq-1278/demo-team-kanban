"use client";

import { useState, useRef } from "react";
import { useKanbanStore } from "@/store";
import { Plus, X } from "lucide-react";

interface CreateCardInputProps {
  boardId: string;
  columnId: string;
}

export default function CreateCardInput({ boardId, columnId }: CreateCardInputProps) {
  const [active, setActive] = useState(false);
  const [title, setTitle] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const createCard = useKanbanStore((s) => s.createCard);

  const open = () => {
    setActive(true);
    setTimeout(() => textareaRef.current?.focus(), 20);
  };

  const close = () => {
    setActive(false);
    setTitle("");
  };

  const submit = () => {
    const trimmed = title.trim();
    if (trimmed) {
      createCard(boardId, columnId, trimmed);
    }
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
    if (e.key === "Escape") close();
  };

  if (!active) {
    return (
      <button
        onClick={open}
        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
      >
        <Plus className="h-4 w-4" />
        Add a card
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter a title for this card…"
        maxLength={200}
        rows={3}
        className="w-full rounded-lg border border-blue-400 bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={submit}
          className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition-colors"
        >
          Add card
        </button>
        <button
          onClick={close}
          className="rounded p-1 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          aria-label="Cancel"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
