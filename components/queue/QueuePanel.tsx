import React, { useCallback, useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Switch,
  useWindowDimensions,
  ScrollView,
} from "react-native";
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BottomSheet, { BottomSheetFlatList } from "@gorhom/bottom-sheet";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useCustomization } from "@/components/customization/context/CustomizationContext";
import { useQueue } from "./context/QueueContext";
import { QueueEntryRow } from "./components/QueueEntryRow";
import { QueueEntry } from "./types";

interface QueuePanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export function QueuePanel({ isVisible, onClose }: QueuePanelProps) {
  const { state: state } = useCustomization();
  const {
    state: queueState,
    addTimer,
    removeTimer,
    updateTimer,
    startQueue,
    stopQueue,
    resetQueue,
    dispatch,
  } = useQueue();

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  // Determine if we should use sidebar or bottom sheet
  const useBottomSheet = width < 768;
  const panelWidth = 400;

  // Bottom sheet setup
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["25%", "85%"], []);

  // Sidebar animation
  const sidebarTranslateX = useSharedValue(useBottomSheet ? 0 : panelWidth);

  React.useEffect(() => {
    if (useBottomSheet) {
      if (!isVisible && bottomSheetRef.current) {
        bottomSheetRef.current.close();
      }
    } else {
      sidebarTranslateX.value = isVisible ? 0 : panelWidth;
    }
  }, []);

  React.useEffect(() => {
    if (useBottomSheet) {
      if (isVisible) {
        bottomSheetRef.current?.expand();
      } else {
        bottomSheetRef.current?.close();
      }
    } else {
      sidebarTranslateX.value = withSpring(isVisible ? 0 : panelWidth, {
        damping: 20,
        stiffness: 300,
      });
    }
  }, [isVisible, useBottomSheet, sidebarTranslateX]);

  React.useEffect(() => {
    if (!useBottomSheet) {
      sidebarTranslateX.value = isVisible ? 0 : panelWidth;
    }
  }, [useBottomSheet, isVisible, sidebarTranslateX]);

  const sidebarStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: sidebarTranslateX.value }],
    };
  });

  const fontFamily =
    state.fontFamily === "inter"
      ? "Inter_400Regular"
      : "Merriweather_400Regular";

  const handleContinuousModeToggle = useCallback(
    (value: boolean) => {
      dispatch({ type: "SET_CONTINUOUS_MODE", enabled: value });
    },
    [dispatch],
  );

  const handleAddTimer = useCallback(() => {
    addTimer(5 * 60 * 1000);
  }, [addTimer]);

  const handleQueueControl = useCallback(() => {
    if (queueState.isActive) {
      stopQueue();
    } else if (queueState.entries.length > 0) {
      startQueue();
    }
  }, [queueState.isActive, queueState.entries.length, startQueue, stopQueue]);

  const handleDragEnd = useCallback(
    ({ data }: { data: QueueEntry[] }) => {
      if (queueState.isActive && queueState.currentIndex === 0) {
        const activeTimer = queueState.entries[0];
        dispatch({ type: "REORDER_ENTRIES", entries: [activeTimer, ...data] });
      } else {
        dispatch({ type: "REORDER_ENTRIES", entries: data });
      }
    },
    [
      dispatch,
      queueState.isActive,
      queueState.currentIndex,
      queueState.entries,
    ],
  );

  // Get data for the draggable list
  const draggableEntries =
    queueState.isActive && queueState.currentIndex === 0
      ? queueState.entries.slice(1)
      : queueState.entries;

  const activeEntry =
    queueState.isActive && queueState.currentIndex === 0
      ? queueState.entries[0]
      : null;

  // Render header
  const renderListHeader = useCallback(() => {
    return (
      <View style={{ paddingHorizontal: 20, paddingTop: 20, marginBottom: 12 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "600",
              color: state.colors.text,
              fontFamily,
            }}
          >
            Timer Queue
          </Text>
          <TouchableOpacity
            onPress={onClose}
            style={{
              alignItems: "center",
              justifyContent: "center",
              aspectRatio: 1,
              padding: 8,
              borderRadius: 40,
              backgroundColor: state.colors.primary,
            }}
          >
            <Ionicons name="close" size={20} color={state.colors.text} />
          </TouchableOpacity>
        </View>

        {/* Continuous Mode Toggle */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: state.colors.primary,
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              color: state.colors.text,
              fontFamily,
            }}
          >
            Continuous Mode
          </Text>
          <Switch
            value={queueState.continuousMode}
            onValueChange={handleContinuousModeToggle}
            trackColor={{
              false: state.colors.background,
              true: state.colors.background,
            }}
            thumbColor={state.colors.text}
            disabled={queueState.isActive}
          />
        </View>

        {/* Queue Status */}
        {queueState.isActive && (
          <View
            style={{
              backgroundColor: state.colors.accent,
              borderRadius: 12,
              padding: 12,
              marginVertical: 4,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: state.colors.text,
                fontFamily,
                textAlign: "center",
              }}
            >
              Queue Running • Timer {queueState.currentIndex + 1} of{" "}
              {queueState.entries.length}
            </Text>
          </View>
        )}

        {/* Active Timer (if present) */}
        {activeEntry && (
          <QueueEntryRow
            entry={activeEntry}
            isActive={true}
            onUpdate={updateTimer}
            onRemove={removeTimer}
            dragHandleComponent={
              <View style={{ marginRight: 12, opacity: 0.3 }}>
                <Ionicons
                  name="reorder-three"
                  size={24}
                  color={state.colors.text}
                />
              </View>
            }
          />
        )}

        {/* Empty State */}
        {queueState.entries.length === 0 && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <Text
              style={{
                fontSize: 16,
                color: state.colors.textSecondary,
                fontFamily,
                textAlign: "center",
              }}
            >
              No timers in queue
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: state.colors.textSecondary,
                fontFamily,
                textAlign: "center",
                opacity: 0.7,
              }}
            >
              Tap "Add Timer" to create your first timer
            </Text>
          </View>
        )}
      </View>
    );
  }, [
    state,
    fontFamily,
    queueState,
    handleContinuousModeToggle,
    activeEntry,
    updateTimer,
    removeTimer,
    onClose,
  ]);

  // Render footer
  const renderListFooter = useCallback(() => {
    return (
      <View
        style={{
          paddingHorizontal: 20,
          paddingBottom: 12,
          marginTop: 16,
          gap: 8,
        }}
      >
        {/* Add Timer Button */}
        <TouchableOpacity
          onPress={handleAddTimer}
          style={{
            backgroundColor: state.colors.primary,
            borderRadius: 12,
            padding: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons
            name="add-circle"
            size={24}
            color={state.colors.text}
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: state.colors.text,
              fontFamily,
            }}
          >
            Add Timer
          </Text>
        </TouchableOpacity>

        {/* Queue Controls */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          <TouchableOpacity
            onPress={resetQueue}
            disabled={!queueState.isActive && queueState.currentIndex === 0}
            style={{
              flex: 1,
              backgroundColor: state.colors.primary,
              borderRadius: 12,
              padding: 12,
              alignItems: "center",
              opacity:
                !queueState.isActive && queueState.currentIndex === 0 ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: state.colors.text,
                fontFamily,
              }}
            >
              Reset
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleQueueControl}
            disabled={queueState.entries.length === 0}
            style={{
              flex: 2,
              backgroundColor: queueState.isActive
                ? state.colors.secondary
                : state.colors.accent,
              borderRadius: 12,
              padding: 12,
              alignItems: "center",
              opacity: queueState.entries.length === 0 ? 0.5 : 1,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: state.colors.text,
                fontFamily,
              }}
            >
              {queueState.isActive ? "Stop Queue" : "Start Queue"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [
    state,
    fontFamily,
    queueState,
    handleAddTimer,
    handleQueueControl,
    resetQueue,
  ]);

  // Render draggable item
  const renderDraggableItem = useCallback(
    ({ item, drag, isActive: isDragging }: RenderItemParams<QueueEntry>) => {
      return (
        <ScaleDecorator activeScale={0.95}>
          <View style={{ paddingHorizontal: 20 }}>
            <TouchableOpacity onLongPress={drag} activeOpacity={1}>
              <QueueEntryRow
                entry={item}
                isActive={false}
                onUpdate={updateTimer}
                onRemove={removeTimer}
                dragHandleComponent={
                  <TouchableOpacity
                    onPressIn={drag}
                    style={{ marginRight: 12, opacity: 0.5 }}
                  >
                    <Ionicons
                      name="reorder-three"
                      size={24}
                      color={state.colors.text}
                    />
                  </TouchableOpacity>
                }
              />
            </TouchableOpacity>
          </View>
        </ScaleDecorator>
      );
    },
    [updateTimer, removeTimer, state.colors.text],
  );

  // Bottom sheet content
  if (useBottomSheet) {
    return (
      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={snapPoints}
        index={-1}
        enablePanDownToClose
        onClose={onClose}
        backgroundStyle={{ backgroundColor: state.colors.background }}
        handleIndicatorStyle={{ backgroundColor: state.colors.textSecondary }}
        enableOverDrag={false}
      >
        {draggableEntries.length > 0 ? (
          <DraggableFlatList
            data={draggableEntries}
            renderItem={renderDraggableItem}
            keyExtractor={(item) => item.id}
            onDragEnd={handleDragEnd}
            ListHeaderComponent={renderListHeader}
            ListFooterComponent={renderListFooter}
            contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
            showsVerticalScrollIndicator={false}
            activationDistance={10}
          />
        ) : (
          <BottomSheetFlatList
            data={[]}
            renderItem={() => null}
            ListHeaderComponent={renderListHeader}
            ListFooterComponent={renderListFooter}
            contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
          />
        )}
      </BottomSheet>
    );
  }

  // Sidebar for desktop/mobile landscape
  return (
    <>
      {/* Backdrop */}
      {isVisible && (
        <TouchableOpacity
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: 999,
          }}
          onPress={onClose}
          activeOpacity={1}
        />
      )}

      {/* Sidebar */}
      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            right: 0,
            width: panelWidth,
            height: height,
            backgroundColor: state.colors.background,
            borderLeftWidth: 1,
            borderLeftColor: state.colors.primary,
            zIndex: 1000,
            paddingTop: insets.top,
          },
          sidebarStyle,
        ]}
      >
        {/* Use same DraggableFlatList approach as bottom sheet */}
        {draggableEntries.length > 0 ? (
          <DraggableFlatList
            data={draggableEntries}
            renderItem={renderDraggableItem}
            keyExtractor={(item) => item.id}
            onDragEnd={handleDragEnd}
            ListHeaderComponent={renderListHeader}
            ListFooterComponent={renderListFooter}
            contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
            showsVerticalScrollIndicator={false}
            activationDistance={10}
          />
        ) : (
          <ScrollView
            contentContainerStyle={{ paddingBottom: insets.bottom + 8 }}
          >
            {renderListHeader()}
            {renderListFooter()}
          </ScrollView>
        )}
      </Animated.View>
    </>
  );
}
