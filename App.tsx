import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider, useAuth } from './context/AuthContext';
import { View, ActivityIndicator } from 'react-native';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

// Auth Screens
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

// Common Screens
import DashboardScreen from './screens/DashboardScreen';
import ProfileScreen from './screens/ProfileScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import SettingsScreen from './screens/SettingsScreen';

// Student Screens
import AttendanceScreen from './screens/student/AttendanceScreen';
import AssignmentScreen from './screens/student/AssignmentScreen';

// Teacher Screens
import AttendanceManager from './screens/teacher/AttendanceManager';
import AssignmentManager from './screens/teacher/AssignmentManager';
import MarksReviewManager from './screens/teacher/MarksReviewManager';

// Admin Screens
import UserManagement from './screens/admin/UserManagement';
import ReportsScreen from './screens/admin/ReportsScreen';

const Stack = createStackNavigator();

function Navigation() {
  const { session, role, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
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
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{
                title: 'Reset Password',
                headerBackTitle: 'Back'
              }}
            />
          </>
        ) : (
          // Authenticated Users - Role-based Stacks
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />

            {/* Common Screens */}
            <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
            <Stack.Screen name="Notifications" component={NotificationsScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />

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
      <PaperProvider>
        <ToastProvider>
          <AuthProvider>
            <Navigation />
          </AuthProvider>
        </ToastProvider>
      </PaperProvider>
    </ErrorBoundary>
  );
}
