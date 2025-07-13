import { useCallback } from "react";
import { Keyboard } from "react-native";
import { useTimer } from "../context/TimerContext";

export function useSegmentEditing() {
  const { state, dispatch, millisecondsToSegments, segmentsToMilliseconds } =
    useTimer();

  const handleSegmentPress = useCallback(
    (segment: "hours" | "minutes" | "seconds") => {
      if (state.status === "running") return;

      const currentSegments = millisecondsToSegments(state.totalMilliseconds);
      const currentValue = currentSegments[segment];

      dispatch({
        type: "START_EDITING",
        segment,
        value: currentValue.toString(),
      });
    },
    [state.status, state.totalMilliseconds, millisecondsToSegments, dispatch]
  );

  const handleSegmentChange = useCallback(
    (value: string) => {
      const cleanValue = value.replace(/[^0-9]/g, "");
      dispatch({ type: "UPDATE_EDITING_VALUE", value: cleanValue });
    },
    [dispatch]
  );

  const handleSegmentSubmit = useCallback(() => {
    if (state.editingSegment === null) return;

    const numValue = parseInt(state.editingValue || "0", 10);
    const currentSegments = millisecondsToSegments(state.totalMilliseconds);

    const newSegments = {
      ...currentSegments,
      [state.editingSegment]: numValue,
    };

    dispatch({
      type: "SET_DURATION",
      duration: segmentsToMilliseconds(newSegments),
    });
    dispatch({ type: "FINISH_EDITING", newValue: numValue });
    Keyboard.dismiss();
  }, [
    state.editingSegment,
    state.editingValue,
    state.totalMilliseconds,
    millisecondsToSegments,
    segmentsToMilliseconds,
    dispatch,
  ]);

  return {
    isEditing: state.editingSegment !== null,
    editingSegment: state.editingSegment,
    editingValue: state.editingValue,
    handleSegmentPress,
    handleSegmentChange,
    handleSegmentSubmit,
  };
}
