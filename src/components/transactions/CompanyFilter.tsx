import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from 'react-native';
import Ionicons from "react-native-vector-icons/Ionicons"
import CompanyLogo from './CompanyLogo';

interface CompanyFilterProps {
  companies: string[];
  selected: string | null;
  onChange: (company: string | null) => void;
}

const CompanyFilter: React.FC<CompanyFilterProps> = (props) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (company: string | null) => {
    props.onChange(company);
    setOpen(false);
  };

  if (props.companies.length === 0) return null;

  const isSelected = props.selected !== null;

  return (
    <>
      <TouchableOpacity
        onPress={() => setOpen(true)}
        style={[styles.trigger, isSelected && styles.triggerActive]}
      >
        {isSelected
          ? <CompanyLogo name={props.selected!} size={20} />
          : <Ionicons name="business-outline" size={14} color="#4B5563" />
        }
        <Text style={[styles.triggerText, isSelected && styles.triggerTextActive]}>
          {props.selected ?? 'All companies'}
        </Text>
        {isSelected ? (
          <TouchableOpacity
            onPress={() => handleSelect(null)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="close" size={14} color="#A78BFA" />
          </TouchableOpacity>
        ) : (
          <Ionicons name="chevron-down" size={13} color="#6B7280" />
        )}
      </TouchableOpacity>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        {/* Backdrop */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        />

        {/* Dropdown */}
        <View style={styles.dropdown}>
          {/* All companies */}
          <TouchableOpacity
            onPress={() => handleSelect(null)}
            style={[styles.option, props.selected === null && styles.optionActive]}
          >
            <Text style={[styles.optionText, props.selected === null && styles.optionTextActive]}>
              All companies
            </Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {props.companies.map((company) => (
              <TouchableOpacity
                key={company}
                onPress={() => handleSelect(company)}
                style={[styles.option, props.selected === company && styles.optionActive]}
              >
                <CompanyLogo name={company} size={22} />
                <Text
                  style={[styles.optionText, props.selected === company && styles.optionTextActive]}
                  numberOfLines={1}
                >
                  {company}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  // Trigger button
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  triggerActive: {
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
  },
  triggerText: {
    fontSize: 13,
    color: '#4B5563',
  },
  triggerTextActive: {
    color: '#7C3AED',
    fontWeight: '600',
  },

  // Modal backdrop
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },

  // Dropdown panel — centered bottom sheet style
  dropdown: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 8,
  },

  list: { maxHeight: 300 },

  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 4,
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  optionActive: { backgroundColor: '#F5F3FF' },
  optionText: { fontSize: 14, color: '#374151', flex: 1 },
  optionTextActive: { color: '#7C3AED', fontWeight: '600' },
});

export default CompanyFilter;
