"use client";

import { useState, useRef, useEffect } from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useKanbanStore } from "@/store";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

interface ColumnHeaderProps {
  boardId: string;
  columnId: string;
  name: string;
  cardCount: number;
}

export default function ColumnHeader({ boardId, columnId, name, cardCount }: ColumnHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const renameColumn = useKanbanStore((s) => s.renameColumn);
  const deleteColumn = useKanbanStore((s) => s.deleteColumn);

  useEffect(() => {
    if (editing) {
      setValue(name);
      setTimeout(() => inputRef.current?.select(), 20);
    }
  }, [editing, name]);

  const commitRename = () => {
    const trimmed = value.trim();
    if (trimmed && trimmed !== name) {
      renameColumn(boardId, columnId, trimmed);
    }
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setEditing(false);
  };

  if (confirmDelete) {
    return (
      <div className="flex flex-col gap-2 p-1">
        <p className="text-xs text-gray-600 font-medium">Delete &ldquo;{name}&rdquo;?</p>
        <p className="text-xs text-gray-400">All cards in this column will be deleted.</p>
        <div className="flex gap-2">
          <button
            onClick={() => deleteColumn(boardId, columnId)}
            className="flex-1 rounded bg-red-600 py-1 text-xs text-white font-medium hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="flex-1 rounded border border-gray-300 py-1 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2">
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
          maxLength={100}
          className="flex-1 rounded border border-blue-400 bg-white px-2 py-1 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      ) : (
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-semibold text-gray-700 text-sm truncate">{name}</span>
          <span className="flex-shrink-0 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-500">
            {cardCount}
          </span>
        </div>
      )}

      {!editing && (
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              className="rounded p-1 hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-700 flex-shrink-0"
              aria-label="Column options"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              className="min-w-[140px] rounded-lg border border-gray-200 bg-white p-1 shadow-lg z-50"
              align="end"
            >
              <DropdownMenu.Item
                onSelect={() => setEditing(true)}
                className="flex items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 cursor-pointer hover:bg-gray-100 outline-none"
              >
                <Pencil className="h-3.5 w-3.5" />
                Rename
              </DropdownMenu.Item>
              <DropdownMenu.Separator className="my-1 border-t border-gray-100" />
              <DropdownMenu.Item
                onSelect={() => setConfirmDelete(true)}
                className="flex items-center gap-2 rounded px-3 py-2 text-sm text-red-600 cursor-pointer hover:bg-red-50 outline-none"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete column
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      )}
    </div>
  );
}
