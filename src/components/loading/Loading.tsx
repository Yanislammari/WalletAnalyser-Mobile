import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

interface LoadingProps {
  size?: number;
  color?: string;
}

const Loading: React.FC<LoadingProps> = (props: LoadingProps) => {
  const size: number = props.size || 32;
  const color: string = props.color || "#6366F1"; // stand-in for the "primary" theme color

  return (
    <View style={styles.container}>
      <ActivityIndicator
        // RN's built-in indicator only supports "small" | "large" | number (iOS only).
        // Passing the numeric size works on iOS; on Android it falls back to "large".
        size={size}
        color={color}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Loading;
