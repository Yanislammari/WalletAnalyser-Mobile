import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Keyboard,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import type { Currency } from "../models/Currency";
import type { Asset } from "../models/Asset";
import type { AssetSellResponse } from "../responses/AssetSellResponse";
import DateInput from "./transactions/DateInput";
import AssetSearchSelect from "./transactions/AssetSearchSelect";
import PortfolioService from "../services/PortfolioService";
import AssetService from "../services/AssetService";
import CurrencyService from "../services/CurrencyService";
import { emptySell, type SellForm } from "../forms/SellForm";
import type { AssetPriceResponse } from "../responses/AssetPriceResponse";
import { InputMode } from "../enums/InputMode";
import { useAuth } from "../providers/AuthProvider";
import CurrencyPicker from "./picker/CurrencyPicker";

interface AddNewSellModalProps {
  visible: boolean;
  onClose: () => void;
  currencies: Currency[];
  portfolioId: string;
  ownedCompanies: string[];
  onSuccess: (sell: AssetSellResponse) => void;
  editTransaction?: AssetSellResponse;
}

const AddNewSellModal: React.FC<AddNewSellModalProps> = (props) => {
  const isEditMode = !!props.editTransaction;
  const [form, setForm] = useState<SellForm>(emptySell());
  const [saving, setSaving] = useState<boolean>(false);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [priceLoading, setPriceLoading] = useState<boolean>(false);
  const [autoFilled, setAutoFilled] = useState<boolean>(false);
  const [availableShares, setAvailableShares] = useState<number | null>(null);
  const [availableSharesLoading, setAvailableSharesLoading] = useState<boolean>(false);
  const [avgBuyPrice, setAvgBuyPrice] = useState<number | null>(null);
  const [baseFetchedPrice, setBaseFetchedPrice] = useState<number | null>(null);
  const portfolioService = PortfolioService.getInstance();
  const assetService = AssetService.getInstance();
  const currencyService = CurrencyService.getInstance();
  const { isPro } = useAuth();
  const freeMinDate = !isPro
    ? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    : undefined;

  useEffect(() => {
    assetService.getAssets().then(setAssets).catch(() => setAssets([]));
  }, []);

  useEffect(() => {
    if (!props.visible || !form.assetId || !form.date) { 
      setAvailableShares(null); 
      return; 
    }
    let cancelled = false;
    setAvailableSharesLoading(true);
    portfolioService.getAvailableShares(props.portfolioId, form.assetId, form.date)
      .then((n) => { if (!cancelled) setAvailableShares(n); })
      .catch(() => { if (!cancelled) setAvailableShares(null); })
      .finally(() => { if (!cancelled) setAvailableSharesLoading(false); });
    return () => { cancelled = true; };
  }, [form.assetId, form.date, props.visible]);
  // Pre-fill form in edit mode
  useEffect(() => {
    if (!props.editTransaction) return;
    const tx = props.editTransaction;
    setForm({
      date: tx.sellDate,
      assetId: tx.assetId ?? "",
      currencyId: tx.sellCurrencyId,
      inputMode: InputMode.SHARES,
      amount: tx.assetSellAmount != null ? String(tx.assetSellAmount) : "",
      shares: tx.assetSellShare != null ? String(tx.assetSellShare) : "",
      pricePerShare: (tx.assetSellAmount != null && tx.assetSellShare != null && tx.assetSellShare > 0)
        ? String(parseFloat((tx.assetSellAmount / tx.assetSellShare).toFixed(4)))
        : "",
      capitalGain: tx.assetSellGain != null ? String(tx.assetSellGain) : "",
      gainCurrencyId: tx.sellCurrencyId,
    });
    const derivedPrice = (tx.assetSellAmount != null && tx.assetSellShare != null && tx.assetSellShare > 0)
      ? parseFloat((tx.assetSellAmount / tx.assetSellShare).toFixed(4))
      : null;
    setBaseFetchedPrice(derivedPrice);
    setAutoFilled(false);
    setAvailableShares(null);
    setAvgBuyPrice(null);
  }, [props.editTransaction]);

  // Reset form when opening in add mode
  useEffect(() => {
    if (props.visible && !props.editTransaction) {
      setAutoFilled(false);
      setAvailableShares(null);
      setAvgBuyPrice(null);
    }
  }, [props.visible]);

  useEffect(() => {
    if (!isEditMode && props.currencies.length > 0) {
      const eur = props.currencies.find((c) => c.currencyName === "EUR")?.uuid ?? props.currencies[0].uuid;
      setForm((f) => ({ ...f, currencyId: f.currencyId || eur }));
    }
  }, [props.currencies, isEditMode]);

  // Average buy price
  useEffect(() => {
    if (!form.assetId || !form.date || !form.currencyId) { setAvgBuyPrice(null); return; }
    let cancelled = false;
    portfolioService.getAverageBuyPrice(props.portfolioId, form.assetId, form.date)
      .then((avg) => { if (!cancelled) setAvgBuyPrice(avg); })
      .catch(() => { if (!cancelled) setAvgBuyPrice(null); });
    return () => { cancelled = true; };
  }, [form.assetId, form.date, form.currencyId]);

  // Auto-fill price from Yahoo
  useEffect(() => {
    if (!form.assetId || !form.date) { setBaseFetchedPrice(null); return; }
    let cancelled = false;
    setPriceLoading(true);
    setAutoFilled(false);
    assetService.getAssetPrice(form.assetId, form.date)
      .then((r: AssetPriceResponse | null) => { if (!cancelled) setBaseFetchedPrice(r?.price ?? null); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setPriceLoading(false); });
    return () => { cancelled = true; };
  }, [form.assetId, form.date, isEditMode]);

  useEffect(() => {
    if (baseFetchedPrice  == null || !form.currencyId) return;
    const sel = assets.find((a) => a.id === form.assetId);
    const baseCcy = props.currencies.find((c) => c.uuid === sel?.baseCurrencyId)?.currencyName;
    const tgtCcy = props.currencies.find((c) => c.uuid === form.currencyId)?.currencyName;
    const apply = (price: number) => {
      setForm((f) => ({ ...f, pricePerShare: String(parseFloat(price.toFixed(4))) }));
      setAutoFilled(true);
    };
    if (!baseCcy || !tgtCcy || baseCcy === tgtCcy) { apply(baseFetchedPrice ); return; }
    let cancelled = false;
    setPriceLoading(true);
    currencyService.convertPrice(baseCcy, tgtCcy, baseFetchedPrice )
      .then((v) => { if (!cancelled) apply(v); })
      .catch(() => { if (!cancelled) apply(baseFetchedPrice ); })
      .finally(() => { if (!cancelled) setPriceLoading(false); });
    return () => { cancelled = true; };
  }, [baseFetchedPrice, form.currencyId, form.assetId]);

  // Auto-compute capital gain
  useEffect(() => {
    if (avgBuyPrice == null) return;
    const shares = parseFloat(form.shares), price = parseFloat(form.pricePerShare);
    if (isNaN(shares) || isNaN(price) || shares <= 0 || price <= 0) return;
    setForm((f) => ({ ...f, capitalGain: String(parseFloat(((price - avgBuyPrice) * shares).toFixed(2))) }));
  }, [avgBuyPrice, form.shares, form.pricePerShare]);

  const handleSave = async () => {
    if (!form.date || !props.portfolioId || !form.currencyId || !form.shares || !form.pricePerShare) return;
    const shares = parseFloat(form.shares), price = parseFloat(form.pricePerShare);
    if (shares <= 0 || price <= 0) return;
    setSaving(true);
    try {
      let result: AssetSellResponse;
      if (isEditMode && props.editTransaction) {
        result = await portfolioService.updateAssetSell(props.portfolioId, props.editTransaction.id, {
          sellCurrencyId: form.currencyId,
          sellDate: form.date,
          assetSellShare: shares,
          assetSellPricePerShare: price,
        });
      } else {
        result = await portfolioService.addAssetSell({
          portfolioId: props.portfolioId,
          assetId: form.assetId || undefined,
          sellCurrencyId: form.currencyId,
          gainCurrencyId: form.currencyId,
          sellDate: form.date,
          assetSellAmount: parseFloat((shares * price).toFixed(2)),
          assetSellShare: shares,
          assetSellGain: form.capitalGain ? parseFloat(form.capitalGain) : undefined,
        });
      }
      props.onSuccess(result);
      props.onClose();
    } catch (err: unknown) {
      // Replace with your RN toast/snackbar solution
      if (err instanceof Error && err.message === "INSUFFICIENT_SHARES") {
        console.error("Not enough shares at this date.");
      } else {
        console.error(isEditMode ? "Failed to update sell." : "Failed to add sell.");
      }
      if (!isEditMode && form.assetId && form.date) {
        portfolioService.getAvailableShares(props.portfolioId, form.assetId, form.date)
          .then(setAvailableShares).catch(() => {});
      }
    } finally {
      setSaving(false);
    }
  };

  const ownedAssets = assets.filter((a) => {
    const name = a.officialName ?? a.tickerName ?? "";
    return name !== "" && props.ownedCompanies.includes(name);
  });

  const currencyName = props.currencies.find((c) => c.uuid === form.currencyId)?.currencyName ?? "";
  const enteredShares = parseFloat(form.shares) || 0;
  const effectiveAvailable = isEditMode && availableShares !== null
    ? availableShares + (props.editTransaction?.assetSellShare ?? 0)
    : availableShares;
  const sharesExceeded = effectiveAvailable !== null && enteredShares > 0 && enteredShares > effectiveAvailable;
  const hasNoShares = effectiveAvailable !== null && effectiveAvailable === 0;
  const computedTotal: number | null = (() => {
    const s = parseFloat(form.shares), p = parseFloat(form.pricePerShare);
    return s > 0 && p > 0 ? parseFloat((s * p).toFixed(2)) : null;
  })();
  const isDisabled = saving || !form.date || !form.assetId || !form.currencyId
    || !form.shares || !form.pricePerShare || hasNoShares || sharesExceeded;

  return (
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
          <ScrollView showsVerticalScrollIndicator={false} bounces={false}>

            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <View style={styles.iconWrapper}>
                  <Ionicons name="trending-down-outline" size={20} color="#e11d48" />
                </View>
                <Text style={styles.title}>{isEditMode ? "Edit sell" : "New sell"}</Text>
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
                  <Text style={styles.proNote}>Free plan: dates limited to the last 12 months.</Text>
                )}
              </View>

              {/* Asset */}
              {!isEditMode ? (
                <View>
                  <Text style={styles.label}>Asset</Text>
                  <AssetSearchSelect
                    assets={ownedAssets}
                    value={form.assetId}
                    onChange={(assetId) => setForm((f) => ({ ...f, assetId }))}
                  />
                  {form.assetId && form.date && (
                    <View style={styles.sharesAvailableRow}>
                      {availableSharesLoading ? (
                        <View style={styles.loadingRow}>
                          <ActivityIndicator size="small" color="#9ca3af" />
                          <Text style={styles.loadingText}>Computing…</Text>
                        </View>
                      ) : availableShares !== null ? (
                        <Text style={availableShares === 0 ? styles.sharesNone : styles.sharesOk}>
                          {availableShares} shares available
                        </Text>
                      ) : null}
                    </View>
                  )}
                </View>
              ) : (
                <View>
                  {props.editTransaction?.companyName && (
                    <View style={styles.companyBadge}>
                      <Text style={styles.companyBadgeText}>{props.editTransaction.companyName}</Text>
                    </View>
                  )}
                  {form.date && (
                    <View style={styles.sharesAvailableRow}>
                      {availableSharesLoading ? (
                        <View style={styles.loadingRow}>
                          <ActivityIndicator size="small" color="#9ca3af" />
                          <Text style={styles.loadingText}>Computing…</Text>
                        </View>
                      ) : effectiveAvailable !== null ? (
                        <Text style={effectiveAvailable === 0 ? styles.sharesNone : styles.sharesOk}>
                          {effectiveAvailable} shares available
                        </Text>
                      ) : null}
                    </View>
                  )}
                </View>
              )}

              {/* Shares */}
              <View>
                <View style={styles.rowBetween}>
                  <Text style={styles.label}>Number of shares</Text>
                  {effectiveAvailable !== null && (
                    <Text style={styles.maxLabel}>max {effectiveAvailable}</Text>
                  )}
                </View>
                <TextInput
                  style={[styles.input, sharesExceeded && styles.inputError]}
                  keyboardType="decimal-pad"
                  value={form.shares}
                  onChangeText={(v) => setForm((f) => ({ ...f, shares: v }))}
                  placeholder="0"
                  placeholderTextColor="#9ca3af"
                />
                {sharesExceeded && (
                  <Text style={styles.errorText}>Only {effectiveAvailable} shares available at this date</Text>
                )}
              </View>

              {/* Price per share + Currency */}
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowBetween}>
                    <Text style={styles.label}>Price per share</Text>
                    {priceLoading && (
                      <View style={styles.loadingRow}>
                        <ActivityIndicator size="small" color="#9ca3af" />
                        <Text style={styles.loadingText}>Fetching…</Text>
                      </View>
                    )}
                    {!priceLoading && autoFilled && (
                      <Text style={styles.autoFilledText}>Auto-filled</Text>
                    )}
                  </View>
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

              {/* Computed total */}
              {computedTotal != null && (
                <View style={styles.computedRow}>
                  <Text style={styles.computedLabel}>Total</Text>
                  <Text style={styles.computedValue}>{computedTotal} {currencyName}</Text>
                </View>
              )}

              {/* Capital gain */}
              <View>
                <View style={styles.rowBetween}>
                  <View style={styles.loadingRow}>
                    <Text style={styles.label}>Capital gain</Text>
                    <Ionicons name="lock-closed-outline" size={11} color="#d1d5db" style={{ marginLeft: 4 }} />
                  </View>
                  {avgBuyPrice != null
                    ? <Text style={styles.autoFilledText}>avg cost {parseFloat(avgBuyPrice.toFixed(4))} {currencyName}</Text>
                    : <Text style={styles.mutedNote}>auto-calculated</Text>
                  }
                </View>
                <View style={[
                  styles.gainDisplay,
                  avgBuyPrice != null ? styles.gainDisplayActive : styles.gainDisplayMuted,
                ]}>
                  <Text style={avgBuyPrice != null ? styles.gainTextActive : styles.gainTextMuted}>
                    {form.capitalGain !== "" ? `${form.capitalGain} ${currencyName}` : "Will be computed automatically"}
                  </Text>
                </View>
              </View>

              {hasNoShares && (
                <Text style={styles.errorText}>You don't own any shares of this asset on this date.</Text>
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
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
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
    backgroundColor: "#fff1f2",
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
  inputError: {
    borderColor: "#f87171",
  },
  row: {
    flexDirection: "row",
    gap: 8,
  },
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  loadingText: {
    fontSize: 11,
    color: "#9ca3af",
  },
  sharesAvailableRow: {
    marginTop: 6,
  },
  sharesOk: {
    fontSize: 11,
    fontWeight: "500",
    color: "#059669",
  },
  sharesNone: {
    fontSize: 11,
    fontWeight: "500",
    color: "#ef4444",
  },
  maxLabel: {
    fontSize: 11,
    color: "#9ca3af",
  },
  autoFilledText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#7c3aed",
  },
  mutedNote: {
    fontSize: 11,
    color: "#d1d5db",
  },
  errorText: {
    fontSize: 11,
    color: "#ef4444",
    marginTop: 4,
  },
  proNote: {
    fontSize: 11,
    color: "#d97706",
    marginTop: 4,
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
  gainDisplay: {
    height: 40,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    justifyContent: "center",
  },
  gainDisplayActive: {
    backgroundColor: "#f5f3ff",
    borderColor: "#ede9fe",
  },
  gainDisplayMuted: {
    backgroundColor: "#f9fafb",
    borderColor: "#f3f4f6",
  },
  gainTextActive: {
    fontSize: 13,
    fontWeight: "500",
    color: "#6d28d9",
  },
  gainTextMuted: {
    fontSize: 13,
    color: "#d1d5db",
    fontStyle: "italic",
  },
  companyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    marginBottom: 8,
  },
  companyBadgeText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#374151",
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
    backgroundColor: "#e11d48",
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
});

export default AddNewSellModal;