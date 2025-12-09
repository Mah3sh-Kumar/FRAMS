/**
 * OrganizationManager Screen
 * 
 * Admin interface for managing organizational data structures including
 * classes, branches, and departments. Provides full CRUD operations with
 * validation and dependency checking.
 * 
 * Features:
 * - Tabbed interface for classes, branches, and departments
 * - Create, edit, and delete operations with confirmation
 * - Branch-class association management
 * - Dependency checking before deletion
 * - Real-time data synchronization
 * - Error handling with user-friendly messages
 * 
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8, 5.9, 5.10
 * 
 * @example
 * ```tsx
 * // Navigate from admin dashboard
 * navigation.navigate('OrganizationManager');
 * 
 * // Or with initial tab
 * navigation.navigate('OrganizationManager', { initialTab: 'branches' });
 * ```
 */

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Modal, Alert, FlatList, StatusBar } from 'react-native';
import { SegmentedButtons } from 'react-native-paper';
import { useTheme } from '../../lib/design-system/ThemeContext';
import Button from '../../components/design-system/primitives/Button';
import Input from '../../components/design-system/primitives/Input';
import LoadingSpinner from '../../components/design-system/feedback/LoadingSpinner';
import ConfirmDialog from '../../components/ConfirmDialog';
import EmptyState from '../../components/EmptyState';
import KeyboardAwareScrollView from '../../components/KeyboardAwareScrollView';
import EnhancedPicker from '../../components/EnhancedPicker';
import { Ionicons } from '@expo/vector-icons';
import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  ClassItem,
  BranchItem,
  DepartmentItem,
} from '../../lib/organization';

type TabType = 'classes' | 'branches' | 'departments';

