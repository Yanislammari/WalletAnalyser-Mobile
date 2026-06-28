import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons"

import type { Asset } from "../models/Asset";
import AssetService from "../services/AssetService";
import Icon from "react-native-vector-icons/Ionicons";

interface AssetPreview {
  ticker: string;
  officialName: string | null;
  currency: string | null;
  price: number | null;
  assetType: string | null;
}

interface AddCustomAssetModalProps {
  visible: boolean;
  onClose: () => void;
  onAssetCreated: (asset: Asset) => void;
}

const AddCustomAssetModal: React.FC<
  AddCustomAssetModalProps
> = ({
  visible,
  onClose,
  onAssetCreated,
}) => {
  const assetService = AssetService.getInstance();

  const [ticker, setTicker] = useState("");
  const [preview, setPreview] =
    useState<AssetPreview | null>(null);

  const [notFound, setNotFound] = useState(false);
  const [previewing, setPreviewing] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const reset = () => {
    setTicker("");
    setPreview(null);
    setNotFound(false);
    setPreviewing(false);
    setSaving(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handlePreview = async () => {
    const t = ticker.trim().toUpperCase();

    if (!t) {
      return;
    }

    setPreview(null);
    setNotFound(false);
    setPreviewing(true);

    try {
      const info =
        await assetService.previewCustomAsset(t);

      if (!info) {
        setNotFound(true);
      } else {
        setPreview(info);
      }
    } catch {
      setNotFound(true);
    } finally {
      setPreviewing(false);
    }
  };

  const handleSave = async () => {
    if (!preview) {
      return;
    }

    setSaving(true);

    try {
      const asset =
        await assetService.createCustomAsset(
          preview.ticker
        );

      Alert.alert(
        "Success",
        `${preview.ticker} added to your assets`
      );

      onAssetCreated(asset);

      handleClose();
    } catch {
      Alert.alert(
        "Error",
        "Failed to save asset"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="search"
                  size={18}
                  color="#9333EA"
                />
              </View>

              <Text style={styles.title}>
                Add custom asset
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleClose}
            >
              <Ionicons
                name="close"
                size={22}
                color="#9CA3AF"
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>
            Ticker symbol
          </Text>

          <View style={styles.inputRow}>
            <TextInput
              value={ticker}
              autoCapitalize="characters"
              placeholder="e.g. AAPL, LVMH.PA"
              style={styles.input}
              onChangeText={(text) => {
                setTicker(
                  text.toUpperCase()
                );

                setPreview(null);
                setNotFound(false);
              }}
              onSubmitEditing={
                handlePreview
              }
            />

            <TouchableOpacity
              disabled={
                !ticker.trim() ||
                previewing
              }
              style={
                styles.previewButton
              }
              onPress={
                handlePreview
              }
            >
              {previewing ? (
                <ActivityIndicator />
              ) : (
                <Icon
                  name="check-circle-outline"
                  size={22}
                  color="#9333EA"
                />
              )}
            </TouchableOpacity>
          </View>

          {notFound && (
            <View
              style={
                styles.errorBox
              }
            >
              <Text
                style={
                  styles.errorText
                }
              >
                This ticker was not
                found on Yahoo
                Finance.
              </Text>
            </View>
          )}

          {preview && (
            <View
              style={
                styles.preview
              }
            >
              <Row
                label="Ticker"
                value={
                  preview.ticker
                }
              />

              {preview
                .officialName && (
                <Row
                  label="Name"
                  value={
                    preview.officialName
                  }
                />
              )}

              {preview
                .currency && (
                <Row
                  label="Currency"
                  value={
                    preview.currency
                  }
                />
              )}

              {preview.price !=
                null && (
                <Row
                  label="Price"
                  value={`${preview.price} ${
                    preview.currency ??
                    ""
                  }`}
                />
              )}

              {preview
                .assetType && (
                <Row
                  label="Type"
                  value={
                    preview.assetType
                  }
                />
              )}
            </View>
          )}

          <View
            style={
              styles.footer
            }
          >
            <TouchableOpacity
              style={
                styles.cancel
              }
              onPress={
                handleClose
              }
            >
              <Text>
                Cancel
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              disabled={
                !preview ||
                saving
              }
              style={[
                styles.save,
                (!preview ||
                  saving) && {
                  opacity: 0.5,
                },
              ]}
              onPress={
                handleSave
              }
            >
              {saving ? (
                <ActivityIndicator
                  color="white"
                />
              ) : (
                <Text
                  style={
                    styles.saveText
                  }
                >
                  Add asset
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const Row = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <View style={styles.row}>
    <Text style={styles.rowLabel}>
      {label}
    </Text>

    <Text style={styles.rowValue}>
      {value}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor:
      "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },

  modal: {
    backgroundColor:
      "white",
    borderRadius: 24,
    padding: 20,
  },

  header: {
    flexDirection: "row",
    justifyContent:
      "space-between",
    marginBottom: 20,
  },

  titleRow: {
    flexDirection: "row",
    alignItems:
      "center",
  },

  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor:
      "#F3E8FF",
    justifyContent:
      "center",
    alignItems:
      "center",
    marginRight: 10,
  },

  title: {
    fontWeight: "700",
    fontSize: 16,
  },

  label: {
    marginBottom: 8,
    color: "#6B7280",
  },

  inputRow: {
    flexDirection: "row",
    gap: 8,
  },

  input: {
    flex: 1,
    borderWidth: 1,
    borderColor:
      "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },

  previewButton: {
    width: 48,
    justifyContent:
      "center",
    alignItems:
      "center",
    backgroundColor:
      "#F3E8FF",
    borderRadius: 12,
  },

  errorBox: {
    marginTop: 14,
    backgroundColor:
      "#FEF2F2",
    padding: 12,
    borderRadius: 12,
  },

  errorText: {
    color: "#DC2626",
  },

  preview: {
    marginTop: 16,
    padding: 14,
    backgroundColor:
      "#F9FAFB",
    borderRadius: 14,
    gap: 10,
  },

  row: {
    flexDirection: "row",
    justifyContent:
      "space-between",
  },

  rowLabel: {
    color: "#9CA3AF",
  },

  rowValue: {
    color: "#111827",
  },

  footer: {
    flexDirection: "row",
    marginTop: 20,
    gap: 10,
  },

  cancel: {
    flex: 1,
    padding: 14,
    backgroundColor:
      "#F3F4F6",
    borderRadius: 12,
    alignItems:
      "center",
  },

  save: {
    flex: 1,
    padding: 14,
    backgroundColor:
      "#9333EA",
    borderRadius: 12,
    alignItems:
      "center",
  },

  saveText: {
    color: "white",
    fontWeight: "600",
  },
});

export default AddCustomAssetModal;