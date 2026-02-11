import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';

const CitizenDashboardScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [nearbyIssues, setNearbyIssues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNearbyIssues();
  }, []);

  const fetchNearbyIssues = async () => {
    try {
      const response = await apiService.getIssues({ limit: 5 });
      setNearbyIssues(response.issues || []);
    } catch (error) {
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {user?.name || 'User'}!</Text>
        <Text style={styles.subtitle}>Report your issue today</Text>
      </View>

      <TouchableOpacity
        style={styles.actionCard}
        onPress={() => {
          // Navigate to ReportIssue in the parent stack
          navigation.getParent()?.navigate('ReportIssue');
        }}
      >
        <View style={styles.actionIcon}>
          <Ionicons name="add-circle" size={32} color="#1e4359" />
        </View>
        <View style={styles.actionContent}>
          <Text style={styles.actionTitle}>Report New Issue</Text>
          <Text style={styles.actionSubtitle}>Report a civic issue in your area</Text>
        </View>
        <Ionicons name="chevron-forward" size={24} color="#94a3b8" />
      </TouchableOpacity>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Map')}
          >
            <Ionicons name="map" size={24} color="#1e4359" />
            <Text style={styles.quickActionText}>Map View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('MyReports')}
          >
            <Ionicons name="document-text" size={24} color="#1e4359" />
            <Text style={styles.quickActionText}>My Reports</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Leaderboard')}
          >
            <Ionicons name="trophy" size={24} color="#1e4359" />
            <Text style={styles.quickActionText}>Leaderboard</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Issues</Text>
        {loading ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : nearbyIssues.length === 0 ? (
          <Text style={styles.emptyText}>No recent issues</Text>
        ) : (
          nearbyIssues.map((issue) => (
            <TouchableOpacity
              key={issue._id}
              style={styles.issueCard}
              onPress={() => navigation.navigate('IssueDetail', { issueId: issue._id })}
            >
              <View style={styles.issueContent}>
                <Text style={styles.issueTitle}>{issue.title}</Text>
                <Text style={styles.issueLocation}>{issue.location?.name || 'Location not specified'}</Text>
                <Text style={styles.issueStatus}>Status: {issue.status}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    margin: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    marginRight: 15,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 5,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 15,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  quickAction: {
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    width: '30%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  quickActionText: {
    marginTop: 8,
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
  },
  issueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  issueContent: {
    flex: 1,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 5,
  },
  issueLocation: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 3,
  },
  issueStatus: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  loadingText: {
    textAlign: 'center',
    color: '#64748b',
    padding: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#64748b',
    padding: 20,
  },
});

export default CitizenDashboardScreen;

