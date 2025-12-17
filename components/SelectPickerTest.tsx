import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import SelectPicker from './design-system/primitives/SelectPicker';

export default function SelectPickerTest() {
  const [selectedValue, setSelectedValue] = useState('');

  const testItems = [
    { label: 'Test Item 1', value: 'test1', description: 'First test item' },
    { label: 'Test Item 2', value: 'test2', description: 'Second test item' },
    { label: 'Graduation Year 1', value: 'grad1', description: 'First year' },
    { label: 'Graduation Year 2', value: 'grad2', description: 'Second year' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SelectPicker Test</Text>
      <SelectPicker
        label="Test Picker"
        value={selectedValue}
        items={testItems}
        onValueChange={setSelectedValue}
        placeholder="Select a test item"
        variant="academic"
        searchable={true}
      />
      <Text style={styles.selected}>Selected: {selectedValue}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  selected: {
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
});