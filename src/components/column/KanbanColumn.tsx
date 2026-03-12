"use client";

import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Board, Column } from "@/store/types";
import ColumnHeader from "./ColumnHeader";
import KanbanCard from "@/components/card/KanbanCard";
import CreateCardInput from "@/components/card/CreateCardInput";
import { GripVertical } from "lucide-react";

interface KanbanColumnProps {
  boardId: string;
  column: Column;
  board: Board;
  overlay?: boolean;
}

export default function KanbanColumn({ boardId, column, board, overlay }: KanbanColumnProps) {
  const cards = column.cardIds.map((id) => board.cards[id]).filter(Boolean);

  const {
    setNodeRef: setSortableRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: { type: "column", boardId },
  });

  // Make the card area droppable so cards can be dropped into empty columns
  const { setNodeRef: setDroppableRef } = useDroppable({
    id: `droppable-${column.id}`,
    data: { type: "column-drop", columnId: column.id, boardId },
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setSortableRef}
      style={overlay ? undefined : style}
      className={`flex w-72 flex-shrink-0 flex-col rounded-2xl bg-gray-100 border border-gray-200 ${
        isDragging && !overlay ? "opacity-40" : ""
      } ${overlay ? "shadow-2xl rotate-2 opacity-95" : ""}`}
    >
      {/* Column header with drag handle */}
      <div className="px-3 py-3 border-b border-gray-200 flex items-center gap-1">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab text-gray-300 hover:text-gray-500 flex-shrink-0 transition-colors"
          aria-label="Drag column to reorder"
        >
          <GripVertical className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <ColumnHeader
            boardId={boardId}
            columnId={column.id}
            name={column.name}
            cardCount={cards.length}
          />
        </div>
      </div>

      {/* Cards — SortableContext for card ordering */}
      <SortableContext items={column.cardIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setDroppableRef}
          className="flex flex-col gap-2 px-3 py-3 flex-1 min-h-[60px] max-h-[calc(100vh-260px)] overflow-y-auto"
        >
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              boardId={boardId}
              card={card}
              board={board}
              columnId={column.id}
            />
          ))}
        </div>
      </SortableContext>

      {/* Add card */}
      <div className="px-3 pb-3 pt-1">
        <CreateCardInput boardId={boardId} columnId={column.id} />
      </div>
    </div>
  );
}
