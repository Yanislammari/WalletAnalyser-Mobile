import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"
import type { Asset } from "../../models/Asset";
import { DROPDOWN_MAX_HEIGHT } from "../../constants/styles";

interface AssetSearchSelectProps {
  assets: Asset[];
  value: string;
  onChange: (assetId: string) => void;
  placeholder?: string;
  onAddCustomAsset?: () => void;
}

const AddAssetSearchSelect: React.FC<AssetSearchSelectProps> = ({
  assets,
  value,
  onChange,
  placeholder = "Search for an asset...",
  onAddCustomAsset,
}) => {
  const containerRef = useRef<View>(null);

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const selectedAsset =
    assets.find((asset) => asset.id === value) ?? null;

  const displayName = (asset: Asset): string => {
    if (asset.officialName && asset.tickerName) {
      return `${asset.officialName} (${asset.tickerName})`;
    }

    return asset.officialName ?? asset.tickerName ?? "";
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();

    return assets.filter(
      (asset) =>
        asset.officialName?.toLowerCase().includes(q) ||
        asset.tickerName?.toLowerCase().includes(q)
    );
  }, [query, assets]);

  const openDropdown = () => {
    containerRef.current?.measureInWindow((x, y, width, height) => {
      setDropdownPosition({
        top: y + height + 4,
        left: x,
        width,
      });

      setOpen(true);
    });
  };

  const handleSelect = (asset: Asset) => {
    onChange(asset.id);
    setQuery("");
    setOpen(false);
  };

  const handleInputChange = (text: string) => {
    setQuery(text);

    if (!open) {
      openDropdown();
    }

    if (text === "") {
      onChange("");
    }
  };

  const handleFocus = () => {
    setQuery("");
    openDropdown();
  };

  const handleClose = () => {
    setOpen(false);
    setQuery("");
  };

  return (
    <View ref={containerRef}>
      <TouchableOpacity
        style={[styles.input, { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 13, color: selectedAsset ? '#111827' : '#9ca3af' }}>
          {selectedAsset ? displayName(selectedAsset) : placeholder}
        </Text>
        <Ionicons name="chevron-down-outline" size={13} color="#9ca3af" />
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
      >
        <TouchableWithoutFeedback onPress={handleClose}>
          <View style={styles.overlay}>
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.dropdown,
                  {
                    top: dropdownPosition.top,
                    left: dropdownPosition.left,
                    width: dropdownPosition.width,
                  },
                ]}
              >
                {onAddCustomAsset && (
                  <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => {
                      handleClose();
                      onAddCustomAsset();
                    }}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={18}
                      color="#9333EA"
                    />

                    <Text style={styles.addText}>
                      Add custom asset
                    </Text>
                  </TouchableOpacity>
                )}

                {filtered.length === 0 ? (
                  <Text style={styles.empty}>
                    No assets found
                  </Text>
                ) : (
                  <FlatList
                    keyboardShouldPersistTaps="handled"
                    data={filtered}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={styles.option}
                        onPress={() => handleSelect(item)}
                      >
                        <Text
                          style={styles.assetName}
                          numberOfLines={1}
                        >
                          {item.officialName ??
                            item.tickerName}
                        </Text>

                        {!!(
                          item.tickerName &&
                          item.officialName
                        ) && (
                          <Text style={styles.ticker}>
                            {item.tickerName}
                          </Text>
                        )}
                      </TouchableOpacity>
                    )}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "white",
  },

  overlay: {
    flex: 1,
  },

  dropdown: {
    position: "absolute",
    backgroundColor: "white",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    maxHeight: DROPDOWN_MAX_HEIGHT,
    overflow: "hidden",
    elevation: 10,
  },

  addButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },

  addText: {
    color: "#9333EA",
    fontWeight: "600",
  },

  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 12,
  },

  assetName: {
    flex: 1,
    color: "#1F2937",
  },

  ticker: {
    color: "#9CA3AF",
    fontSize: 12,
    marginLeft: 8,
  },

  empty: {
    padding: 12,
    color: "#9CA3AF",
  },
});

export default AddAssetSearchSelect;