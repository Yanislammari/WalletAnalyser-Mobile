import { View, TextInput, StyleSheet } from "react-native"
import Icon from "react-native-vector-icons/Ionicons";

interface SearchBarProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = (props : SearchBarProps) => {
  return (
    <View style={styles.searchRow}>
      <Icon name="search-outline" size={16} color="#9ca3af" style={styles.searchIcon} />
      <TextInput
        style={styles.searchInput}
        placeholder={props.placeholder}
        placeholderTextColor="#9ca3af"
        value={props.value ?? ""}
        onChangeText={(e) => props.onChange(e)}
      />
    </View>
  )
}

export default SearchBar;

const styles = StyleSheet.create({
  searchRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, marginBottom: 16, borderWidth: 1, borderColor: "#e5e7eb" },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, height: 42, color: "#111827", fontSize: 14 },
});