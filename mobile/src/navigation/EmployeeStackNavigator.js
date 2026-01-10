import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import EmployeeDashboardScreen from '../screens/employee/DashboardScreen';
import EmployeeProfileScreen from '../screens/employee/ProfileScreen';
import ResolveIssueScreen from '../screens/employee/ResolveIssueScreen';
import IssueDetailScreen from '../screens/common/IssueDetailScreen';

const Stack = createStackNavigator();

const EmployeeStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#1e4359',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="EmployeeDashboard"
        component={EmployeeDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EmployeeProfile"
        component={EmployeeProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen
        name="ResolveIssue"
        component={ResolveIssueScreen}
        options={{ title: 'Resolve Issue' }}
      />
      <Stack.Screen
        name="IssueDetail"
        component={IssueDetailScreen}
        options={{ title: 'Issue Details' }}
      />
    </Stack.Navigator>
  );
};

export default EmployeeStackNavigator;