export default function OrganizationManager() {
  const { tokens, getTextColor, getTextSecondaryColor, getSurfaceColor } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>('classes');
  const [loading, setLoading] = useState(true);

  // Data states
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [branches, setBranches] = useState<BranchItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<ClassItem | BranchItem | DepartmentItem | null>(null);
  const [formName, setFormName] = useState('');
  const [formValue, setFormValue] = useState(''); // For classes only
  const [formClassId, setFormClassId] = useState<string>(''); // For branches only
  const [saving, setSaving] = useState(false);

  // Delete confirmation
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'classes') {
        const { data, error } = await getClasses(true);
        if (error) throw new Error(error);
        setClasses(data || []);
      } else if (activeTab === 'branches') {
        const { data, error } = await getBranches(undefined, true);
        if (error) throw new Error(error);
        setBranches(data || []);
        // Also fetch classes for the dropdown
        const classesResult = await getClasses(true);
        if (classesResult.data) setClasses(classesResult.data);
      } else {
        const { data, error } = await getDepartments(true);
        if (error) throw new Error(error);
        setDepartments(data || []);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingItem(null);
    setFormName('');
    setFormValue('');
    setFormClassId('');
    setModalVisible(true);
  };

  const openEditModal = (item: ClassItem | BranchItem | DepartmentItem) => {
    setEditingItem(item);
    setFormName(item.name);
    if ('value' in item) {
      setFormValue(item.value);
    }
    if ('class_id' in item) {
      setFormClassId(item.class_id || '');
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    if (activeTab === 'classes' && !formValue.trim()) {
      Alert.alert('Error', 'Value is required for classes');
      return;
    }

    setSaving(true);
    try {
      if (activeTab === 'classes') {
        if (editingItem) {
          const { error } = await updateClass(editingItem.id, { name: formName, value: formValue });
          if (error) throw new Error(error);
          Alert.alert('Success', 'Class updated successfully');
        } else {
          const { error } = await createClass(formName, formValue);
          if (error) throw new Error(error);
          Alert.alert('Success', 'Class created successfully');
        }
      } else if (activeTab === 'branches') {
        if (editingItem) {
          const { error } = await updateBranch(editingItem.id, { name: formName, class_id: formClassId || null });
          if (error) throw new Error(error);
          Alert.alert('Success', 'Branch updated successfully');
        } else {
          const { error } = await createBranch(formName, formClassId || null);
          if (error) throw new Error(error);
          Alert.alert('Success', 'Branch created successfully');
        }
      } else {
        if (editingItem) {
          const { error} = await updateDepartment(editingItem.id, { name: formName });
          if (error) throw new Error(error);
          Alert.alert('Success', 'Department updated successfully');
        } else {
          const { error } = await createDepartment(formName);
          if (error) throw new Error(error);
          Alert.alert('Success', 'Department created successfully');
        }
      }

      setModalVisible(false);
      fetchData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      let error: string | null = null;

      if (activeTab === 'classes') {
        const result = await deleteClass(itemToDelete.id, itemToDelete.value);
        error = result.error;
      } else if (activeTab === 'branches') {
        const result = await deleteBranch(itemToDelete.id, itemToDelete.name);
        error = result.error;
      } else {
        const result = await deleteDepartment(itemToDelete.id, itemToDelete.name);
        error = result.error;
      }

      if (error) throw new Error(error);

      Alert.alert('Success', `${activeTab.slice(0, -1)} deleted successfully`);
      setDeleteConfirmVisible(false);
      setItemToDelete(null);
      fetchData();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete');
    }
  };

  const confirmDelete = (item: any) => {
    setItemToDelete(item);
    setDeleteConfirmVisible(true);
  };

  const renderItem = ({ item }: { item: ClassItem | BranchItem | DepartmentItem }) => {
    const isClass = 'value' in item;
    const isBranch = 'class_id' in item;

    return (
      <View style={styles.card}>
        <View style={styles.cardContent}>
          <View style={styles.itemInfo}>
            <Text style={styles.itemName}>{item.name}</Text>
            {isClass && (
              <Text style={styles.itemDetail}>
                Value: {(item as ClassItem).value}
              </Text>
            )}
            {isBranch && (item as BranchItem).class_id && (
              <Text style={styles.itemDetail}>
                Class: {classes.find(c => c.id === (item as BranchItem).class_id)?.name || 'Unknown'}
              </Text>
            )}
            {isBranch && !(item as BranchItem).class_id && (
              <Text style={styles.itemDetail}>
                Available for all classes
              </Text>
            )}
            <View style={styles.badges}>
              {item.is_active ? (
                <View style={[styles.badge, { backgroundColor: tokens.colors.success.main }]}>
                  <Text style={styles.badgeText}>Active</Text>
                </View>
              ) : (
                <View style={[styles.badge, { backgroundColor: '#9CA3AF' }]}>
                  <Text style={styles.badgeText}>Inactive</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.actions}>
            <TouchableOpacity 
              onPress={() => openEditModal(item)} 
              style={styles.actionButton}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Edit ${item.name}`}
              accessibilityHint="Opens edit form"
            >
              <Ionicons name="pencil" size={20} color={tokens.colors.primary.main} />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => confirmDelete(item)} 
              style={styles.actionButton}
              accessible
              accessibilityRole="button"
              accessibilityLabel={`Delete ${item.name}`}
              accessibilityHint="Opens delete confirmation"
            >
              <Ionicons name="trash" size={20} color={tokens.colors.error.main} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const getCurrentData = () => {
    if (activeTab === 'classes') return classes;
    if (activeTab === 'branches') return branches;
    return departments;
  };

  const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
      paddingHorizontal: 24,
      paddingTop: 48,
      paddingBottom: 24,
      borderBottomLeftRadius: 24,
      borderBottomRightRadius: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 5,
    },
    headerContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '800',
      color: '#FFFFFF',
      marginBottom: 8,
      lineHeight: 34,
    },
    headerSubtitle: {
      fontSize: 16,
      color: '#FFFFFF',
      opacity: 0.95,
      lineHeight: 22,
    },
    createButton: {
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    tabContainer: {
      paddingHorizontal: 24,
      paddingTop: 24,
      marginBottom: 16,
    },
    list: {
      padding: 24,
      paddingBottom: 40,
    },
    card: { 
      marginBottom: 16,
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 3,
    },
    cardContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 20,
    },
    itemInfo: { flex: 1 },
    itemName: {
      fontSize: 18,
      fontWeight: '600',
      color: '#1F2937',
      marginBottom: 4,
    },
    itemDetail: {
      fontSize: 14,
      color: '#6B7280',
      marginBottom: 8,
    },
    badges: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
    },
    badge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    badgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    actions: {
      flexDirection: 'row',
      gap: 12,
    },
    actionButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 20,
      backgroundColor: '#F3F4F6',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modal: {
      width: '90%',
      maxHeight: '80%',
      padding: tokens.spacing.lg,
      borderRadius: tokens.borders.radius.large,
    },
    modalTitle: {
      fontSize: tokens.typography.h2.fontSize,
      fontWeight: tokens.typography.h2.fontWeight,
      marginBottom: tokens.spacing.md,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: tokens.spacing.md,
      gap: tokens.spacing.sm,
    },
  });

  return (
    <View style={[styles.container, { backgroundColor: '#F9FAFB' }]}>
      <StatusBar barStyle="light-content" backgroundColor={tokens.colors.roles.admin.main} />
      
      {/* Header Section */}
      <View style={[styles.header, { backgroundColor: tokens.colors.roles.admin.main }]}>
        <View style={styles.headerContent}>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Organization Manager</Text>
            <Text style={styles.headerSubtitle}>Manage classes, branches, and departments</Text>
          </View>
          <TouchableOpacity 
            onPress={openCreateModal} 
            style={styles.createButton}
            accessible
            accessibilityRole="button"
            accessibilityLabel={`Create new ${activeTab.slice(0, -1)}`}
            accessibilityHint={`Opens form to create a new ${activeTab.slice(0, -1)}`}
          >
            <Ionicons name="add" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.tabContainer}>
        <SegmentedButtons
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as TabType)}
          buttons={[
            { value: 'classes', label: 'Classes' },
            { value: 'branches', label: 'Branches' },
            { value: 'departments', label: 'Departments' },
          ]}
        />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <LoadingSpinner size="large" />
        </View>
      ) : (
        <FlatList
          data={getCurrentData()}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <EmptyState
              icon="folder-open"
              title={`No ${activeTab} found`}
              message={`Create your first ${activeTab.slice(0, -1)} to get started`}
            />
          }
        />
      )}

        {/* Create/Edit Modal */}
        <Modal visible={modalVisible} onRequestClose={() => setModalVisible(false)} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modal, { backgroundColor: getSurfaceColor() }]}>
              <KeyboardAwareScrollView contentContainerStyle={{ padding: tokens.spacing.md }} extraScrollHeight={30}>
                <Text style={[styles.modalTitle, { color: getTextColor() }]}>
                  {editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Create ${activeTab.slice(0, -1)}`}
                </Text>

                <Input label="Name *" value={formName} onChangeText={setFormName} />

                {activeTab === 'classes' && (
                  <Input
                    label="Value *"
                    value={formValue}
                    onChangeText={setFormValue}
                    placeholder="e.g., grad_year_1"
                    autoCapitalize="none"
                  />
                )}

                {activeTab === 'branches' && (
                  <EnhancedPicker
                    label="Class (Optional)"
                    value={formClassId}
                    items={[
                      { label: 'Available for all classes', value: '' },
                      ...classes.map((c) => ({ label: c.name, value: c.id })),
                    ]}
                    onValueChange={setFormClassId}
                    testID="branch-class-picker"
                  />
                )}

                <View style={styles.modalActions}>
                  <Button variant="secondary" onPress={() => setModalVisible(false)} style={{ marginRight: tokens.spacing.sm }}>
                    Cancel
                  </Button>
                  <Button variant="primary" onPress={handleSave} loading={saving}>
                    {editingItem ? 'Update' : 'Create'}
                  </Button>
                </View>
              </KeyboardAwareScrollView>
            </View>
          </View>
        </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        visible={deleteConfirmVisible}
        title={`Delete ${activeTab.slice(0, -1)}`}
        message={`Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmVisible(false)}
        destructive
      />
    </View>
  );
}
