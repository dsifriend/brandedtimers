// components/queue/context/QueueContext.tsx
import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { QueueState, QueueAction, QueueEntry } from "../types";

const STORAGE_KEY = "@tmtimer_queue";

const initialState: QueueState = {
  entries: [],
  currentIndex: 0,
  continuousMode: false,
  isActive: false,
  snapshot: null,
};

function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case "ADD_ENTRY":
      return {
        ...state,
        entries: [...state.entries, action.entry],
      };

    case "REMOVE_ENTRY":
      return {
        ...state,
        entries: state.entries.filter((e) => e.id !== action.id),
        // Adjust current index if needed
        currentIndex: Math.min(
          state.currentIndex,
          Math.max(0, state.entries.length - 2),
        ),
      };

    case "UPDATE_ENTRY":
      return {
        ...state,
        entries: state.entries.map((e) =>
          e.id === action.id ? { ...e, ...action.updates } : e,
        ),
      };

    case "REORDER_ENTRIES":
      return {
        ...state,
        entries: action.entries,
      };

    case "SET_CONTINUOUS_MODE":
      return {
        ...state,
        continuousMode: action.enabled,
      };

    case "START_QUEUE":
      // Take snapshot when starting
      return {
        ...state,
        isActive: true,
        snapshot: {
          entries: [...state.entries],
          currentIndex: state.currentIndex,
        },
      };

    case "STOP_QUEUE":
      return {
        ...state,
        isActive: false,
      };

    case "RESET_QUEUE":
      // Restore from snapshot if available
      if (state.snapshot) {
        return {
          ...state,
          entries: [...state.snapshot.entries],
          currentIndex: state.snapshot.currentIndex,
          isActive: false,
          snapshot: null,
        };
      }
      // Otherwise just reset index
      return {
        ...state,
        currentIndex: 0,
        isActive: false,
      };

    case "ADVANCE_QUEUE":
      const nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.entries.length) {
        // Queue completed
        return {
          ...state,
          isActive: false,
          currentIndex: 0,
          snapshot: null,
        };
      }
      return {
        ...state,
        currentIndex: nextIndex,
      };

    case "SET_CURRENT_INDEX":
      return {
        ...state,
        currentIndex: action.index,
      };

    case "LOAD_QUEUE":
      return {
        ...state,
        ...action.state,
      };

    default:
      return state;
  }
}

interface QueueContextValue {
  state: QueueState;
  dispatch: React.Dispatch<QueueAction>;
  // Helper functions
  addTimer: (duration: number, label?: string) => void;
  removeTimer: (id: string) => void;
  updateTimer: (id: string, updates: Partial<Omit<QueueEntry, "id">>) => void;
  startQueue: () => void;
  stopQueue: () => void;
  resetQueue: () => void;
  advanceQueue: () => void;
  getCurrentEntry: () => QueueEntry | null;
  hasNextEntry: () => boolean;
}

const QueueContext = createContext<QueueContextValue | undefined>(undefined);

export function QueueProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(queueReducer, initialState);

  // Generate unique ID for new entries
  const generateId = useCallback(() => {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Helper functions
  const addTimer = useCallback(
    (duration: number, label?: string) => {
      const entry: QueueEntry = {
        id: generateId(),
        duration,
        label,
      };
      dispatch({ type: "ADD_ENTRY", entry });
    },
    [generateId],
  );

  const removeTimer = useCallback((id: string) => {
    dispatch({ type: "REMOVE_ENTRY", id });
  }, []);

  const updateTimer = useCallback(
    (id: string, updates: Partial<Omit<QueueEntry, "id">>) => {
      dispatch({ type: "UPDATE_ENTRY", id, updates });
    },
    [],
  );

  const startQueue = useCallback(() => {
    if (state.entries.length > 0) {
      dispatch({ type: "START_QUEUE" });
    }
  }, [state.entries.length]);

  const stopQueue = useCallback(() => {
    dispatch({ type: "STOP_QUEUE" });
  }, []);

  const resetQueue = useCallback(() => {
    dispatch({ type: "RESET_QUEUE" });
  }, []);

  const advanceQueue = useCallback(() => {
    dispatch({ type: "ADVANCE_QUEUE" });
  }, []);

  const getCurrentEntry = useCallback((): QueueEntry | null => {
    if (state.currentIndex < state.entries.length) {
      return state.entries[state.currentIndex];
    }
    return null;
  }, [state.currentIndex, state.entries]);

  const hasNextEntry = useCallback((): boolean => {
    return state.currentIndex + 1 < state.entries.length;
  }, [state.currentIndex, state.entries.length]);

  // Persist queue state to AsyncStorage
  useEffect(() => {
    const saveQueue = async () => {
      try {
        // Only save non-runtime state
        const persistedState = {
          entries: state.entries,
          continuousMode: state.continuousMode,
        };
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
      } catch (error) {
        console.error("Failed to save queue state:", error);
      }
    };

    saveQueue();
  }, [state.entries, state.continuousMode]);

  // Load queue state on mount
  useEffect(() => {
    const loadQueue = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          dispatch({ type: "LOAD_QUEUE", state: parsed });
        }
      } catch (error) {
        console.error("Failed to load queue state:", error);
      }
    };

    loadQueue();
  }, []);

  return (
    <QueueContext.Provider
      value={{
        state,
        dispatch,
        addTimer,
        removeTimer,
        updateTimer,
        startQueue,
        stopQueue,
        resetQueue,
        advanceQueue,
        getCurrentEntry,
        hasNextEntry,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue() {
  const context = useContext(QueueContext);
  if (!context) {
    throw new Error("useQueue must be used within a QueueProvider");
  }
  return context;
}
