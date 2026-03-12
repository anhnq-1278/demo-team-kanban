"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useKanbanStore } from "@/store";
import { formatDate, getInitials } from "@/lib/utils";
import { X, Activity, ArrowRight, UserPlus, UserMinus, MessageSquare } from "lucide-react";
import { ActivityEventType } from "@/store/types";

interface ActivityLogPanelProps {
  boardId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EVENT_ICON: Record<ActivityEventType, React.ReactNode> = {
  card_moved: <ArrowRight className="h-3.5 w-3.5 text-blue-500" />,
  card_assigned: <UserPlus className="h-3.5 w-3.5 text-green-500" />,
  card_unassigned: <UserMinus className="h-3.5 w-3.5 text-orange-400" />,
  comment_added: <MessageSquare className="h-3.5 w-3.5 text-purple-500" />,
};

export default function ActivityLogPanel({ boardId, open, onOpenChange }: ActivityLogPanelProps) {
  const board = useKanbanStore((s) => s.boards[boardId]);

  if (!board) return null;

  const entries = [...board.activityLog].reverse(); // newest first

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/30 z-40" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col focus:outline-none">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <Dialog.Title className="flex items-center gap-2 font-semibold text-gray-900">
              <Activity className="h-5 w-5 text-blue-600" />
              Activity Log
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="rounded-full p-1 hover:bg-gray-100 transition-colors" aria-label="Close activity log">
                <X className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </button>
            </Dialog.Close>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {entries.length === 0 && (
              <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                <Activity className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">No activity recorded yet.</p>
              </div>
            )}

            <ol className="space-y-4">
              {entries.map((entry) => (
                <li key={entry.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="inline-flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                      {EVENT_ICON[entry.eventType] ?? <Activity className="h-3.5 w-3.5 text-gray-400" />}
                    </span>
                    <div className="flex-1 w-px bg-gray-100 mt-1" />
                  </div>
                  <div className="pb-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-semibold text-blue-700">
                        {getInitials(entry.actor)}
                      </span>
                      <span className="text-sm font-medium text-gray-800 truncate">
                        {entry.actor}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium text-gray-800">{entry.cardTitle}</span>{" "}
                      &mdash; {entry.detail}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">{formatDate(entry.timestamp)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
