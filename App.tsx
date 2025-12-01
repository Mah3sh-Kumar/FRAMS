import 'react-native-gesture-handler';
import React, { useEffect, useRef, lazy, Suspense } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './lib/types';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from './context/AuthContext';
import { View, ActivityIndicator, Linking } from 'react-native';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';
import { paperTheme } from './lib/theme';
import { parseDeepLink } from './lib/deeplink';
import type { NavigationContainerRef } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './lib/design-system/ThemeContext';

// Auth Screens - Load immediately (needed for initial render)
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import EmailVerificationScreen from './screens/EmailVerificationScreen';
import UnverifiedScreen from './screens/UnverifiedScreen';

// Common Screens - Load immediately
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SettingsScreen from './screens/SettingsScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import TermsScreen from './screens/TermsScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';

// Student Screens - Load immediately
import AttendanceScreen from './screens/student/AttendanceScreen';
import AssignmentScreen from './screens/student/AssignmentScreen';

// Teacher Screens - Load immediately
import AttendanceManager from './screens/teacher/AttendanceManager';
import AssignmentManager from './screens/teacher/AssignmentManager';
import MarksReviewManager from './screens/teacher/MarksReviewManager';

// Admin Screens - Load immediately
import UserManagement from './screens/admin/UserManagement';
import ReportsScreen from './screens/admin/ReportsScreen';

const Stack = createStackNavigator<RootStackParamList>();

function Navigation() {
  const { session, role, isVerified, loading } = useAuth();
  const { setRole: setThemeRole } = useTheme();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);

  // Sync role from AuthContext to ThemeContext
  useEffect(() => {
    if (role) {
      setThemeRole(role as 'student' | 'teacher' | 'admin');
    } else {
      setThemeRole(null);
    }
  }, [role, setThemeRole]);

  useEffect(() => {
    // Handle deep links when app is already open
    const handleDeepLink = (event: { url: string }) => {
      handleUrl(event.url);
    };

    // Get initial URL (when app opens from a link)
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleUrl(url);
      }
    });

    // Listen for deep links while app is open
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleUrl = (url: string) => {
    const parsed = parseDeepLink(url);

    if (!parsed) {
      console.error('Failed to parse deep link:', url);
      return;
    }

    // Handle password reset deep link
    if (parsed.route === 'reset-password') {
      const token = parsed.params.token;
      if (token && navigationRef.current) {
        navigationRef.current.navigate('ResetPassword', { token });
      } else {
        // No token, redirect to forgot password
        if (navigationRef.current) {
          navigationRef.current.navigate('ForgotPassword');
        }
      }
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        {!session || !session.user ? (
          // Auth Stack - Unauthenticated Users
          <>
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{
                title: 'Create Account',
                headerBackTitle: 'Back'
              }}
            />
            <Stack.Screen
              name="EmailVerification"
              component={EmailVerificationScreen}
              options={{
                title: 'Verify Email',
                headerBackTitle: 'Back'
              }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{
                title: 'Reset Password',
                headerBackTitle: 'Back'
              }}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
              options={{
                title: 'Set New Password',
                headerBackTitle: 'Back'
              }}
            />
          </>
        ) : !isVerified && role !== 'admin' ? (
          // Authenticated but Unverified Users (except admins)
          <>
            <Stack.Screen 
              name="Unverified" 
              component={UnverifiedScreen} 
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // Authenticated and Verified Users - Role-based Stacks
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />

            {/* Common Screens */}
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
            <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ title: 'Privacy Policy' }} />
            <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Terms of Service' }} />
            <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password' }} />

            {/* Student Stack */}
            {role === 'student' && (
              <>
                <Stack.Screen name="Attendance" component={AttendanceScreen} />
                <Stack.Screen name="Assignments" component={AssignmentScreen} />
              </>
            )}

            {/* Teacher Stack */}
            {role === 'teacher' && (
              <>
                <Stack.Screen name="AttendanceManager" component={AttendanceManager} />
                <Stack.Screen name="AssignmentManager" component={AssignmentManager} />
                <Stack.Screen name="MarksReviewManager" component={MarksReviewManager} />
              </>
            )}

            {/* Admin Stack */}
            {role === 'admin' && (
              <>
                <Stack.Screen name="UserManagement" component={UserManagement} />
                <Stack.Screen name="Reports" component={ReportsScreen} />
              </>
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <PaperProvider theme={paperTheme}>
          <ToastProvider>
            <AuthProvider>
              <Navigation />
            </AuthProvider>
          </ToastProvider>
        </PaperProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
