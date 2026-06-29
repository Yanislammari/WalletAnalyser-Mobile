import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import type { Currency } from "../models/Currency";
import type { Asset } from "../models/Asset";
import type { AssetDividendResponse } from "../responses/AssetDividendResponse";
import PortfolioService from "../services/PortfolioService";
import AssetService from "../services/AssetService";
import AssetSearchSelect from "./transactions/AssetSearchSelect";
import AddCustomAssetModal from "./AddCustomAssetModal";
import DateInput from "./transactions/DateInput";
import { emptyDividend, type DividendForm } from "../forms/DividendForm";
import { useAuth } from "../providers/AuthProvider";
import Ionicons from "react-native-vector-icons/Ionicons";
import CurrencyPicker from "./picker/CurrencyPicker";

interface Props {
  visible: boolean;
  onClose: () => void;
  currencies: Currency[];
  portfolioId: string;
  onSuccess: (dividend: AssetDividendResponse) => void;
  editTransaction?: AssetDividendResponse;
}

const AddNewDividendModal: React.FC<Props> = ({
  visible,
  onClose,
  currencies,
  portfolioId,
  onSuccess,
  editTransaction,
}) => {
  const isEditMode = !!editTransaction;

  const [form, setForm] = useState<DividendForm>(emptyDividend());
  const [saving, setSaving] = useState(false);
  const [assets, setAssets] = useState<Asset[]>([]);

  const customAssetRef = useRef<any>(null);
  const [customAssetVisible, setCustomAssetVisible] = useState<boolean>(false);

  const portfolioService = PortfolioService.getInstance();
  const assetService = AssetService.getInstance();

  const { isPro } = useAuth();

  const freeMinDate = useMemo(() => {
    if (isPro) return undefined;
    return new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
  }, [isPro]);

  useEffect(() => {
    assetService.getAssets().then(setAssets).catch(() => setAssets([]));
  }, []);

  useEffect(() => {
    if (!currencies.length) return;

    const eur =
      currencies.find((c) => c.currencyName === "EUR")?.uuid ??
      currencies[0]?.uuid ??
      "";

    setForm((f) => ({
      ...f,
      currencyId: f.currencyId || eur,
    }));
  }, [currencies]);

  useEffect(() => {
    if (!editTransaction) return;

    setForm({
      date: editTransaction.cashflowDate,
      assetId: "",
      amount: String(editTransaction.cashflowAmount),
      currencyId: editTransaction.currencyId,
    });
  }, [editTransaction]);

  const reset = () => {
    setSaving(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = async () => {
    if (!form.date || !form.amount || !form.currencyId) return;

    setSaving(true);

    try {
      let result: AssetDividendResponse;

      if (isEditMode && editTransaction) {
        result = await portfolioService.updateAssetDividend(
          portfolioId,
          editTransaction.id,
          {
            currencyId: form.currencyId,
            cashflowDate: form.date,
            cashflowAmount: parseFloat(form.amount),
          }
        );
      } else {
        result = await portfolioService.addAssetDividend({
          portfolioId,
          assetId: form.assetId || undefined,
          currencyId: form.currencyId,
          cashflowDate: form.date,
          cashflowAmount: parseFloat(form.amount),
        });
      }

      onSuccess(result);
      handleClose();
    } catch {
      
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.card}>
            <Text style={styles.title}>
              {isEditMode ? "Edit dividend" : "New dividend"}
            </Text>

            {/* DATE */}
            <Text style={styles.label}>Date</Text>
            <DateInput
              value={form.date}
              onChange={(v) =>
                setForm((f) => ({ ...f, date: v }))
              }
              minDate={freeMinDate}
            />

            {/* ASSET */}
            {!isEditMode && (
              <>
                <Text style={styles.label}>Asset</Text>
                <AssetSearchSelect
                  assets={assets}
                  value={form.assetId}
                  onChange={(assetId) =>
                    setForm((f) => ({ ...f, assetId }))
                  }
                  onAddCustomAsset={() =>
                    customAssetRef.current?.open()
                  }
                />
              </>
            )}

            {/* AMOUNT */}
            <Text style={styles.label}>Amount</Text>
            <TextInput
              keyboardType="numeric"
              value={form.amount}
              onChangeText={(v) =>
                setForm((f) => ({
                  ...f,
                  amount: v,
                }))
              }
              style={styles.input}
            />

            {/* CURRENCY */}
            <Text style={styles.label}>Currency</Text>
            <CurrencyPicker
              currencies={currencies}
              value={form.currencyId}
              onChange={(v) => setForm((f) => ({ ...f, currencyId: v }))}
            />

            {/* ACTIONS */}
            <View style={styles.row}>
              <TouchableOpacity
                onPress={handleClose}
                style={styles.cancel}
              >
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={
                  !form.date ||
                  !form.amount ||
                  !form.currencyId ||
                  saving
                }
                onPress={handleSave}
                style={styles.save}
              >
                {saving ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: "white" }}>
                    {isEditMode ? "Save" : "Add"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <AddCustomAssetModal
        visible={customAssetVisible}
        onClose={() => setCustomAssetVisible(false)}
        onAssetCreated={(newAsset) => {
          setAssets((prev) => [...prev, newAsset]);
          setForm((f) => ({ ...f, assetId: newAsset.id }));
          setCustomAssetVisible(false);
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    padding: 20,
  },

  card: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
  },

  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    color: "#111827",
  },

  label: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 6,
    marginTop: 10,
  },

  input: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "white",
  },

  picker: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    height : 35,
    overflow: "hidden"
  },

  row: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },

  cancel: {
    flex: 1,
    padding: 12,
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    alignItems: "center",
  },

  save: {
    flex: 1,
    padding: 12,
    backgroundColor: "#9333EA",
    borderRadius: 12,
    alignItems: "center",
  },
});

export default AddNewDividendModal;