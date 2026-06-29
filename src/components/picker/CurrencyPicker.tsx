import { useState } from "react";
import { TouchableOpacity, Text, Modal, Pressable, ScrollView, StyleSheet } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Currency } from "../../models/Currency";

const CurrencyPicker: React.FC<{
  currencies: Currency[];
  value: string;
  onChange: (v: string) => void;
}> = ({ currencies, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = currencies.find((c) => c.uuid === value);
  return (
    <>
      <TouchableOpacity
        style={[styles.input, { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
      >
        <Text style={{ fontSize: 13, color: selected ? "#111827" : "#9ca3af" }}>
          {selected?.currencyName ?? "Currency"}
        </Text>
        <Ionicons name="chevron-down-outline" size={13} color="#9ca3af" />
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable style={[styles.box, { maxHeight: 320 }]} onPress={() => {}}>
            <ScrollView>
              {currencies.map((c) => (
                <TouchableOpacity
                  key={c.uuid}
                  onPress={() => { onChange(c.uuid); setOpen(false); }}
                  style={styles.pickerOption}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pickerOptionText, c.uuid === value && styles.pickerOptionActive]}>
                    {c.currencyName}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
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
  pickerOption: {
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pickerOptionText: {
    fontSize: 14,
    color: "#374151",
  },
  pickerOptionActive: {
    color: "#7c3aed",
    fontWeight: "600",
  },
});

export default CurrencyPicker