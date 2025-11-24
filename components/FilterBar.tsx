import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Searchbar, Menu, Button } from 'react-native-paper';
import { colors, spacing } from '../lib/theme';

interface FilterBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchPlaceholder?: string;
    sortOptions?: { label: string; value: string }[];
    selectedSort?: string;
    onSortChange?: (value: string) => void;
}

export default function FilterBar({
    searchQuery,
    onSearchChange,
    searchPlaceholder = 'Search...',
    sortOptions,
    selectedSort,
    onSortChange,
}: FilterBarProps) {
    const [menuVisible, setMenuVisible] = React.useState(false);

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder={searchPlaceholder}
                onChangeText={onSearchChange}
                value={searchQuery}
                style={styles.searchbar}
            />

            {sortOptions && onSortChange && (
                <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                        <Button
                            mode="outlined"
                            onPress={() => setMenuVisible(true)}
                            icon="sort"
                            style={styles.sortButton}
                        >
                            Sort
                        </Button>
                    }
                >
                    {sortOptions.map((option) => (
                        <Menu.Item
                            key={option.value}
                            onPress={() => {
                                onSortChange(option.value);
                                setMenuVisible(false);
                            }}
                            title={option.label}
                            leadingIcon={selectedSort === option.value ? 'check' : undefined}
                        />
                    ))}
                </Menu>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.md,
    },
    searchbar: {
        flex: 1,
        backgroundColor: colors.background.paper,
    },
    sortButton: {
        minWidth: 100,
    },
});
