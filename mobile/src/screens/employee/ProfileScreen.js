import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmployeeProfileScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Employee Profile Screen</Text>
      <Text style={styles.subtext}>Coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  text: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  subtext: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748b',
  },
});

export default EmployeeProfileScreen;

