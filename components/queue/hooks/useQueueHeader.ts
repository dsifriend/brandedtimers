import { useQueueIntegration } from "./useQueueIntegration";

export interface QueueHeaderInfo {
  isQueueActive: boolean;
  queueLabel?: string;
  queueProgress?: {
    current: number;
    total: number;
  };
}

export function useQueueHeader(): QueueHeaderInfo {
  const { isQueueMode, currentLabel, queueProgress } = useQueueIntegration();

  return {
    isQueueActive: isQueueMode,
    queueLabel: currentLabel,
    queueProgress: isQueueMode ? queueProgress : undefined,
  };
}
