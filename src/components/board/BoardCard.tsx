"use client";

import Link from "next/link";
import { Board } from "@/store/types";
import { formatDate } from "@/lib/utils";
import { LayoutGrid } from "lucide-react";

interface BoardCardProps {
  board: Pick<Board, "id" | "name" | "createdAt" | "cards">;
}

export default function BoardCard({ board }: BoardCardProps) {
  const cardCount = Object.keys(board.cards).length;

  return (
    <Link
      href={`/boards/${board.id}`}
      className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-blue-300 transition-all group"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-50 p-2 group-hover:bg-blue-100 transition-colors">
            <LayoutGrid className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-base leading-tight line-clamp-2">
            {board.name}
          </h3>
        </div>
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
        <span>{cardCount} {cardCount === 1 ? "card" : "cards"}</span>
        <span>Created {formatDate(board.createdAt)}</span>
      </div>
    </Link>
  );
}
