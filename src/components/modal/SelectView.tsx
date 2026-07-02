import React, { useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

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
      <Pressable style={styles.trigger} onPress={() => setIsOpen(!isOpen)}>
        <Text style={styles.triggerText}>{currentLabel}</Text>
        <Text style={styles.chevron}>▾</Text>
      </Pressable>

      {isOpen && (
        <>
          {/* invisible full-screen pressable to close on outside tap */}
          <Pressable style={styles.outsideCatcher} onPress={() => setIsOpen(false)} />

          <View style={styles.dropdown}>
            {tabs.map((tab) => (
              <Pressable
                key={tab.key}
                style={[styles.option, view === tab.key && styles.optionActive]}
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
    backgroundColor: "#7C3AED",
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
    marginTop: 4,
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
    backgroundColor: "#F5F3FF",
  },
  optionText: {
    fontSize: 15,
    color: "#222",
  },
  optionTextActive: {
    fontWeight: "700",
    color: "#7C3AED",
  },
});

export default ViewSelector;