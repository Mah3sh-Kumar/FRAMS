/**
 * PickerDemo Component
 * 
 * A demo component to showcase the improved SelectPicker UI
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../lib/design-system/ThemeContext';
import SelectPicker from './design-system/primitives/SelectPicker';
import { CLASS_LEVELS, DEPARTMENTS } from '../lib/constants';

export default function PickerDemo() {
  const { tokens, getTextColor, getSurfaceColor } = useTheme();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: getSurfaceColor(),
      padding: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: getTextColor(),
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: tokens.colors.neutral.gray600,
      marginBottom: 32,
      textAlign: 'center',
    },
    improvements: {
      backgroundColor: tokens.colors.primary.light,
      padding: 16,
      borderRadius: 12,
      marginBottom: 24,
    },
    improvementText: {
      fontSize: 14,
      color: tokens.colors.primary.main,
      fontWeight: '600',
      textAlign: 'center',
    },
    section: {
      marginBottom: 32,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: getTextColor(),
      marginBottom: 16,
    },
    description: {
      fontSize: 14,
      color: tokens.colors.neutral.gray600,
      marginBottom: 16,
      lineHeight: 20,
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Enhanced Picker UI</Text>
      <Text style={styles.subtitle}>Improved dropdowns for class levels and departments</Text>
      
      <View style={styles.improvements}>
        <Text style={styles.improvementText}>
          ✓ Container boundaries fixed ✓ Single-line text display ✓ Proper content containment
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Student Class Level Selection</Text>
        <Text style={styles.description}>
          Enhanced with icons, descriptions, and improved visual hierarchy for better user experience.
        </Text>
        <SelectPicker
          label="Class Level"
          value={selectedClass}
          items={[
            { label: 'Class 9', value: 'class_9', description: 'Secondary school - Grade 9', icon: 'library-outline' },
            { label: 'Class 10', value: 'class_10', description: 'Secondary school - Grade 10', icon: 'library-outline' },
            { label: 'Graduation Year 1', value: 'grad_year_1', description: 'First year undergraduate', icon: 'medal-outline' },
            { label: 'Graduation Year 2', value: 'grad_year_2', description: 'Second year undergraduate', icon: 'medal-outline' },
          ]}
          onValueChange={setSelectedClass}
          variant="academic"
          searchable={true}
          placeholder="Choose your class level"
          testID="demo-class-picker"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Teacher Department Selection</Text>
        <Text style={styles.description}>
          Organized with relevant icons and descriptions to help teachers quickly find their department.
        </Text>
        <SelectPicker
          label="Department"
          value={selectedDepartment}
          items={DEPARTMENTS.map(dept => ({
            label: dept.name,
            value: dept.name,
            description: dept.description,
            icon: dept.icon
          }))}
          onValueChange={setSelectedDepartment}
          variant="department"
          searchable={true}
          placeholder="Select your department"
          testID="demo-department-picker"
        />
      </View>
    </ScrollView>
  );
}