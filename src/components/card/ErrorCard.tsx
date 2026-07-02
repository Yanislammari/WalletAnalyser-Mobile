import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ErrorCardProps {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  description: string;
  hint?: string;
}

const ErrorCardInApp: React.FC<ErrorCardProps> = (props: ErrorCardProps) => {
  return (
    <View style={styles.screen}>
      <View style={styles.card}>
        <View style={styles.content}>
          <View style={[styles.iconWrapper, { backgroundColor: props.iconBg }]}>
            {props.icon}
          </View>
          <Text style={styles.title}>{props.title}</Text>
          <Text style={styles.description}>{props.description}</Text>
          {props.hint && (
            <View style={styles.hintBox}>
              <Text style={styles.hintText}>{props.hint}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F5F4FB",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    overflow: "hidden",
    // shadow (iOS)
    shadowColor: "#9CA3AF",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    // elevation (Android)
    elevation: 6,
  },
  content: {
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: 28,
    alignItems: "center",
  },
  iconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    // subtle shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    color: "#111827",
    fontWeight: "700",
    fontSize: 20,
    textAlign: "center",
  },
  description: {
    color: "#6B7280",
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  hintBox: {
    marginTop: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    width: "100%",
  },
  hintText: {
    color: "#9CA3AF",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "left",
  },
});

export default ErrorCardInApp;
