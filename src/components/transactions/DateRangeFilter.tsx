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
    props.onFromChange('');
    props.onToChange('');
  };

  const label = (): string => {
    if (props.from || props.to) return `Active`;
    return 'Date range';
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen((prev) => !prev)}
        style={[styles.trigger, isActive && styles.triggerActive]}
        activeOpacity={0.7}
      >
        <Ionicons
          name="calendar-outline"
          size={14}
          color={isActive ? '#7C3AED' : '#4B5563'}
        />
        <Text
          numberOfLines={1}
          style={[styles.triggerText, isActive && styles.triggerTextActive]}
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
            <Ionicons name="close-outline" size={14} color="#7C3AED" />
          </TouchableOpacity>
        ) : (
          <Ionicons
            name={open ? 'chevron-up' : 'chevron-down'}
            size={13}
            color="#4B5563"
          />
        )}
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="slide"  // slide up like a bottom sheet
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.dropdown} onPress={() => {}}>
            <View style={styles.dragHandle} />
            <Text style={styles.panelTitle}>DATE RANGE</Text>
            <View style={styles.divider} />

            <View style={[styles.fields, { marginTop: 12 }]}>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>From</Text>
                <DateInput value={props.from} onChange={props.onFromChange} />
              </View>
              <View style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>To</Text>
                <DateInput value={props.to} onChange={props.onToChange} />
              </View>
            </View>

            {isActive && (
              <View style={styles.clearState}>
                <TouchableOpacity
                  onPress={() => {
                    setOpen(false);
                  }}
                  style={styles.clearButton}
                  activeOpacity={0.7}
                >
                  <Text style={styles.clearText}>Done</Text>
                </TouchableOpacity>
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
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Trigger — matches your existing trigger style
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  triggerActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  triggerText: {
    fontSize: 13,
    color: '#4B5563',
  },
  triggerTextActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },

  // Backdrop
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },

  // Bottom sheet panel
  dropdown: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },

  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
    alignSelf: 'center',
    marginBottom: 16,
    marginTop: 4,
  },

  panelTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9CA3AF',
    letterSpacing: 0.8,
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },

  fields: {
    paddingHorizontal: 16,
    gap: 12,
  },

  fieldRow: {
    gap: 6,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: 4,
  },
  clearState: {
    flexDirection: 'row',
  },
  clearButton: {
    flex : 1,
    flexBasis : 0,
    width : '50%',
    marginHorizontal: 16,
    marginTop: 20,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
  },
  clearText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
});

export default DateRangeFilter;