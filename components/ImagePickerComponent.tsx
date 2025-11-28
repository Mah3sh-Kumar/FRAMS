import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert, Platform } from 'react-native';
import { Button, ActivityIndicator, IconButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing } from '../lib/theme';

interface ImagePickerComponentProps {
    currentImageUrl?: string;
    onImageSelected: (uri: string) => void;
    onImageUploaded?: (url: string) => void;
    size?: number;
}

export default function ImagePickerComponent({
    currentImageUrl,
    onImageSelected,
    onImageUploaded,
    size = 120,
}: ImagePickerComponentProps) {
    const [uploading, setUploading] = useState(false);
    const [imageUri, setImageUri] = useState<string | undefined>(currentImageUrl);

    const requestPermissions = async () => {
        if (Platform.OS !== 'web') {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to upload images.');
                return false;
            }

            const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
            if (cameraStatus.status !== 'granted') {
                Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
                return false;
            }
        }
        return true;
    };

    const pickImage = async () => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        Alert.alert(
            'Select Image',
            'Choose an option',
            [
                {
                    text: 'Camera',
                    onPress: takePhoto,
                },
                {
                    text: 'Gallery',
                    onPress: selectFromGallery,
                },
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
            ]
        );
    };

    const takePhoto = async () => {
        try {
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const uri = result.assets[0].uri;
                setImageUri(uri);
                onImageSelected(uri);
            }
        } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Error', 'Failed to take photo');
        }
    };

    const selectFromGallery = async () => {
        try {
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const uri = result.assets[0].uri;
                setImageUri(uri);
                onImageSelected(uri);
            }
        } catch (error) {
            console.error('Error selecting image:', error);
            Alert.alert('Error', 'Failed to select image');
        }
    };

    return (
        <View style={styles.container}>
            <View style={[styles.imageContainer, { width: size, height: size }]}>
                {imageUri ? (
                    <Image
                        source={{ uri: imageUri }}
                        style={[styles.image, { width: size, height: size }]}
                    />
                ) : (
                    <View style={[styles.placeholder, { width: size, height: size }]}>
                        <IconButton
                            icon="account"
                            size={size * 0.5}
                            iconColor={colors.text.secondary}
                        />
                    </View>
                )}

                {uploading && (
                    <View style={styles.uploadingOverlay}>
                        <ActivityIndicator size="large" color={colors.primary.main} />
                    </View>
                )}

                <IconButton
                    icon="camera"
                    mode="contained"
                    iconColor="white"
                    containerColor={colors.primary.main}
                    size={24}
                    style={styles.cameraButton}
                    onPress={pickImage}
                    disabled={uploading}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginVertical: spacing.md,
    },
    imageContainer: {
        position: 'relative',
        borderRadius: 1000,
        overflow: 'hidden',
    },
    image: {
        borderRadius: 1000,
    },
    placeholder: {
        backgroundColor: colors.background.paper,
        borderRadius: 1000,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.divider,
    },
    uploadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 1000,
    },
    cameraButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        margin: 0,
    },
});
