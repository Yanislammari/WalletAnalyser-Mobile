import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateInput from "./DateInput";

interface DateRangeFilterProps {
  from: string;
  to: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = (props) => {
  const [open, setOpen] = useState<boolean>(false);
  const isActive: boolean = !!props.from || !!props.to;

  const handleClear = () => {
    props.onFromChange("");
    props.onToChange("");
  };

  const label = (): string => {
    if (props.from && props.to) return `${props.from} → ${props.to}`;
    if (props.from) return `From ${props.from}`;
    if (props.to) return `Until ${props.to}`;
    return "Date range";
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen((prev) => !prev)}
        style={[styles.button, isActive ? styles.buttonActive : styles.buttonInactive]}
        activeOpacity={0.7}
      >
        <Ionicons
          name="calendar-outline"
          size={14}
          color={isActive ? "#7e22ce" : "#4b5563"}
        />
        <Text
          numberOfLines={1}
          style={[styles.label, isActive ? styles.labelActive : styles.labelInactive]}
        >
          {label()}
        </Text>
        {isActive ? (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation?.();
              handleClear();
            }}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Ionicons name="close-outline" size={14} color="#a855f7" />
          </TouchableOpacity>
        ) : (
          <Ionicons
            name={open ? "chevron-up-outline" : "chevron-down-outline"}
            size={13}
            color="#4b5563"
          />
        )}
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.panel} onPress={() => {}}>
            <Text style={styles.panelTitle}>DATE RANGE</Text>

            <View style={styles.fields}>
              <View>
                <Text style={styles.fieldLabel}>From</Text>
                <DateInput value={props.from} onChange={props.onFromChange} />
              </View>
              <View>
                <Text style={styles.fieldLabel}>To</Text>
                <DateInput value={props.to} onChange={props.onToChange} />
              </View>
            </View>

            {isActive && (
              <TouchableOpacity
                onPress={() => {
                  handleClear();
                  setOpen(false);
                }}
                style={styles.clearButton}
                activeOpacity={0.7}
              >
                <Text style={styles.clearText}>Clear filter</Text>
              </TouchableOpacity>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  buttonActive: {
    backgroundColor: "#faf5ff",
    borderColor: "#e9d5ff",
  },
  buttonInactive: {
    backgroundColor: "#ffffff",
    borderColor: "#e5e7eb",
  },
  label: {
    fontSize: 13,
    maxWidth: 160,
    flexShrink: 1,
  },
  labelActive: {
    color: "#7e22ce",
    fontWeight: "600",
  },
  labelInactive: {
    color: "#4b5563",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 60,
    paddingRight: 16,
  },
  panel: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    minWidth: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  panelTitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  fields: {
    gap: 12,
  },
  fieldLabel: {
    fontSize: 11,
    color: "#9ca3af",
    marginBottom: 4,
  },
  clearButton: {
    marginTop: 12,
    alignItems: "center",
  },
  clearText: {
    fontSize: 11,
    color: "#9ca3af",
  },
});

export default DateRangeFilter;