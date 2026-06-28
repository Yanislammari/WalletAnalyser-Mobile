import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Pressable
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  minDate?: string;
}

const MONTHS: string[] = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_HEADERS: string[] = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

const parseLocalDate = (str: string): Date | null => {
  if (!str) return null;
  const [year, month, day] = str.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const toYMD = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDisplay = (date: Date): string => {
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const DateInput: React.FC<DateInputProps> = (props) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const minDateParsed: Date | null = props.minDate ? parseLocalDate(props.minDate) : null;
  const selected: Date | null = parseLocalDate(props.value);

  const [open, setOpen] = useState<boolean>(false);
  const [viewYear, setViewYear] = useState<number>(today.getFullYear());
  const [viewMonth, setViewMonth] = useState<number>(today.getMonth());

  const handleOpen = () => {
    const baseDate = selected ?? today;
    setViewYear(baseDate.getFullYear());
    setViewMonth(baseDate.getMonth());
    setOpen(true);
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();
    if (isCurrentMonth) return;
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const date = new Date(viewYear, viewMonth, day);
    if (date > today) return;
    if (minDateParsed && date < minDateParsed) return;
    props.onChange(toYMD(date));
    setOpen(false);
  };

  const onClickToday = () => {
    props.onChange(toYMD(today));
    setOpen(false);
  };

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const rawFirstDay = new Date(viewYear, viewMonth, 1).getDay();
  const firstDay = rawFirstDay === 0 ? 6 : rawFirstDay - 1;
  const isCurrentMonth = viewYear === today.getFullYear() && viewMonth === today.getMonth();

  return (
    <>
      <TouchableOpacity
        onPress={handleOpen}
        style={styles.trigger}
        activeOpacity={0.7}
      >
        <Text style={[styles.triggerText, !props.value && styles.triggerPlaceholder]}>
          {selected ? formatDisplay(selected) : "Select a date"}
        </Text>
        <Ionicons name="calendar-outline" size={16} color="#9ca3af" />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={styles.calendar} onPress={() => {}}>

            {/* Month navigation */}
            <View style={styles.navRow}>
              <TouchableOpacity onPress={prevMonth} style={styles.navButton} activeOpacity={0.7}>
                <Ionicons name="chevron-back-outline" size={14} color="#6b7280" />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>
                {MONTHS[viewMonth]} {viewYear}
              </Text>
              <TouchableOpacity
                onPress={nextMonth}
                style={[styles.navButton, isCurrentMonth && styles.navButtonDisabled]}
                activeOpacity={isCurrentMonth ? 1 : 0.7}
                disabled={isCurrentMonth}
              >
                <Ionicons
                  name="chevron-forward-outline"
                  size={14}
                  color={isCurrentMonth ? "#e5e7eb" : "#6b7280"}
                />
              </TouchableOpacity>
            </View>

            {/* Day headers */}
            <View style={styles.gridRow}>
              {DAY_HEADERS.map((d) => (
                <View key={d} style={styles.gridCell}>
                  <Text style={styles.dayHeader}>{d}</Text>
                </View>
              ))}
            </View>

            {/* Day grid */}
            <View style={styles.grid}>
              {Array.from({ length: firstDay }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.gridCell} />
              ))}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const date = new Date(viewYear, viewMonth, day);
                const isFuture = date > today;
                const isTooEarly = !!minDateParsed && date < minDateParsed;
                const isDisabled = isFuture || isTooEarly;
                const isToday = date.getTime() === today.getTime();
                const isSelected = !!selected && date.getTime() === selected.getTime();

                return (
                  <TouchableOpacity
                    key={day}
                    onPress={() => handleSelectDay(day)}
                    disabled={isDisabled}
                    style={[
                      styles.gridCell,
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                      !isSelected && isToday && styles.dayCellToday,
                    ]}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.dayText,
                        isSelected && styles.dayTextSelected,
                        isDisabled && styles.dayTextDisabled,
                        !isSelected && !isDisabled && isToday && styles.dayTextToday,
                      ]}
                    >
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Today shortcut */}
            <View style={styles.footer}>
              <TouchableOpacity onPress={onClickToday} activeOpacity={0.7}>
                <Text style={styles.todayText}>Today</Text>
              </TouchableOpacity>
            </View>

          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#fff",
  },
  triggerText: {
    fontSize: 13,
    color: "#111827",
    flex: 1,
  },
  triggerPlaceholder: {
    color: "#9ca3af",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  calendar: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    width: 288,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  navButton: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    justifyContent: "center",
  },
  navButtonDisabled: {
    backgroundColor: "#f9fafb",
  },
  monthLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  gridRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridCell: {
    width: `${100 / 7}%`,
    alignItems: "center",
    justifyContent: "center",
  },
  dayHeader: {
    fontSize: 10,
    fontWeight: "500",
    color: "#9ca3af",
    paddingVertical: 4,
  },
  dayCell: {
    height: 32,
    borderRadius: 8,
  },
  dayCellSelected: {
    backgroundColor: "#7c3aed",
  },
  dayCellToday: {
    backgroundColor: "transparent",
  },
  dayText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
  },
  dayTextSelected: {
    color: "#fff",
  },
  dayTextDisabled: {
    color: "#e5e7eb",
  },
  dayTextToday: {
    color: "#7c3aed",
    fontWeight: "700",
  },
  footer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f9fafb",
    alignItems: "center",
  },
  todayText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#7c3aed",
  },
});

export default DateInput;