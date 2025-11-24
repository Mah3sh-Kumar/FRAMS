import React from 'react';
import { StyleSheet } from 'react-native';
import { Portal, Dialog, Button, Text, Paragraph } from 'react-native-paper';
import { colors } from '../lib/theme';

interface ConfirmDialogProps {
    visible: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    destructive?: boolean;
}

export default function ConfirmDialog({
    visible,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    destructive = false,
}: ConfirmDialogProps) {
    return (
        <Portal>
            <Dialog visible={visible} onDismiss={onCancel}>
                <Dialog.Title>{title}</Dialog.Title>
                <Dialog.Content>
                    <Paragraph>{message}</Paragraph>
                </Dialog.Content>
                <Dialog.Actions>
                    <Button onPress={onCancel}>{cancelText}</Button>
                    <Button
                        onPress={onConfirm}
                        textColor={destructive ? colors.error.main : colors.primary.main}
                    >
                        {confirmText}
                    </Button>
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
}
