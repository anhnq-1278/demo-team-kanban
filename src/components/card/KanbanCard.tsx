"use client";

import { useState } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, Board } from "@/store/types";
import { getInitials } from "@/lib/utils";
import CardDetailDialog from "./CardDetailDialog";
import { MessageSquare, GripVertical, MoveRight } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useKanbanStore } from "@/store";

interface KanbanCardProps {
  boardId: string;
  card: Card;
  board: Board;
  columnId: string;
  overlay?: boolean; // rendered in DragOverlay?
}

export default function KanbanCard({
  boardId,
  card,
  board,
  columnId,
  overlay,
}: KanbanCardProps) {
  const [detailOpen, setDetailOpen] = useState(false);
  const store = useKanbanStore();
  const otherColumns = board.columns.filter((c) => c.id !== columnId);

  function handleMoveTo(targetColumnId: string) {
    store.moveCard(boardId, card.id, targetColumnId, 0);
  }

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: { type: "card", boardId, columnId },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const assignee = card.assigneeId
    ? board.members.find((m) => m.id === card.assigneeId)
    : null;
  const isFormerMember = card.assigneeId !== null && !assignee;

  return (
    <>
      <div
        ref={setNodeRef}
        style={overlay ? undefined : style}
        className={`group rounded-xl border bg-white px-3 py-3 shadow-sm cursor-pointer hover:shadow-md hover:border-blue-300 transition-all select-none ${
          isDragging && !overlay ? "opacity-40" : "border-gray-200"
        } ${overlay ? "shadow-xl rotate-2 opacity-95" : ""}`}
      >
        <div className="flex items-start gap-2">
          <div
            {...attributes}
            {...listeners}
            className="mt-0.5 flex-shrink-0 cursor-grab text-gray-300 hover:text-gray-500 transition-colors"
            aria-label="Drag card to reorder"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="h-4 w-4" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0" onClick={() => !isDragging && setDetailOpen(true)}>
            <p className="text-sm text-gray-800 font-medium leading-snug line-clamp-3">
              {card.title}
            </p>

            {card.description && (
              <p className="mt-1 text-xs text-gray-400 line-clamp-2">{card.description}</p>
            )}

            <div className="mt-2 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {card.comments.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <MessageSquare className="h-3 w-3" />
                    <span>{card.comments.length}</span>
                  </div>
                )}

                {/* Keyboard-accessible "Move to…" alternative to drag */}
                {!overlay && otherColumns.length > 0 && (
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger asChild>
                      <button
                        className="hidden group-hover:inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
                        aria-label="Move card to another column"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoveRight className="h-3 w-3" />
                        Move to
                      </button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Portal>
                      <DropdownMenu.Content
                        sideOffset={4}
                        className="z-50 min-w-[140px] rounded-lg bg-white shadow-lg border border-gray-200 py-1 text-sm"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {otherColumns.map((col) => (
                          <DropdownMenu.Item
                            key={col.id}
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer text-gray-700 hover:bg-blue-50 hover:text-blue-700 outline-none"
                            onSelect={() => handleMoveTo(col.id)}
                          >
                            {col.name}
                          </DropdownMenu.Item>
                        ))}
                      </DropdownMenu.Content>
                    </DropdownMenu.Portal>
                  </DropdownMenu.Root>
                )}
              </div>

              {assignee && (
                <span
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700"
                  title={assignee.name}
                  aria-label={`Assigned to ${assignee.name}`}
                >
                  {getInitials(assignee.name)}
                </span>
              )}
              {isFormerMember && (
                <span
                  className="inline-flex items-center rounded-full bg-gray-100 px-1.5 py-0.5 text-xs text-gray-400 font-medium"
                  title="Assigned member was removed from this board"
                  aria-label="Former member"
                >
                  Former
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {!overlay && (
        <CardDetailDialog
          boardId={boardId}
          card={card}
          open={detailOpen}
          onOpenChange={setDetailOpen}
        />
      )}
    </>
  );
}
