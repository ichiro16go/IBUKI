import { Pressable, StyleSheet, Text, View } from "react-native";

import { IbukiColors, IbukiFonts, IbukiRadius } from "@/constants/ibuki-theme";

export function Chip({
  label,
  selected = false,
  count,
  onPress,
}: {
  label: string;
  selected?: boolean;
  count?: number;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View style={[styles.chip, selected && styles.chipSelected]}>
        <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
          {label}
        </Text>
        {typeof count === "number" && (
          <Text style={[styles.chipCount, selected && styles.chipTextSelected]}>
            {count}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

export function SegmentedControl({
  value,
  options,
  onChange,
}: {
  value: string;
  options: string[];
  onChange: (nextValue: string) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const selected = option === value;
        return (
          <Pressable
            key={option}
            onPress={() => onChange(option)}
            style={styles.segmentButton}
          >
            <View
              style={[
                styles.segmentPill,
                selected && styles.segmentPillSelected,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  selected && styles.segmentTextSelected,
                ]}
              >
                {option}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.72,
  },
  chip: {
    alignItems: "center",
    backgroundColor: IbukiColors.surface,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.pill,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    minHeight: 31,
    paddingHorizontal: 12,
  },
  chipSelected: {
    backgroundColor: IbukiColors.accentDeep,
    borderColor: IbukiColors.accentDeep,
  },
  chipText: {
    color: IbukiColors.inkSoft,
    fontFamily: IbukiFonts?.sansBold,
    fontSize: 12,
    fontWeight: "600",
  },
  chipTextSelected: {
    color: IbukiColors.background,
  },
  chipCount: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.monoBold,
    fontSize: 10,
    fontWeight: "600",
  },
  segmented: {
    alignSelf: "flex-start",
    backgroundColor: IbukiColors.surfaceMuted,
    borderColor: IbukiColors.line,
    borderRadius: IbukiRadius.pill,
    borderWidth: 1,
    flexDirection: "row",
    padding: 4,
  },
  segmentButton: {
    borderRadius: IbukiRadius.pill,
  },
  segmentPill: {
    borderRadius: IbukiRadius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  segmentPillSelected: {
    backgroundColor: IbukiColors.accentDeep,
  },
  segmentText: {
    color: IbukiColors.mid,
    fontFamily: IbukiFonts?.monoBold,
    fontSize: 10.5,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  segmentTextSelected: {
    color: IbukiColors.background,
  },
});
