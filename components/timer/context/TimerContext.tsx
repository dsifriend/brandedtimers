import React, { createContext, useCallback, useContext, useReducer } from 'react';

type TimerStatus = 'stopped' | 'running' | 'paused';

interface TimerState {
  totalMilliseconds: number;
  originalDuration: number;
  status: TimerStatus;
  editingSegment: 'hours' | 'minutes' | 'seconds' | null;
  editingValue: string;
}

type TimerAction =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'STOP' }
  | { type: 'RESET' }
  | { type: 'TICK'; remaining: number }
  | { type: 'SET_DURATION'; duration: number }
  | { type: 'START_EDITING'; segment: 'hours' | 'minutes' | 'seconds'; value: string }
  | { type: 'UPDATE_EDITING_VALUE'; value: string }
  | { type: 'FINISH_EDITING'; newValue: number };

const initialState: TimerState = {
  totalMilliseconds: 0,
  originalDuration: 0,
  status: 'stopped',
  editingSegment: null,
  editingValue: '',
};

function timerReducer(state: TimerState, action: TimerAction): TimerState {
  switch (action.type) {
    case 'START':
      if (state.totalMilliseconds === 0) return state;
      return {
        ...state,
        status: 'running',
        originalDuration: state.status === 'stopped' ? state.totalMilliseconds : state.originalDuration,
      };

    case 'PAUSE':
      return { ...state, status: 'paused' };

    case 'STOP':
      return {
        ...state,
        status: 'stopped',
        totalMilliseconds: state.originalDuration,
      };

    case 'RESET':
      return {
        ...state,
        status: 'stopped',
        totalMilliseconds: 0,
        originalDuration: 0,
      };

    case 'TICK':
      return {
        ...state,
        totalMilliseconds: action.remaining,
        status: action.remaining <= 0 ? 'stopped' : state.status,
      };

    case 'SET_DURATION':
      return {
        ...state,
        totalMilliseconds: action.duration,
      };

    case 'START_EDITING':
      return {
        ...state,
        editingSegment: action.segment,
        editingValue: action.value,
      };

    case 'UPDATE_EDITING_VALUE':
      return {
        ...state,
        editingValue: action.value,
      };

    case 'FINISH_EDITING':
      return {
        ...state,
        editingSegment: null,
        editingValue: '',
      };

    default:
      return state;
  }
}

interface TimeSegments {
  hours: number;
  minutes: number;
  seconds: number;
}

interface TimerContextValue {
  state: TimerState;
  dispatch: React.Dispatch<TimerAction>;
  // Helper functions
  millisecondsToSegments: (ms: number) => TimeSegments;
  segmentsToMilliseconds: (segments: TimeSegments) => number;
}

const TimerContext = createContext<TimerContextValue | undefined>(undefined);

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(timerReducer, initialState);

  const millisecondsToSegments = useCallback((ms: number): TimeSegments => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
  }, []);

  const segmentsToMilliseconds = useCallback((segments: TimeSegments): number => {
    return (segments.hours * 3600 + segments.minutes * 60 + segments.seconds) * 1000;
  }, []);

  return (
    <TimerContext.Provider value={{ state, dispatch, millisecondsToSegments, segmentsToMilliseconds }}>
      {children}
    </TimerContext.Provider>
  );
}

export function useTimer() {
  const context = useContext(TimerContext);
  if (!context) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
}

export type { TimeSegments };
