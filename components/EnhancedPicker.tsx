/**
 * EnhancedPicker Component
 * 
 * An improved picker component with proper state management, visual feedback,
 * search functionality, and accessibility features. Fixes the value display
 * issues present in the standard React Native Picker.
 * 
 * Features:
 * - Controlled component with proper value display
 * - Automatic search for lists with >10 items
 * - Visual feedback on selection
 * - Error state support
 * - Full accessibility support (screen readers, keyboard navigation)
 * - Modal-based selection for better UX
 * 
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.3, 4.4, 4.6
 * 
 * @example
 * ```tsx
 * <EnhancedPicker
 *   label="Class"
 *   value={selectedClass}
 *   items={[
 *     { label: 'Grade 1', value: 'grade_1' },
 *     { label: 'Grade 2', value: 'grade_2' },
 *   ]}
 *   onValueChange={setSelectedClass}
 *   error={errors.class}
 *   searchable
 * />
 * ```
 */

import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/design-system/ThemeContext';

/**
 * Represents a single item in the picker dropdown
 * @template T - Type of the value (defaults to string)
 */
export interface PickerItem<T = string> {
  /** Display text shown to the user */
  label: string;
  /** Internal value used for selection */
  value: T;
  /** Whether this item can be selected */
  disabled?: boolean;
}

/**
 * Props for the EnhancedPicker component
 * @template T - Type of the value (defaults to string)
 */
export interface EnhancedPickerProps<T = string> {
  /** Label displayed above the picker */
  label: string;
  /** Currently selected value */
  value: T;
  /** Array of items to display in the picker */
  items: PickerItem<T>[];
  /** Callback fired when selection changes */
  onValueChange: (value: T) => void;
  /** Error message to display below the picker */
  error?: string;
  /** Whether the picker is disabled */
  disabled?: boolean;
  /** Placeholder text when no value is selected */
  placeholder?: string;
  /** Enable search functionality (auto-enabled for >10 items) */
  searchable?: boolean;
  /** Test ID for automated testing */
  testID?: string;
}

