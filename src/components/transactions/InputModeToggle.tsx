import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { InputMode } from "../../enums/InputMode";

interface InputModeToggleProps {
  value: InputMode;
  onChange: (value: InputMode) => void;
}

const InputModeToggle: React.FC<InputModeToggleProps> = ({
  value,
  onChange,
}) => {
  return (
    <View style={styles.container}>
      {[InputMode.AMOUNT, InputMode.SHARES].map((mode) => {
        const isSelected = value === mode;

        return (
          <TouchableOpacity
            key={mode}
            onPress={() => onChange(mode)}
            style={[
              styles.button,
              isSelected ? styles.activeButton : styles.inactiveButton,
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.text,
                isSelected ? styles.activeText : styles.inactiveText,
              ]}
            >
              {mode === InputMode.AMOUNT ? "Amount" : "Shares"}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    overflow: "hidden",
    alignSelf: "flex-start",
  },
  button: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeButton: {
    backgroundColor: "#9333EA",
  },
  inactiveButton: {
    backgroundColor: "#FFFFFF",
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
  },
  activeText: {
    color: "#FFFFFF",
  },
  inactiveText: {
    color: "#6B7280",
  },
});

export default InputModeToggle;