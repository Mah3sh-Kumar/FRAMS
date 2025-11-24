import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { colors } from '../lib/theme';

interface ToastContextType {
    showSuccess: (message: string) => void;
    showError: (message: string) => void;
    showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [visible, setVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [type, setType] = useState<'success' | 'error' | 'info'>('info');

    const showToast = useCallback((msg: string, toastType: 'success' | 'error' | 'info') => {
        setMessage(msg);
        setType(toastType);
        setVisible(true);
    }, []);

    const showSuccess = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
    const showError = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
    const showInfo = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);

    const getBackgroundColor = () => {
        switch (type) {
            case 'success':
                return colors.success.main;
            case 'error':
                return colors.error.main;
            case 'info':
            default:
                return colors.info.main;
        }
    };

    return (
        <ToastContext.Provider value={{ showSuccess, showError, showInfo }}>
            {children}
            <Snackbar
                visible={visible}
                onDismiss={() => setVisible(false)}
                duration={3000}
                style={[styles.snackbar, { backgroundColor: getBackgroundColor() }]}
                action={{
                    label: 'Close',
                    onPress: () => setVisible(false),
                    textColor: '#ffffff',
                }}
            >
                {message}
            </Snackbar>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
}

const styles = StyleSheet.create({
    snackbar: {
        marginBottom: 20,
    },
});
