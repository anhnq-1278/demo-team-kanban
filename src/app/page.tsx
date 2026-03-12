"use client";

import { useKanbanStore } from "@/store";
import { useEffect } from "react";
import BoardList from "@/components/board/BoardList";

export default function HomePage() {
  const hydrate = useKanbanStore((s) => s._hydrateSeed);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Team Kanban</h1>
        <p className="text-gray-500 mt-1">Manage your team work, one card at a time.</p>
      </div>
      <BoardList />
    </main>
  );
}
