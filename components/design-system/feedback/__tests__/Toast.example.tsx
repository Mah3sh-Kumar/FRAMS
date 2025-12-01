/**
 * Toast Component Example
 * 
 * Demonstrates usage of the Toast component with different variants
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import Toast from '../Toast';
import Button from '../../primitives/Button';
import { ThemeProvider } from '../../../../lib/design-system/ThemeContext';

/**
 * Toast Example Component
 * 
 * Shows how to use the Toast component with different type variants
 */
export default function ToastExample() {
  const [successVisible, setSuccessVisible] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const [warningVisible, setWarningVisible] = useState(false);
  const [infoVisible, setInfoVisible] = useState(false);

  return (
    <ThemeProvider>
      <View style={styles.container}>
        <View style={styles.buttonContainer}>
          <Button
            variant="primary"
            onPress={() => setSuccessVisible(true)}
            style={styles.button}
          >
            Show Success Toast
          </Button>

          <Button
            variant="danger"
            onPress={() => setErrorVisible(true)}
            style={styles.button}
          >
            Show Error Toast
          </Button>

          <Button
            variant="secondary"
            onPress={() => setWarningVisible(true)}
            style={styles.button}
          >
            Show Warning Toast
          </Button>

          <Button
            variant="ghost"
            onPress={() => setInfoVisible(true)}
            style={styles.button}
          >
            Show Info Toast
          </Button>
        </View>

        {successVisible && (
          <Toast
            type="success"
            message="Operation completed successfully!"
            onDismiss={() => setSuccessVisible(false)}
          />
        )}

        {errorVisible && (
          <Toast
            type="error"
            message="An error occurred. Please try again."
            onDismiss={() => setErrorVisible(false)}
          />
        )}

        {warningVisible && (
          <Toast
            type="warning"
            message="Warning: This action cannot be undone."
            onDismiss={() => setWarningVisible(false)}
          />
        )}

        {infoVisible && (
          <Toast
            type="info"
            message="Did you know? You can customize the duration."
            duration={5000}
            onDismiss={() => setInfoVisible(false)}
          />
        )}
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  buttonContainer: {
    gap: 16,
  },
  button: {
    marginBottom: 16,
  },
});
