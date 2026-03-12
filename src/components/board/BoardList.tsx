"use client";

import { useState } from "react";
import { useKanbanStore } from "@/store";
import BoardCard from "./BoardCard";
import CreateBoardDialog from "./CreateBoardDialog";
import { Plus, LayoutGrid } from "lucide-react";

export default function BoardList() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const boards = useKanbanStore((s) => s.boards);
  const boardList = Object.values(boards).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-700">
          Your Boards ({boardList.length})
        </h2>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus className="h-4 w-4" />
          New Board
        </button>
      </div>

      {boardList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 py-20 text-center">
          <div className="rounded-2xl bg-gray-100 p-4 mb-4">
            <LayoutGrid className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium">No boards yet</p>
          <p className="text-gray-400 text-sm mt-1 mb-6">Create your first board to get started.</p>
          <button
            onClick={() => setDialogOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {boardList.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      )}

      <CreateBoardDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}
