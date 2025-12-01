/**
 * Input Component Usage Example
 * 
 * This file demonstrates how to use the Input component in various scenarios.
 * Not a test file - just for documentation purposes.
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import Input from '../Input';
import { ThemeProvider } from '../../../../lib/design-system/ThemeContext';

export function InputExamples() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [emailError, setEmailError] = useState('');

  return (
    <ThemeProvider>
      <View style={{ padding: 20 }}>
        {/* Basic Input */}
        <Input
          label="Username"
          value={username}
          onChangeText={setUsername}
          placeholder="Enter your username"
        />

        {/* Input with Error */}
        <Input
          label="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (!text.includes('@')) {
              setEmailError('Please enter a valid email');
            } else {
              setEmailError('');
            }
          }}
          error={emailError}
          placeholder="email@example.com"
        />

        {/* Secure Text Entry (Password) */}
        <Input
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={true}
          placeholder="Enter your password"
        />

        {/* Disabled Input */}
        <Input
          label="Disabled Field"
          value="Cannot edit this"
          onChangeText={() => {}}
          disabled={true}
        />

        {/* Input with Icon */}
        <Input
          label="Search"
          value=""
          onChangeText={() => {}}
          icon={<View style={{ width: 20, height: 20 }} />}
          placeholder="Search..."
        />
      </View>
    </ThemeProvider>
  );
}
