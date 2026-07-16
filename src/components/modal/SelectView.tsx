import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { C } from "../../utils/color";

export type ViewType = "cluster" | "sector" | "my_stocks" | "countries";

const tabs: { key: ViewType; label: string }[] = [
  { key: "my_stocks", label: "My Stocks" },
  { key: "sector", label: "Sector" },
  { key: "countries", label: "Countries" },
  { key: "cluster", label: "Cluster" },
];

function ViewSelector({
  view,
  setView,
}: {
  view: ViewType;
  setView: (v: ViewType) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const currentLabel = tabs.find((t) => t.key === view)?.label;

  return (
    <View style={styles.wrapper}>
      <Pressable
        style={({ pressed }) => [
          styles.trigger,
          pressed && styles.triggerPressed, // iOS/fallback feedback
        ]}
        android_ripple={{ color: "rgba(255,255,255,0.2)" }}
        onPress={() => setIsOpen(!isOpen)}
      >
        <Text style={styles.triggerText}>{currentLabel}</Text>
        <Text
          style={[
            styles.chevron,
            isOpen && styles.chevronOpen,
          ]}
        >
          ▾
        </Text>
      </Pressable>

      {isOpen && (
        <>
          {/* invisible full-screen pressable to close on outside tap */}
          <Pressable style={styles.outsideCatcher} onPress={() => setIsOpen(false)} />
          <View style={styles.dropdown}>
            {tabs.map((tab) => (
                <Pressable
                  key={tab.key}
                  style={({ pressed }) => [
                    styles.option,
                    view === tab.key && styles.optionActive,
                    pressed && styles.optionPressed,
                  ]}
                  android_ripple={{ color: C.purple100 }}
                  onPress={() => {
                    setView(tab.key);
                    setIsOpen(false);
                  }}
                >
                <Text
                  style={[
                    styles.optionText,
                    view === tab.key && styles.optionTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "relative",
    zIndex: 10,
    height: 48,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginTop: -24,
    marginBottom: 24,
    paddingVertical: 12,
    backgroundColor: C.indigo700,
    borderRadius: 8,
    gap: 15,
  },
  triggerText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#fff",
  },
  chevron: {
    fontSize: 20,
    fontWeight: "500",
    color: "#fff",
  },
  chevronOpen: {
    transform: [{ rotate: "180deg" }],
  },
  outsideCatcher: {
    position: "absolute",
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 5,
  },
  dropdown: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: 0,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 4,
    zIndex: 20,
    // shadow for elevation above content below it
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  optionActive: {
    backgroundColor: C.purple100,
  },
  optionText: {
    fontSize: 15,
    color: "#222",
  },
  optionTextActive: {
    fontWeight: "700",
    color: C.indigo700,
  },
  triggerPressed: {
    opacity: 0.85,
  },
  optionPressed: {
    backgroundColor: "#f3f4f6",
  },
});

export default ViewSelector;