import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

interface DeleteTransactionModalProps {
  visible: boolean;
  deleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const DeleteTransactionModal: React.FC<DeleteTransactionModalProps> = (props) => {
  return (
    <Modal
      visible={props.visible}
      transparent
      animationType="fade"
      onRequestClose={props.onClose}
    >
      <Pressable style={styles.backdrop} onPress={props.onClose}>
        <Pressable style={styles.box} onPress={() => {}}>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrapper}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </View>
              <Text style={styles.title}>Delete transaction</Text>
            </View>
            <TouchableOpacity
              onPress={props.onClose}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Ionicons name="close-outline" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Body */}
          <Text style={styles.body}>
            Are you sure you want to delete this transaction? This action is permanent and cannot be undone.
          </Text>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={props.onClose}
              disabled={props.deleting}
              style={[styles.btn, styles.btnCancel, props.deleting && styles.btnDisabled]}
              activeOpacity={0.7}
            >
              <Text style={styles.btnCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={props.onConfirm}
              disabled={props.deleting}
              style={[styles.btn, styles.btnDelete, props.deleting && styles.btnDisabled]}
              activeOpacity={0.7}
            >
              {props.deleting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.btnDeleteText}>Delete</Text>
              )}
            </TouchableOpacity>
          </View>

        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  box: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 384,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: "#f3f4f6",
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
    backgroundColor: "#fee2e2",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
  body: {
    fontSize: 13,
    color: "#4b5563",
    lineHeight: 20,
    marginBottom: 20,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
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
  btnDelete: {
    backgroundColor: "#ef4444",
  },
  btnDisabled: {
    opacity: 0.5,
  },
  btnCancelText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
  },
  btnDeleteText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#fff",
  },
});

export default DeleteTransactionModal;