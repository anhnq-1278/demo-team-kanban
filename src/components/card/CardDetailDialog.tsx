"use client";

import { useState, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Select from "@radix-ui/react-select";
import { useKanbanStore } from "@/store";
import { Card, Board } from "@/store/types";
import { getInitials, formatDate } from "@/lib/utils";
import {
  X,
  Trash2,
  Check,
  ChevronDown,
  MessageSquare,
  Send,
  UserCircle2,
} from "lucide-react";

interface CardDetailDialogProps {
  boardId: string;
  card: Card;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CardDetailDialog({
  boardId,
  card,
  open,
  onOpenChange,
}: CardDetailDialogProps) {
  const board = useKanbanStore((s) => s.boards[boardId]) as Board | undefined;
  const updateCard = useKanbanStore((s) => s.updateCard);
  const deleteCard = useKanbanStore((s) => s.deleteCard);
  const assignCard = useKanbanStore((s) => s.assignCard);
  const addComment = useKanbanStore((s) => s.addComment);
  const activeMemberId = useKanbanStore((s) => s.activeMemberId);

  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [titleEditing, setTitleEditing] = useState(false);
  const [commentBody, setCommentBody] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset local state when card changes
  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description);
    setTitleEditing(false);
    setCommentBody("");
    setConfirmDelete(false);
  }, [card.id, card.title, card.description]);

  if (!board) return null;

  const assignee = card.assigneeId
    ? board.members.find((m) => m.id === card.assigneeId)
    : null;
  const isFormerMember = card.assigneeId !== null && !assignee;

  const commitTitle = () => {
    const t = title.trim();
    if (t && t !== card.title) updateCard(boardId, card.id, { title: t });
    setTitleEditing(false);
  };

  const commitDescription = () => {
    if (description !== card.description)
      updateCard(boardId, card.id, { description });
  };

  const handleAssign = (memberId: string) => {
    assignCard(boardId, card.id, memberId === "none" ? null : memberId);
  };

  const handleComment = () => {
    const trimmed = commentBody.trim();
    if (!trimmed) return;
    if (!activeMemberId) return;
    addComment(boardId, card.id, trimmed);
    setCommentBody("");
  };

  const handleDelete = () => {
    deleteCard(boardId, card.id);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl focus:outline-none">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start gap-3">
            <div className="flex-1 min-w-0">
              {titleEditing ? (
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={commitTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitTitle();
                    if (e.key === "Escape") { setTitle(card.title); setTitleEditing(false); }
                  }}
                  maxLength={200}
                  className="w-full text-lg font-semibold rounded border border-blue-400 px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              ) : (
                <Dialog.Title
                  onClick={() => setTitleEditing(true)}
                  className="text-lg font-semibold text-gray-900 cursor-text hover:text-blue-700 transition-colors"
                >
                  {card.title}
                </Dialog.Title>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Created {formatDate(card.createdAt)}
              </p>
            </div>
            <Dialog.Close asChild>
              <button className="rounded-full p-1 hover:bg-gray-100 transition-colors flex-shrink-0" aria-label="Close card details">
                <X className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <div className="px-6 py-5 space-y-6">
            {/* Assignee */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Assignee
              </label>
              <Select.Root
                value={card.assigneeId ?? "none"}
                onValueChange={handleAssign}
              >
                <Select.Trigger className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 w-52" aria-label="Assignee">
                  {assignee ? (
                    <>
                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                        {getInitials(assignee.name)}
                      </span>
                      <span className="truncate">{assignee.name}</span>
                    </>
                  ) : isFormerMember ? (
                    <>
                      <UserCircle2 className="h-4 w-4 text-gray-300" />
                      <span className="text-xs text-gray-400 italic">Former member</span>
                    </>
                  ) : (
                    <>
                      <UserCircle2 className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-400">Unassigned</span>
                    </>
                  )}
                  <ChevronDown className="ml-auto h-4 w-4 text-gray-400" />
                </Select.Trigger>
                <Select.Portal>
                  <Select.Content className="z-[60] rounded-lg border border-gray-200 bg-white shadow-lg overflow-hidden">
                    <Select.Viewport className="p-1">
                      <Select.Item
                        value="none"
                        className="flex items-center gap-2 rounded px-3 py-2 text-sm text-gray-500 cursor-pointer hover:bg-gray-50 outline-none data-[highlighted]:bg-gray-100"
                      >
                        <UserCircle2 className="h-4 w-4" />
                        <Select.ItemText>Unassigned</Select.ItemText>
                        <Select.ItemIndicator className="ml-auto">
                          <Check className="h-3.5 w-3.5 text-blue-600" />
                        </Select.ItemIndicator>
                      </Select.Item>
                      {board.members.map((m) => (
                        <Select.Item
                          key={m.id}
                          value={m.id}
                          className="flex items-center gap-2 rounded px-3 py-2 text-sm text-gray-700 cursor-pointer outline-none data-[highlighted]:bg-blue-50"
                        >
                          <span className="inline-flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                            {getInitials(m.name)}
                          </span>
                          <Select.ItemText>{m.name}</Select.ItemText>
                          <Select.ItemIndicator className="ml-auto">
                            <Check className="h-3.5 w-3.5 text-blue-600" />
                          </Select.ItemIndicator>
                        </Select.Item>
                      ))}
                    </Select.Viewport>
                  </Select.Content>
                </Select.Portal>
              </Select.Root>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={commitDescription}
                placeholder="Add a more detailed description…"
                maxLength={5000}
                rows={4}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
              />
            </div>

            {/* Comments */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Comments ({card.comments.length})
                </span>
              </div>

              {/* Comment list */}
              <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                {card.comments.length === 0 && (
                  <p className="text-sm text-gray-400 italic">No comments yet.</p>
                )}
                {card.comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-700">
                      {getInitials(c.authorName)}
                    </span>
                    <div className="flex-1 rounded-lg bg-gray-50 px-3 py-2">
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-xs font-semibold text-gray-700">{c.authorName}</span>
                        <span className="text-xs text-gray-400">{formatDate(c.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.body}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add comment */}
              {activeMemberId ? (
                <div className="flex gap-2">
                  <textarea
                    value={commentBody}
                    onChange={(e) => setCommentBody(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleComment();
                      }
                    }}
                    placeholder="Write a comment… (Enter to submit)"
                    maxLength={2000}
                    rows={2}
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={handleComment}
                    disabled={!commentBody.trim()}
                    className="self-end rounded-lg bg-blue-600 p-2 text-white disabled:opacity-40 hover:bg-blue-700 transition-colors"
                    aria-label="Post comment"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic">
                  Set your name in the board header to add comments.
                </p>
              )}
            </div>

            {/* Delete */}
            <div className="border-t border-gray-100 pt-4">
              {confirmDelete ? (
                <div className="flex items-center gap-3">
                  <p className="text-sm text-gray-600">Delete this card permanently?</p>
                  <button
                    onClick={handleDelete}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 transition-colors"
                  >
                    Yes, delete
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete card
                </button>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
