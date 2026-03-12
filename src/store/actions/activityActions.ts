import type { ActivityEntry, Board } from "@/store/types";
import { generateId } from "@/lib/utils";

type ActivityEntryInput = Omit<ActivityEntry, "id" | "timestamp">;

/**
 * Append a new ActivityEntry to the board's log.
 * Internal helper — called only by other store actions, never directly from UI.
 */
export function appendActivityEntry(
  board: Board,
  entry: ActivityEntryInput
): Board {
  const newEntry: ActivityEntry = {
    ...entry,
    id: generateId(),
    timestamp: new Date().toISOString(),
  };
  return {
    ...board,
    activityLog: [...board.activityLog, newEntry],
  };
}