function EnhancedPicker<T = string>({
  label,
  value,
  items,
  onValueChange,
  error,
  disabled = false,
  placeholder = 'Select an option',
  searchable = false,
  testID,
}: EnhancedPickerProps<T>) {
  const { tokens, getTextColor, getTextSecondaryColor, getSurfaceColor } = useTheme();
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Find the selected item to display its label
  const selectedItem = useMemo(() => {
    return items.find(item => item.value === value);
  }, [items, value]);

  // Filter items based on search query
  const filteredItems = useMemo(() => {
    const trimmedQuery = searchQuery.trim();
    if (!searchable || !trimmedQuery) {
      return items;
    }
    const query = trimmedQuery.toLowerCase();
    return items.filter(item => 
      item.label.toLowerCase().includes(query)
    );
  }, [items, searchQuery, searchable]);

  // Determine if search should be shown (more than 10 items)
  const shouldShowSearch = searchable || items.length > 10;

  const handleSelect = (itemValue: T) => {
    onValueChange(itemValue);
    setModalVisible(false);
    setSearchQuery('');
  };

  const handleOpen = () => {
    if (!disabled) {
      setModalVisible(true);
    }
  };

  const handleClose = () => {
    setModalVisible(false);
    setSearchQuery('');
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: tokens.spacing.md,
    },
    label: {
      fontSize: tokens.typography.body.fontSize,
      fontWeight: '600',
      marginBottom: tokens.spacing.sm,
      color: getTextColor(),
    },
    pickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: getSurfaceColor(),
      borderRadius: tokens.borders.radius.medium,
      borderWidth: 1,
      borderColor: error ? tokens.colors.error.main : tokens.colors.neutral.gray300,
      padding: tokens.spacing.md,
      minHeight: 48,
    },
    pickerButtonDisabled: {
      opacity: 0.5,
    },
    pickerText: {
      fontSize: tokens.typography.body.fontSize,
      color: getTextColor(),
      flex: 1,
    },
    placeholderText: {
      color: getTextSecondaryColor(),
    },
    errorText: {
      fontSize: tokens.typography.caption.fontSize,
      color: tokens.colors.error.main,
      marginTop: tokens.spacing.xs,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '90%',
      maxHeight: '80%',
      backgroundColor: getSurfaceColor(),
      borderRadius: tokens.borders.radius.large,
      padding: tokens.spacing.lg,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: tokens.spacing.md,
    },
    modalTitle: {
      fontSize: tokens.typography.h3.fontSize,
      fontWeight: tokens.typography.h3.fontWeight,
      color: getTextColor(),
    },
    searchInput: {
      backgroundColor: tokens.colors.neutral.gray100,
      borderRadius: tokens.borders.radius.medium,
      padding: tokens.spacing.md,
      marginBottom: tokens.spacing.md,
      fontSize: tokens.typography.body.fontSize,
      color: getTextColor(),
    },
    listItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: tokens.spacing.md,
      borderRadius: tokens.borders.radius.medium,
      marginBottom: tokens.spacing.xs,
    },
    listItemSelected: {
      backgroundColor: tokens.colors.primary.light,
    },
    listItemDisabled: {
      opacity: 0.5,
    },
    listItemText: {
      fontSize: tokens.typography.body.fontSize,
      color: getTextColor(),
      flex: 1,
    },
    listItemTextSelected: {
      fontWeight: '600',
      color: tokens.colors.primary.main,
    },
    emptyState: {
      padding: tokens.spacing.xl,
      alignItems: 'center',
    },
    emptyStateText: {
      fontSize: tokens.typography.body.fontSize,
      color: getTextSecondaryColor(),
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.pickerButton, disabled && styles.pickerButtonDisabled]}
        onPress={handleOpen}
        disabled={disabled}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`${label} picker`}
        accessibilityHint={`Opens ${label} selection menu`}
        accessibilityState={{ disabled }}
        testID={testID ? `${testID}-button` : undefined}
      >
        <Text
          style={[
            styles.pickerText,
            !selectedItem && styles.placeholderText,
          ]}
          testID={testID ? `${testID}-value` : undefined}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color={getTextSecondaryColor()}
        />
      </TouchableOpacity>
      {error && (
        <Text style={styles.errorText} testID={testID ? `${testID}-error` : undefined}>
          {error}
        </Text>
      )}

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={handleClose}
        testID={testID ? `${testID}-modal` : undefined}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={handleClose}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e?.stopPropagation?.()}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{label}</Text>
                <TouchableOpacity
                  onPress={handleClose}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="Close picker"
                >
                  <Ionicons name="close" size={24} color={getTextColor()} />
                </TouchableOpacity>
              </View>

              {shouldShowSearch && (
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search..."
                  placeholderTextColor={getTextSecondaryColor()}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                  autoCorrect={false}
                  testID={testID ? `${testID}-search` : undefined}
                />
              )}

              <FlatList
                data={filteredItems}
                keyExtractor={(item, index) => `${item.value}-${index}`}
                renderItem={({ item }) => {
                  const isSelected = item.value === value;
                  return (
                    <TouchableOpacity
                      style={[
                        styles.listItem,
                        isSelected && styles.listItemSelected,
                        item.disabled && styles.listItemDisabled,
                      ]}
                      onPress={() => handleSelect(item.value)}
                      disabled={item.disabled}
                      accessible
                      accessibilityRole="button"
                      accessibilityLabel={item.label}
                      accessibilityState={{ selected: isSelected, disabled: item.disabled }}
                      testID={testID ? `${testID}-item-${item.value}` : undefined}
                    >
                      <Text
                        style={[
                          styles.listItemText,
                          isSelected && styles.listItemTextSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {isSelected && (
                        <Ionicons
                          name="checkmark"
                          size={20}
                          color={tokens.colors.primary.main}
                        />
                      )}
                    </TouchableOpacity>
                  );
                }}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>
                      No options found
                    </Text>
                  </View>
                }
                testID={testID ? `${testID}-list` : undefined}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

export default EnhancedPicker;
