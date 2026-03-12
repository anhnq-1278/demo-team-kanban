"use client";

import { useState, useRef, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { useKanbanStore } from "@/store";
import { getInitials } from "@/lib/utils";
import { X, Plus, Trash2, CheckCircle2, Users } from "lucide-react";

interface MemberManagerProps {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function MemberManager({ boardId, open, onOpenChange }: MemberManagerProps) {
  const [newName, setNewName] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const board = useKanbanStore((s) => s.boards[boardId]);
  const activeMemberId = useKanbanStore((s) => s.activeMemberId);
  const addMember = useKanbanStore((s) => s.addMember);
  const removeMember = useKanbanStore((s) => s.removeMember);
  const setActiveMember = useKanbanStore((s) => s.setActiveMember);

  useEffect(() => {
    if (open) {
      setNewName("");
      setError("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  if (!board) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) { setError("Name is required."); return; }
    if (trimmed.length > 50) { setError("Name must be 50 characters or fewer."); return; }
    const duplicate = board.members.some(
      (m) => m.name.toLowerCase() === trimmed.toLowerCase()
    );
    if (duplicate) { setError("A member with that name already exists."); return; }
    if (board.members.length >= 20) { setError("Maximum 20 members per board."); return; }
    addMember(boardId, trimmed);
    setNewName("");
    setError("");
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md rounded-2xl bg-white shadow-xl focus:outline-none">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <Dialog.Title className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Users className="h-5 w-5 text-blue-600" />
              Team Members
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-full p-1 hover:bg-gray-100 transition-colors" aria-label="Close team members">
                <X className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <div className="px-6 py-4 space-y-4">
            {/* Active member hint */}
            {activeMemberId && (
              <div className="rounded-lg bg-blue-50 border border-blue-100 px-3 py-2 text-sm text-blue-700">
                You are posting as{" "}
                <strong>
                  {board.members.find((m) => m.id === activeMemberId)?.name ?? "unknown"}
                </strong>
                .
              </div>
            )}

            {/* Member list */}
            <div className="max-h-60 overflow-y-auto space-y-1">
              {board.members.length === 0 && (
                <p className="text-sm text-gray-400 py-2 italic">No members yet.</p>
              )}
              {board.members.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 ${
                    activeMemberId === m.id ? "bg-blue-50 border border-blue-200" : "hover:bg-gray-50"
                  }`}
                >
                  <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                    {getInitials(m.name)}
                  </span>
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">{m.name}</span>

                  <button
                    onClick={() =>
                      setActiveMember(activeMemberId === m.id ? null : m.id)
                    }
                    className={`text-xs rounded-full px-2 py-1 transition-colors ${
                      activeMemberId === m.id
                        ? "bg-blue-600 text-white"
                        : "border border-gray-300 text-gray-500 hover:border-blue-400 hover:text-blue-600"
                    }`}
                    title={activeMemberId === m.id ? "Currently you" : "Use as active member"}
                  >
                    {activeMemberId === m.id ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" /> You
                      </span>
                    ) : (
                      "Set as you"
                    )}
                  </button>

                  <button
                    onClick={() => {
                      removeMember(boardId, m.id);
                      if (activeMemberId === m.id) setActiveMember(null);
                    }}
                    className="rounded p-1 text-gray-300 hover:text-red-500 transition-colors"
                    aria-label={`Remove ${m.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add member form */}
            <form onSubmit={handleAdd} className="flex gap-2 pt-2 border-t border-gray-100">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => { setNewName(e.target.value); setError(""); }}
                  placeholder="New member name…"
                  maxLength={50}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                />
                {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
              </div>
              <button
                type="submit"
                className="flex-shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-white hover:bg-blue-700 transition-colors"
                aria-label="Add member"
              >
                <Plus className="h-4 w-4" />
              </button>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
