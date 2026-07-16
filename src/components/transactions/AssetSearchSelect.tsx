import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  TextInput,
  FlatList,
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  Keyboard,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { Asset } from "../../models/Asset";

const PAGE_SIZE = 10;

interface AssetSearchSelectProps {
  selectedAsset: Asset | null;
  onSelect: (asset: Asset | null) => void;
  fetchAssets: (search: string, offset: number, limit: number) => Promise<{ assets: Asset[]; hasMore: boolean }>;
  placeholder?: string;
  onAddCustomAsset?: () => void;
}

function AssetSearchSelect({
  selectedAsset,
  onSelect,
  fetchAssets,
  placeholder = "Search for an asset...",
  onAddCustomAsset,
}: AssetSearchSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [offset, setOffset] = useState(0);

  const inputRef = useRef<TextInput>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeQueryRef = useRef<string>("");
  const loadingMoreRef = useRef(false);

  const displayName = (asset: Asset): string => {
    if (asset.officialName && asset.tickerName) return `${asset.officialName} (${asset.tickerName})`;
    return asset.officialName ?? asset.tickerName ?? "";
  };

  const loadFirst = useCallback(async (search: string) => {
    activeQueryRef.current = search;
    setLoading(true);
    setItems([]);
    setOffset(0);
    setHasMore(false);
    try {
      const result = await fetchAssets(search, 0, PAGE_SIZE);
      if (activeQueryRef.current !== search) return;
      setItems(result.assets);
      setHasMore(result.hasMore);
      setOffset(PAGE_SIZE);
    } catch { /* ignore */ }
    finally { if (activeQueryRef.current === search) setLoading(false); }
  }, [fetchAssets]);

  const loadMore = useCallback(async (currentOffset: number, search: string) => {
    if (loadingMoreRef.current || !hasMore) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    try {
      const result = await fetchAssets(search, currentOffset, PAGE_SIZE);
      if (activeQueryRef.current !== search) return;
      setItems((prev) => [...prev, ...result.assets]);
      setHasMore(result.hasMore);
      setOffset(currentOffset + PAGE_SIZE);
    } catch { /* ignore */ }
    finally { loadingMoreRef.current = false; setLoadingMore(false); }
  }, [fetchAssets, hasMore]);

  // Focus control
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      inputRef.current?.blur();
      Keyboard.dismiss();
    }
  }, [open]);

  const handleOpen = () => {
    setQuery("");
    activeQueryRef.current = "";
    setOpen(true);
    loadFirst("");
  };

  const handleClose = () => {
    setQuery("");
    setOpen(false);
  };

  const handleToggle = () => {
    if (open) {
      handleClose();
    } else {
      handleOpen();
    }
  };

  const handleInputChange = (val: string) => {
    setQuery(val);
    if (val === "") onSelect(null);
    if (!open) setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => loadFirst(val), 300);
  };

  const handleSelect = (asset: Asset) => {
    onSelect(asset);
    handleClose();
  };

  const handleAddCustomAsset = () => {
    handleClose();
    onAddCustomAsset?.();
  };

  const renderItem = ({ item }: { item: Asset }) => (
    <Pressable
      onPress={() => handleSelect(item)}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: "#faf5ff" }]}
    >
      <Text style={styles.rowText} numberOfLines={1}>{item.officialName ?? item.tickerName}</Text>
      {item.tickerName && item.officialName && <Text style={styles.rowTicker}>{item.tickerName}</Text>}
    </Pressable>
  );

  return (
    <View style={styles.container}>
      {open && (
        <View 
          style={styles.backdrop} 
          onStartShouldSetResponder={() => {
            handleClose();
            return true;
          }}
        />
      )}

      <Pressable onPress={handleToggle} style={styles.inputWrapper}>
        <View style={styles.inputContainer} pointerEvents={open ? "auto" : "none"}>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder={selectedAsset ? displayName(selectedAsset) : placeholder}
            placeholderTextColor={selectedAsset ? "#111827" : "#9ca3af"}
            value={open ? query : ""}
            onChangeText={handleInputChange}
            editable={true}
          />
        </View>
        <Icon name={open ? "chevron-up" : "chevron-down"} size={18} color="#9ca3af" />
      </Pressable>

      {open && (
        <View style={styles.dropdown}>
          {onAddCustomAsset && (
            <Pressable onPress={handleAddCustomAsset} style={styles.addCustomRow}>
              <Icon name="add-circle-outline" size={16} color="#9333ea" />
              <Text style={styles.addCustomText}>Add custom asset</Text>
            </Pressable>
          )}

          {loading ? (
            <View style={styles.loaderBox}><ActivityIndicator size="small" color="#a855f7" /></View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              nestedScrollEnabled
              style={styles.list}
              onEndReachedThreshold={0.3}
              onEndReached={() => loadMore(offset, activeQueryRef.current)}
              keyboardShouldPersistTaps="always"
              ListEmptyComponent={<Text style={styles.emptyText}>No assets found</Text>}
              ListFooterComponent={
                loadingMore ? <View style={styles.loaderBoxSmall}><ActivityIndicator size="small" color="#c084fc" /></View> : null
              }
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 1000,
  },
  backdrop: {
    position: "absolute",
    top: -1000,
    bottom: -1000,
    left: -1000,
    right: -1000,
    zIndex: 998,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#fff",
    zIndex: 999,
  },
  inputContainer: {
    flex: 1,
  },
  input: { fontSize: 13, color: "#111827", padding: 0 },
  dropdown: {
    marginTop: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    backgroundColor: "#fff",
    maxHeight: 220,
    overflow: "hidden",
    zIndex: 999,
  },
  list: { maxHeight: 220 },
  addCustomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  addCustomText: { color: "#9333ea", fontWeight: "600", fontSize: 13 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  rowText: { fontSize: 13, color: "#1f2937", flexShrink: 1 },
  rowTicker: { fontSize: 11, color: "#9ca3af" },
  emptyText: { padding: 12, fontSize: 13, color: "#9ca3af" },
  loaderBox: { paddingVertical: 16, alignItems: "center" },
  loaderBoxSmall: { paddingVertical: 8, alignItems: "center" },
});

export default AssetSearchSelect;