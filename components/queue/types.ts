// components/queue/types.ts
export interface QueueEntry {
  id: string;
  duration: number; // milliseconds
  label?: string; // optional name for the timer
}

export interface QueueState {
  entries: QueueEntry[];
  currentIndex: number;
  continuousMode: boolean; // auto-advance vs manual
  isActive: boolean;
  // Snapshot for reset functionality
  snapshot: {
    entries: QueueEntry[];
    currentIndex: number;
  } | null;
}

export type QueueAction =
  | { type: "ADD_ENTRY"; entry: QueueEntry }
  | { type: "REMOVE_ENTRY"; id: string }
  | {
      type: "UPDATE_ENTRY";
      id: string;
      updates: Partial<Omit<QueueEntry, "id">>;
    }
  | { type: "REORDER_ENTRIES"; entries: QueueEntry[] }
  | { type: "SET_CONTINUOUS_MODE"; enabled: boolean }
  | { type: "START_QUEUE" }
  | { type: "STOP_QUEUE" }
  | { type: "RESET_QUEUE" }
  | { type: "ADVANCE_QUEUE" }
  | { type: "SET_CURRENT_INDEX"; index: number }
  | { type: "LOAD_QUEUE"; state: Partial<QueueState> };
