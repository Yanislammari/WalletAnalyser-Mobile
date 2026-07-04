import { useState } from "react";
import { TouchableOpacity, Text, Modal, View, FlatList, StyleSheet } from "react-native";
import { C } from "../../utils/color";
import { PeriodPreset, PRESET_LABELS } from "./helper";

export const PeriodDropdown: React.FC<{
  value: PeriodPreset;
  options: PeriodPreset[];
  onChange: (p: PeriodPreset) => void;
}> = ({ value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setOpen(true)}>
        <Text style={styles.dropdownButtonText}>{PRESET_LABELS[value]}</Text>
      </TouchableOpacity>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.modalSheet}>
            <FlatList
              data={options}
              keyExtractor={(p) => p}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    onChange(item);
                    setOpen(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      item === value && { color: C.purple600, fontWeight: "700" },
                    ]}
                  >
                    {PRESET_LABELS[item]}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    marginTop: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dropdownButtonText: { color: C.purple100, fontSize: 11 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: C.white, borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: 320, paddingVertical: 8 },
  modalOption: { paddingHorizontal: 20, paddingVertical: 14 },
  modalOptionText: { color: C.gray800, fontSize: 15 },
})
