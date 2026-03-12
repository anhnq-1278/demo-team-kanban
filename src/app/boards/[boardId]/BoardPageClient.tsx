"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { SortableContext, horizontalListSortingStrategy, arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useKanbanStore } from "@/store";
import KanbanColumn from "@/components/column/KanbanColumn";
import KanbanCard from "@/components/card/KanbanCard";
import MemberManager from "@/components/member/MemberManager";
import ActivityLogPanel from "@/components/activity/ActivityLogPanel";
import { getInitials } from "@/lib/utils";
import {
  ArrowLeft,
  Plus,
  Users,
  Activity,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";


interface BoardPageClientProps {
  boardId: string;
}

export default function BoardPageClient({ boardId }: BoardPageClientProps) {
  const router = useRouter();

  const board = useKanbanStore((s) => s.boards[boardId]);
  const activeMemberId = useKanbanStore((s) => s.activeMemberId);
  const createColumn = useKanbanStore((s) => s.createColumn);
  const deleteBoard = useKanbanStore((s) => s.deleteBoard);
  const reorderColumns = useKanbanStore((s) => s.reorderColumns);
  const reorderCards = useKanbanStore((s) => s.reorderCards);
  const moveCard = useKanbanStore((s) => s.moveCard);

  const [membersOpen, setMembersOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [addingColumn, setAddingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");
  const [confirmDeleteBoard, setConfirmDeleteBoard] = useState(false);
  const [activeItem, setActiveItem] = useState<{ type: "card" | "column"; id: string } | null>(null);
  const newColInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  if (!board) {
    return (
      <main className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-gray-500">Board not found.</p>
        <Link href="/" className="text-blue-600 hover:underline text-sm">
          ← Back to boards
        </Link>
      </main>
    );
  }

  // ── DnD helpers ──────────────────────────────────────────────────────────

  function getCardColumn(cardId: string): string | undefined {
    return board.columns.find((col) => col.cardIds.includes(cardId))?.id;
  }

  function onDragStart(event: DragStartEvent) {
    const { type, boardId: bid } = event.active.data.current ?? {};
    if (bid !== boardId) return;
    setActiveItem({ type, id: String(event.active.id) });
  }

  function onDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeData = active.data.current;
    if (!activeData || activeData.type !== "card") return;

    const activeCardId = String(active.id);
    const activeColId = getCardColumn(activeCardId);
    if (!activeColId) return;

    // Dropped over a card
    const overData = over.data.current;
    let overColId: string | undefined;
    if (overData?.type === "card") {
      overColId = getCardColumn(String(over.id));
    } else if (overData?.type === "column-drop") {
      overColId = overData.columnId;
    }

    if (!overColId || overColId === activeColId) return;

    // Move the card to the new column
    const overCol = board.columns.find((c) => c.id === overColId);
    if (!overCol) return;
    const toIndex = overCol.cardIds.length;
    moveCard(boardId, activeCardId, overColId, toIndex);
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveItem(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeData = active.data.current;
    if (!activeData) return;

    if (activeData.type === "column") {
      // Reorder columns
      const oldIndex = board.columns.findIndex((c) => c.id === active.id);
      const newIndex = board.columns.findIndex((c) => c.id === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(board.columns, oldIndex, newIndex).map((c) => c.id);
        reorderColumns(boardId, newOrder);
      }
      return;
    }

    if (activeData.type === "card") {
      const activeCardId = String(active.id);
      const overData = over.data.current;

      const activeColId = getCardColumn(activeCardId);
      if (!activeColId) return;

      let overColId = activeColId;
      if (overData?.type === "card") {
        overColId = getCardColumn(String(over.id)) ?? activeColId;
      } else if (overData?.type === "column-drop") {
        overColId = overData.columnId;
      }

      if (overColId === activeColId) {
        // Same column reorder
        const col = board.columns.find((c) => c.id === activeColId);
        if (!col) return;
        const oldIdx = col.cardIds.indexOf(activeCardId);
        const newIdx = col.cardIds.indexOf(String(over.id));
        if (oldIdx !== -1 && newIdx !== -1) {
          const newOrder = arrayMove(col.cardIds, oldIdx, newIdx);
          reorderCards(boardId, activeColId, newOrder);
        }
      }
      // Cross-column was already handled by onDragOver
    }
  }

  // ── Add column ──────────────────────────────────────────────────────────

  const openAddColumn = () => {
    setAddingColumn(true);
    setTimeout(() => newColInputRef.current?.focus(), 20);
  };

  const submitAddColumn = () => {
    const trimmed = newColumnName.trim();
    if (trimmed) createColumn(boardId, trimmed);
    setAddingColumn(false);
    setNewColumnName("");
  };

  const activeMember = activeMemberId
    ? board.members.find((m) => m.id === activeMemberId)
    : null;

  // ── Drag overlay item ───────────────────────────────────────────────────

  const overlayCard =
    activeItem?.type === "card" ? board.cards[activeItem.id] : undefined;
  const overlayColumn =
    activeItem?.type === "column"
      ? board.columns.find((c) => c.id === activeItem.id)
      : undefined;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      {/* Board header */}
      <header className="flex-shrink-0 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3 max-w-full">
          <Link href="/" className="text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900 truncate">{board.name}</h1>
          <span className="text-xs text-gray-400 hidden sm:inline">
            {board.columns.length} columns · {Object.keys(board.cards).length} cards
          </span>

          <div className="ml-auto flex items-center gap-2">
            {/* Active member indicator */}
            {activeMember && (
              <button
                onClick={() => setMembersOpen(true)}
                className="flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-blue-200 text-[10px] font-bold">
                  {getInitials(activeMember.name)}
                </span>
                {activeMember.name}
              </button>
            )}

            {/* Members button */}
            <button
              onClick={() => setMembersOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              title="Manage members"
            >
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">{board.members.length} members</span>
            </button>

            {/* Activity button */}
            <button
              onClick={() => setActivityOpen(true)}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              title="View activity"
            >
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Activity</span>
              {board.activityLog.length > 0 && (
                <span className="rounded-full bg-blue-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {board.activityLog.length}
                </span>
              )}
            </button>

            {/* Board options */}
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 transition-colors"
                  aria-label="Board options"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="min-w-[160px] rounded-lg border border-gray-200 bg-white p-1 shadow-lg z-50"
                  align="end"
                >
                  {confirmDeleteBoard ? (
                    <div className="px-2 py-1 space-y-2">
                      <p className="text-xs text-gray-600">Delete this board?</p>
                      <div className="flex gap-1">
                        <button
                          onClick={() => { deleteBoard(boardId); router.push("/"); }}
                          className="flex-1 rounded bg-red-600 py-1 text-xs text-white hover:bg-red-700"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDeleteBoard(false)}
                          className="flex-1 rounded border border-gray-300 py-1 text-xs text-gray-600 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <DropdownMenu.Item
                      onSelect={() => setConfirmDeleteBoard(true)}
                      className="flex items-center gap-2 rounded px-3 py-2 text-sm text-red-600 cursor-pointer hover:bg-red-50 outline-none"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete board
                    </DropdownMenu.Item>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </header>

      {/* Columns area */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <SortableContext
            items={board.columns.map((c) => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex gap-4 px-4 py-4 h-full items-start">
              {board.columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  boardId={boardId}
                  column={column}
                  board={board}
                />
              ))}

              {/* Add column */}
              {addingColumn ? (
                <div className="flex w-72 flex-shrink-0 flex-col rounded-2xl bg-gray-100 border border-gray-200 p-3 gap-2">
                  <input
                    ref={newColInputRef}
                    type="text"
                    value={newColumnName}
                    onChange={(e) => setNewColumnName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") submitAddColumn();
                      if (e.key === "Escape") { setAddingColumn(false); setNewColumnName(""); }
                    }}
                    onBlur={submitAddColumn}
                    placeholder="Column name…"
                    maxLength={100}
                    className="w-full rounded-lg border border-blue-400 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ) : (
                <button
                  onClick={openAddColumn}
                  className="flex w-72 flex-shrink-0 items-center gap-2 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-100/50 px-4 py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Add column
                </button>
              )}
            </div>
          </SortableContext>

          {/* Drag overlay */}
          <DragOverlay>
            {overlayCard && (
              <div className="w-72">
                <KanbanCard
                  boardId={boardId}
                  card={overlayCard}
                  board={board}
                  columnId={getCardColumn(overlayCard.id) ?? ""}
                  overlay
                />
              </div>
            )}
            {overlayColumn && (
              <div className="w-72">
                <KanbanColumn
                  boardId={boardId}
                  column={overlayColumn}
                  board={board}
                  overlay
                />
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Panels */}
      <MemberManager boardId={boardId} open={membersOpen} onOpenChange={setMembersOpen} />
      <ActivityLogPanel boardId={boardId} open={activityOpen} onOpenChange={setActivityOpen} />
    </div>
  );
}
