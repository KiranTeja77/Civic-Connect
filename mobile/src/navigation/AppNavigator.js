import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../context/AuthContext';

// Auth Screens
import WelcomeScreen from '../screens/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import AdminLoginScreen from '../screens/auth/AdminLoginScreen';
import EmployeeLoginScreen from '../screens/auth/EmployeeLoginScreen';

// Citizen Screens
import CitizenStackNavigator from './CitizenStackNavigator';

// Admin Screens
import AdminStackNavigator from './AdminStackNavigator';

// Employee Screens
import EmployeeStackNavigator from './EmployeeStackNavigator';

// Common Screens
import IssueDetailScreen from '../screens/common/IssueDetailScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const { user, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    // Return a loading screen component
    return null; // You can add a LoadingScreen component here
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        // Not authenticated - show auth screens
        <>
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="AdminLogin" component={AdminLoginScreen} />
          <Stack.Screen name="EmployeeLogin" component={EmployeeLoginScreen} />
        </>
      ) : isAdmin ? (
        // Admin user - show admin navigator
        <Stack.Screen name="Admin" component={AdminStackNavigator} />
      ) : user.role === 'employee' ? (
        // Employee user - show employee navigator
        <Stack.Screen name="Employee" component={EmployeeStackNavigator} />
      ) : (
        // Regular citizen user - show citizen stack (includes tabs + ReportIssue)
        <Stack.Screen name="Citizen" component={CitizenStackNavigator} />
      )}
      {/* Common screens accessible from anywhere */}
      <Stack.Screen name="IssueDetail" component={IssueDetailScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
