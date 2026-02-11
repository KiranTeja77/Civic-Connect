import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CitizenTabNavigator from './CitizenTabNavigator';
import ReportIssueScreen from '../screens/citizen/ReportIssueScreen';
import IssueDetailScreen from '../screens/common/IssueDetailScreen';

const Stack = createStackNavigator();

const CitizenStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="CitizenTabs" component={CitizenTabNavigator} />
      <Stack.Screen
        name="ReportIssue"
        component={ReportIssueScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="IssueDetail"
        component={IssueDetailScreen}
        options={{
          headerShown: true,
          title: 'Issue Details',
          headerStyle: {
            backgroundColor: '#1e4359',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
};

export default CitizenStackNavigator;

