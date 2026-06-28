import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
  FlatList,
  StyleSheet
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

const AssetSearchSelect: React.FC<
  AssetSearchSelectProps
> = ({
  assets,
  value,
  onChange,
  placeholder = "Search for an asset...",
  onAddCustomAsset,
}) => {
  const containerRef = useRef<View>(null);

  const [query, setQuery] =
    useState("");

  const [open, setOpen] =
    useState(false);

  const [position, setPosition] =
    useState({
      top: 0,
      left: 0,
      width: 0,
    });

  const selectedAsset =
    assets.find(
      (a) => a.id === value
    ) ?? null;

  const displayName = (
    asset: Asset
  ) => {
    if (
      asset.officialName &&
      asset.tickerName
    ) {
      return `${asset.officialName} (${asset.tickerName})`;
    }

    return (
      asset.officialName ??
      asset.tickerName ??
      ""
    );
  };

  const filtered =
    useMemo(() => {
      const q =
        query.toLowerCase();

      return assets.filter(
        (asset) =>
          asset.officialName
            ?.toLowerCase()
            .includes(q) ||
          asset.tickerName
            ?.toLowerCase()
            .includes(q)
      );
    }, [query, assets]);

  const openDropdown =
    () => {
      containerRef.current?.measureInWindow(
        (
          x,
          y,
          width,
          height
        ) => {
          setPosition({
            left: x,
            top:
              y +
              height +
              4,
            width,
          });

          setOpen(true);
        }
      );
    };

  const closeDropdown =
    () => {
      setOpen(false);
      setQuery("");
    };

  const handleSelect = (
    asset: Asset
  ) => {
    onChange(asset.id);
    closeDropdown();
  };

  return (
    <View ref={containerRef}>
      <TextInput
        style={styles.input}
        placeholder={
          open
            ? placeholder
            : selectedAsset
              ? displayName(
                  selectedAsset
                )
              : placeholder
        }
        value={
          open
            ? query
            : selectedAsset
              ? displayName(
                  selectedAsset
                )
              : ""
        }
        onFocus={() => {
          setQuery("");
          openDropdown();
        }}
        onChangeText={(
          text
        ) => {
          setQuery(text);

          if (
            !open
          ) {
            openDropdown();
          }

          if (
            text ===
            ""
          ) {
            onChange(
              ""
            );
          }
        }}
      />

      <Modal
        visible={
          open
        }
        transparent
        animationType="fade"
      >
        <TouchableWithoutFeedback
          onPress={
            closeDropdown
          }
        >
          <View
            style={
              styles.overlay
            }
          >
            <TouchableWithoutFeedback>
              <View
                style={[
                  styles.dropdown,
                  {
                    top:
                      position.top,
                    left:
                      position.left,
                    width:
                      position.width,
                  },
                ]}
              >
                {!!onAddCustomAsset && (
                  <TouchableOpacity
                    style={
                      styles.addButton
                    }
                    onPress={() => {
                      closeDropdown();
                      onAddCustomAsset();
                    }}
                  >
                    <Ionicons
                      name="add-circle-outline"
                      size={
                        18
                      }
                      color="#9333EA"
                    />

                    <Text
                      style={
                        styles.addText
                      }
                    >
                      Add custom
                      asset
                    </Text>
                  </TouchableOpacity>
                )}

                {filtered.length ===
                0 ? (
                  <Text
                    style={
                      styles.empty
                    }
                  >
                    No assets
                    found
                  </Text>
                ) : (
                  <FlatList
                    data={
                      filtered
                    }
                    keyboardShouldPersistTaps="handled"
                    keyExtractor={(
                      item
                    ) =>
                      item.id
                    }
                    renderItem={({
                      item,
                    }) => (
                      <TouchableOpacity
                        style={
                          styles.item
                        }
                        onPress={() =>
                          handleSelect(
                            item
                          )
                        }
                      >
                        <Text
                          numberOfLines={
                            1
                          }
                          style={
                            styles.name
                          }
                        >
                          {item.officialName ??
                            item.tickerName}
                        </Text>

                        {!!(
                          item.tickerName &&
                          item.officialName
                        ) && (
                          <Text
                            style={
                              styles.ticker
                            }
                          >
                            {
                              item.tickerName
                            }
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

const styles =
  StyleSheet.create({
    input: {
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
      borderRadius: 12,
      padding: 12,
      backgroundColor:
        "white",
    },

    overlay: {
      flex: 1,
    },

    dropdown: {
      position:
        "absolute",
      backgroundColor:
        "white",
      borderRadius: 16,
      borderWidth: 1,
      borderColor:
        "#E5E7EB",
      maxHeight:
        DROPDOWN_MAX_HEIGHT,
      elevation: 8,
    },

    addButton: {
      flexDirection:
        "row",
      alignItems:
        "center",
      padding: 12,
      gap: 8,
      borderBottomWidth: 1,
      borderBottomColor:
        "#F3F4F6",
    },

    addText: {
      color:
        "#9333EA",
      fontWeight:
        "600",
    },

    item: {
      flexDirection:
        "row",
      justifyContent:
        "space-between",
      padding: 12,
    },

    name: {
      flex: 1,
    },

    ticker: {
      color:
        "#9CA3AF",
      marginLeft: 8,
    },

    empty: {
      padding: 12,
      color:
        "#9CA3AF",
    },
  });

export default AssetSearchSelect;