import { useCallback } from "react";
import { QueueState, QueueEntry } from "../types";
import { ThemeTemplate } from "@/types/template";

interface QueueData {
  entries: QueueEntry[];
  continuousMode: boolean;
}

export function useQueuePersistence() {
  // Convert queue state to exportable format
  const exportQueue = useCallback((queueState: QueueState): QueueData => {
    return {
      entries: queueState.entries,
      continuousMode: queueState.continuousMode,
    };
  }, []);

  // Import queue data from theme template
  const importQueue = useCallback(
    (template: ThemeTemplate): QueueData | null => {
      if (!template.queue) return null;

      // Validate queue data structure
      if (!Array.isArray(template.queue.entries)) return null;

      // Ensure all entries have required fields
      const validEntries = template.queue.entries.filter(
        (entry: any) =>
          typeof entry.id === "string" &&
          typeof entry.duration === "number" &&
          entry.duration > 0,
      );

      return {
        entries: validEntries,
        continuousMode: template.queue.continuousMode ?? false,
      };
    },
    [],
  );

  return {
    exportQueue,
    importQueue,
  };
}
