import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  StyleSheet,
  Keyboard
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import type { Currency } from "../models/Currency";
import type { Asset } from "../models/Asset";
import type { AssetBuyResponse } from "../responses/AssetBuyResponse";
import InputModeToggle from "./transactions/InputModeToggle";
import DateInput from "./transactions/DateInput";
import AddCustomAssetModal from "./AddCustomAssetModal";
import PortfolioService from "../services/PortfolioService";
import AssetService from "../services/AssetService";
import CurrencyService from "../services/CurrencyService";
import { emptyBuy, type BuyForm } from "../forms/BuyForm";
import { InputMode } from "../enums/InputMode";
import type { AssetPriceResponse } from "../responses/AssetPriceResponse";
import { useAuth } from "../providers/AuthProvider";
import { toast } from "sonner-native";
import CurrencyPicker from "./picker/CurrencyPicker";
import AssetSearchSelect from "./transactions/AssetSearchSelect";

interface AddNewBuyModalProps {
  visible: boolean;
  onClose: () => void;
  currencies: Currency[];
  portfolioId: string;
  onSuccess: (buy: AssetBuyResponse) => void;
  editTransaction?: AssetBuyResponse;
}

const AddNewBuyModal: React.FC<AddNewBuyModalProps> = (props) => {
  const isEditMode = !!props.editTransaction;
  const [form, setForm] = useState<BuyForm>(emptyBuy());
  const [saving, setSaving] = useState<boolean>(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [priceLoading, setPriceLoading] = useState<boolean>(false);
  const [autoFilled, setAutoFilled] = useState<boolean>(false);
  const [notEnoughShare, setNotEnoughShare] = useState<boolean>(false)
  const [customAssetVisible, setCustomAssetVisible] = useState<boolean>(false);
  const [baseFetchedPrice, setBaseFetchedPrice] = useState<number | null>(null);
  const skipNextPriceFetch = useRef(false);
  const portfolioService = PortfolioService.getInstance();
  const assetService = AssetService.getInstance();
  const currencyService = CurrencyService.getInstance();
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const { isPro } = useAuth();
  const freeMinDate = !isPro
    ? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    : undefined;

  useEffect(() => {
    if (!props.editTransaction?.assetId) {
      setSelectedAsset(null);
      return;
    }
    assetService.getAssetById(props.editTransaction.assetId)
      .then(setSelectedAsset)
      .catch(() => {});
  }, [props.editTransaction?.assetId]);

  // Pre-fill form in edit mode
  useEffect(() => {
    if (!props.editTransaction) return;
    const tx = props.editTransaction;
    const mode = tx.assetBuyShare != null ? InputMode.SHARES : InputMode.AMOUNT;
    skipNextPriceFetch.current = true;
    setForm({
      date: tx.buyDate,
      assetId: tx.assetId ?? "",
      currencyId: tx.buyCurrencyId,
      inputMode: mode,
      amount: tx.assetBuyAmount != null ? String(tx.assetBuyAmount) : "",
      shares: tx.assetBuyShare != null ? String(tx.assetBuyShare) : "",
      pricePerShare: tx.assetBuyPricePerShare != null ? String(tx.assetBuyPricePerShare) : "",
    });
    setAutoFilled(false);
  }, [props.editTransaction]);

  useEffect(() => {
    if (!isEditMode && props.currencies.length > 0) {
      const eur = props.currencies.find((c) => c.currencyName === "EUR")?.uuid ?? props.currencies[0].uuid;
      setForm((f) => ({ ...f, currencyId: f.currencyId || eur }));
    }
  }, [props.currencies, isEditMode]);

  useEffect(() => {
    if (!form.assetId || !form.date) { setBaseFetchedPrice(null); return; }
    let cancelled = false;
    setPriceLoading(true);
    setAutoFilled(false);
    assetService.getAssetPrice(form.assetId, form.date)
      .then((r: AssetPriceResponse | null) => {
        if (!cancelled) setBaseFetchedPrice(r?.price ?? null);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPriceLoading(false); });
    return () => { cancelled = true; };
  }, [form.assetId, form.date]);

  useEffect(() => {
    if (baseFetchedPrice == null || !form.currencyId) return;
    const sel = assets.find((a) => a.id === form.assetId);
    const baseCcy = props.currencies.find((c) => c.uuid === sel?.baseCurrencyId)?.currencyName;
    const tgtCcy = props.currencies.find((c) => c.uuid === form.currencyId)?.currencyName;
    const apply = (price: number) => {
      setForm((f) => ({ ...f, pricePerShare: String(parseFloat(price.toFixed(4))) }));
      setAutoFilled(true);
    };
    if (!baseCcy || !tgtCcy || baseCcy === tgtCcy) { apply(baseFetchedPrice); return; }
    let cancelled = false;
    setPriceLoading(true);
    currencyService.convertPrice(baseCcy, tgtCcy, baseFetchedPrice)
      .then((v) => { if (!cancelled) apply(v); })
      .catch(() => { if (!cancelled) apply(baseFetchedPrice); })
      .finally(() => { if (!cancelled) setPriceLoading(false); });
    return () => { cancelled = true; };
  }, [baseFetchedPrice, form.currencyId, form.assetId]);

  const handleSave = async () => {
    if (!form.date || !props.portfolioId || !form.currencyId ) return;
    const isAmtMode = form.inputMode === InputMode.AMOUNT;
    const pricePerShare = form.pricePerShare ? parseFloat(form.pricePerShare) : undefined;
    const shares = isAmtMode
      ? (form.amount && pricePerShare ? parseFloat((parseFloat(form.amount) / pricePerShare).toFixed(6)) : undefined)
      : (form.shares ? parseFloat(form.shares) : undefined);
    const amount = isAmtMode
      ? (form.amount ? parseFloat(form.amount) : undefined)
      : (shares && pricePerShare ? parseFloat((shares * pricePerShare).toFixed(2)) : undefined);
    setSaving(true);
    setNotEnoughShare(false);
    try {
      let result: AssetBuyResponse;
      if (isEditMode && props.editTransaction) {
        result = await portfolioService.updateAssetBuy(props.portfolioId, props.editTransaction.id, {
          buyCurrencyId: form.currencyId,
          buyDate: form.date,
          assetBuyAmount: amount,
          assetBuyShare: shares,
          assetBuyPricePerShare: pricePerShare,
        });
      } else {
        result = await portfolioService.addAssetBuy({
          portfolioId: props.portfolioId,
          assetId: form.assetId || undefined,
          buyCurrencyId: form.currencyId,
          buyDate: form.date,
          assetBuyAmount: amount,
          assetBuyShare: shares,
          assetBuyPricePerShare: pricePerShare,
        });
      }
      props.onSuccess(result);
      props.onClose();
    } catch (err: any) {
      if(err.message.includes("SHARES")){
        setNotEnoughShare(true)
      }
      else{
        toast.error("An unexpected error occured. Please try again later")
        console.error(err);
      }
    } finally {
      setSaving(false);
    }
  };

  const isAmountMode = form.inputMode === InputMode.AMOUNT;
  const currencyName = props.currencies.find((c) => c.uuid === form.currencyId)?.currencyName ?? "";
  const computedTotal: number | null = (() => {
    const s = parseFloat(form.shares), p = parseFloat(form.pricePerShare);
    return !isAmountMode && s > 0 && p > 0 ? parseFloat((s * p).toFixed(2)) : null;
  })();
  const computedShares: number | null = (() => {
    const a = parseFloat(form.amount), p = parseFloat(form.pricePerShare);
    return isAmountMode && a > 0 && p > 0 ? parseFloat((a / p).toFixed(6)) : null;
  })();
  const amountNum = Number(form.amount);
  const priceNum = Number(form.pricePerShare);
  const sharesNum = Number(form.shares);

  const isDisabled = saving || !form.date || !form.currencyId
    || (isAmountMode ? (isNaN(amountNum) || amountNum <= 0) : (isNaN(sharesNum) || sharesNum <= 0))
    || isNaN(priceNum) || priceNum <= 0

  const PriceLabel = () => (
    <View style={styles.priceRow}>
      <Text style={styles.label}>Price per share</Text>
      {priceLoading && (
        <View style={styles.fetchingRow}>
          <ActivityIndicator size="small" color="#9ca3af" />
          <Text style={styles.fetchingText}>Fetching…</Text>
        </View>
      )}
      {!priceLoading && autoFilled && (
        <Text style={styles.autoFilledText}>Auto-filled</Text>
      )}
    </View>
  );

  return (
    <>
      <Modal
        visible={props.visible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (Keyboard.isVisible()) {
            Keyboard.dismiss();
          } else {
            props.onClose();
          }
        }}
      >
        <Pressable style={styles.backdrop} onPress={props.onClose}>
          <Pressable style={styles.box} onPress={() => {}}>
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.iconWrapper}>
                    <Ionicons name="trending-up-outline" size={20} color="#7c3aed" />
                  </View>
                  <Text style={styles.title}>{isEditMode ? "Edit buy" : "New buy"}</Text>
                </View>
                <TouchableOpacity onPress={props.onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="close-outline" size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>

              <View style={styles.fields}>

                {/* Date */}
                <View>
                  <Text style={styles.label}>Date</Text>
                  <DateInput
                    value={form.date}
                    onChange={(v) => setForm((f) => ({ ...f, date: v }))}
                    minDate={freeMinDate}
                  />
                  {!isPro && (
                    <Text style={styles.proNote}>
                      Free plan: dates limited to the last 12 months.
                    </Text>
                  )}
                </View>

                {/* Asset (add mode only) */}
                {!isEditMode && (
                  <View>
                    <Text style={styles.label}>Asset</Text>
                    <AssetSearchSelect
                      selectedAsset={selectedAsset}
                      onSelect={(asset) => {
                        setSelectedAsset(asset);
                        setForm((f) => ({ ...f, assetId: asset?.id ?? "" }));
                      }}
                      fetchAssets={(search, offset, limit) =>
                        assetService.getAssetsPaginated(search, offset, limit)
                      }
                      onAddCustomAsset={() => setCustomAssetVisible(true)}
                    />
                  </View>
                )}

                {/* Company name (edit mode) */}
                {isEditMode && props.editTransaction?.companyName && (
                  <View style={styles.companyBadge}>
                    <Text style={styles.companyBadgeText}>{props.editTransaction.companyName}</Text>
                  </View>
                )}

                {/* Input mode toggle */}
                <View>
                  <Text style={[styles.label, { marginBottom: 6 }]}>Enter by</Text>
                  <InputModeToggle
                    value={form.inputMode}
                    onChange={(v) => setForm((f) => ({ ...f, inputMode: v }))}
                  />
                </View>

                {isAmountMode ? (
                  <>
                    {/* Amount + Currency */}
                    {notEnoughShare && 
                      <Text style={styles.errorText}>Not enough share to cover all your selling position</Text>
                    }
                    <View style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.label}>Total amount</Text>
                        <TextInput
                          style={styles.input}
                          keyboardType="decimal-pad"
                          value={form.amount}
                          onChangeText={(v) => setForm((f) => ({ ...f, amount: v }))}
                          placeholder="0.00"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                      <View style={{ width: 112 }}>
                        <Text style={styles.label}>Currency</Text>
                        <CurrencyPicker
                          currencies={props.currencies}
                          value={form.currencyId}
                          onChange={(v) => setForm((f) => ({ ...f, currencyId: v }))}
                        />
                      </View>
                    </View>

                    {/* Price per share */}
                    <View>
                      <PriceLabel />
                      <TextInput
                        style={styles.input}
                        keyboardType="decimal-pad"
                        value={form.pricePerShare}
                        onChangeText={(v) => { setAutoFilled(false); setForm((f) => ({ ...f, pricePerShare: v })); }}
                        placeholder="0.00"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>

                    {computedShares != null && (
                      <View style={styles.computedRow}>
                        <Text style={styles.computedLabel}>Shares</Text>
                        <Text style={styles.computedValue}>{computedShares}</Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    {/* Shares */}
                    {notEnoughShare && 
                      <Text style={styles.errorText}>Not enough share to cover all your selling position</Text>
                    }
                    <View>
                      <Text style={styles.label}>Number of shares</Text>
                      <TextInput
                        style={styles.input}
                        keyboardType="decimal-pad"
                        value={form.shares}
                        onChangeText={(v) => setForm((f) => ({ ...f, shares: v }))}
                        placeholder="0"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>

                    {/* Price per share + Currency */}
                    <View style={styles.row}>
                      <View style={{ flex: 1 }}>
                        <PriceLabel />
                        <TextInput
                          style={styles.input}
                          keyboardType="decimal-pad"
                          value={form.pricePerShare}
                          onChangeText={(v) => { setAutoFilled(false); setForm((f) => ({ ...f, pricePerShare: v })); }}
                          placeholder="0.00"
                          placeholderTextColor="#9ca3af"
                        />
                      </View>
                      <View style={{ width: 112 }}>
                        <Text style={styles.label}>Currency</Text>
                        <CurrencyPicker
                          currencies={props.currencies}
                          value={form.currencyId}
                          onChange={(v) => setForm((f) => ({ ...f, currencyId: v }))}
                        />
                      </View>
                    </View>

                    {computedTotal != null && (
                      <View style={styles.computedRow}>
                        <Text style={styles.computedLabel}>Total</Text>
                        <Text style={styles.computedValue}>{computedTotal} {currencyName}</Text>
                      </View>
                    )}
                  </>
                )}

                {/* Actions */}
                <View style={[styles.row, { paddingTop: 4 }]}>
                  <TouchableOpacity
                    onPress={props.onClose}
                    style={[styles.btn, styles.btnCancel]}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.btnCancelText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={isDisabled}
                    style={[styles.btn, styles.btnSave, isDisabled && styles.btnDisabled]}
                    activeOpacity={0.7}
                  >
                    {saving
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <Text style={styles.btnSaveText}>{isEditMode ? "Save" : "Add"}</Text>
                    }
                  </TouchableOpacity>
                </View>

              </View>
          </Pressable>
        </Pressable>
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
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-end",
  },
  box: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#f5f3ff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  fields: {
    gap: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: "#111827",
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  fetchingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  fetchingText: {
    fontSize: 11,
    color: "#9ca3af",
  },
  autoFilledText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#7c3aed",
  },
  computedRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  computedLabel: {
    fontSize: 13,
    color: "#6b7280",
  },
  computedValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  companyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
  },
  companyBadgeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
  },
  proNote: {
    fontSize: 11,
    color: "#d97706",
    marginTop: 4,
  },
  btn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  btnCancel: {
    backgroundColor: "#f3f4f6",
  },
  btnSave: {
    backgroundColor: "#7c3aed",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnCancelText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
  },
  btnSaveText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
  errorText: {
    fontSize: 11,
    color: "#ef4444",
    marginTop: 4,
  },
});

export default AddNewBuyModal;