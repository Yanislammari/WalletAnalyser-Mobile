import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

interface PaginationProps {
  page: number;
  total: number;
  pageSize: number;
  onChange: (page: number) => void;
  displayTotal?: number;
}

const Pagination: React.FC<PaginationProps> = (props) => {
  const shownTotal = props.displayTotal ?? props.total;
  const totalPages = Math.ceil(props.total / props.pageSize);

  if (props.total === 0) return null;

  const clampedTotalPages = Math.max(totalPages, 1);
  const pages: (number | "...")[] = [];

  if (clampedTotalPages <= 7) {
    for (let i = 1; i <= clampedTotalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (props.page > 3) pages.push("...");

    const start = Math.max(2, props.page - 1);
    const end = Math.min(clampedTotalPages - 1, props.page + 1);
    for (let i = start; i <= end; i++) pages.push(i);

    if (props.page < clampedTotalPages - 2) pages.push("...");
    pages.push(clampedTotalPages);
  }

  const isPrevDisabled = props.page === 1;
  const isNextDisabled = props.page === clampedTotalPages;

  return (
    <View style={styles.container}>
      <Text style={styles.totalText}>
        {shownTotal} result{shownTotal !== 1 ? "s" : ""}
      </Text>

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={() => props.onChange(props.page - 1)}
          disabled={isPrevDisabled}
          style={[styles.pageButton, isPrevDisabled && styles.buttonDisabled]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-back-outline"
            size={15}
            color={isPrevDisabled ? "#d1d5db" : "#9ca3af"}
          />
        </TouchableOpacity>

        {pages.map((page, index) =>
          page === "..." ? (
            <View key={`ellipsis-${index}`} style={styles.pageButton}>
              <Text style={styles.ellipsis}>…</Text>
            </View>
          ) : (
            <TouchableOpacity
              key={page}
              onPress={() => props.onChange(page as number)}
              style={[styles.pageButton, page === props.page && styles.pageButtonActive]}
              activeOpacity={0.7}
            >
              <Text style={[styles.pageText, page === props.page && styles.pageTextActive]}>
                {page}
              </Text>
            </TouchableOpacity>
          )
        )}

        <TouchableOpacity
          onPress={() => props.onChange(props.page + 1)}
          disabled={isNextDisabled}
          style={[styles.pageButton, isNextDisabled && styles.buttonDisabled]}
          activeOpacity={0.7}
        >
          <Ionicons
            name="chevron-forward-outline"
            size={15}
            color={isNextDisabled ? "#d1d5db" : "#9ca3af"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  totalText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  pageButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  pageButtonActive: {
    backgroundColor: "#7c3aed",
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  pageText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#4b5563",
  },
  pageTextActive: {
    color: "#fff",
  },
  ellipsis: {
    fontSize: 12,
    color: "#9ca3af",
  },
});

export default Pagination;