import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';

const EmployeeDashboardScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchIssues();
    const interval = setInterval(fetchIssues, 20000);
    return () => clearInterval(interval);
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await apiService.getAssignedIssues();
      const data = response.issues || response.data?.issues || [];
      setIssues(data);
    } catch (error) {
      console.error('Error fetching issues:', error);
      Alert.alert('Error', 'Failed to load issues');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchIssues();
  };

  const handleAcceptIssue = async (issueId) => {
    try {
      await apiService.acceptIssue(issueId);
      Alert.alert('Success', 'Issue accepted successfully');
      fetchIssues();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to accept issue');
    }
  };

  const handleResolveIssue = async (issueId) => {
    try {
      await apiService.resolveIssue(issueId, {});
      Alert.alert('Success', 'Issue resolved successfully');
      fetchIssues();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to resolve issue');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved':
        return '#10b981';
      case 'in-progress':
        return '#3b82f6';
      case 'assigned':
        return '#f59e0b';
      case 'reported':
        return '#64748b';
      default:
        return '#64748b';
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (selectedStatus === 'all') return true;
    if (selectedStatus === 'in-progress') {
      return issue.status === 'in-progress' || issue.status === 'escalated';
    }
    return issue.status === selectedStatus;
  });

  if (loading && issues.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e4359" />
        <Text style={styles.loadingText}>Loading issues...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Employee Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome, {user?.name || user?.employeeId || 'Employee'}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Status Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.statusFilters}
        contentContainerStyle={styles.statusFiltersContent}
      >
        {['all', 'reported', 'assigned', 'in-progress', 'resolved'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.statusFilter,
              selectedStatus === status && styles.statusFilterActive,
            ]}
            onPress={() => setSelectedStatus(status)}
          >
            <Text
              style={[
                styles.statusFilterText,
                selectedStatus === status && styles.statusFilterTextActive,
              ]}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Issues List */}
      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {filteredIssues.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color="#94a3b8" />
            <Text style={styles.emptyText}>No issues found</Text>
            <Text style={styles.emptySubtext}>
              {selectedStatus === 'all'
                ? 'No issues assigned to you yet'
                : `No ${selectedStatus} issues`}
            </Text>
          </View>
        ) : (
          filteredIssues.map((issue) => {
            const canAccept = (issue.status === 'reported' || issue.status === 'assigned') && !issue.acceptedBy;
            const canResolve = issue.status === 'in-progress' && issue.acceptedBy?._id === user?.id;
            const isAcceptedByAnother = issue.status === 'in-progress' && issue.acceptedBy && issue.acceptedBy._id !== user?.id;

            return (
              <View key={issue._id} style={styles.issueCard}>
                <View style={styles.issueHeader}>
                  <Text style={styles.issueTitle} numberOfLines={2}>
                    {issue.title}
                  </Text>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(issue.status) + '20' },
                    ]}
                  >
                    <Text
                      style={[styles.statusText, { color: getStatusColor(issue.status) }]}
                    >
                      {issue.status?.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <Text style={styles.issueDescription} numberOfLines={3}>
                  {issue.description}
                </Text>

                <View style={styles.issueDetails}>
                  <View style={styles.detailRow}>
                    <Ionicons name="location" size={16} color="#64748b" />
                    <Text style={styles.detailText}>
                      {issue.location?.name || 'Location not specified'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Ionicons name="folder" size={16} color="#64748b" />
                    <Text style={styles.detailText}>{issue.category || 'N/A'}</Text>
                  </View>
                </View>

                {isAcceptedByAnother && (
                  <View style={styles.acceptedByAnother}>
                    <Ionicons name="person" size={16} color="#f59e0b" />
                    <Text style={styles.acceptedByAnotherText}>
                      Accepted by {issue.acceptedBy.name || 'another employee'}
                    </Text>
                  </View>
                )}

                <View style={styles.issueActions}>
                  <TouchableOpacity
                    style={styles.viewButton}
                    onPress={() => navigation.navigate('ResolveIssue', { issueId: issue._id })}
                  >
                    <Text style={styles.viewButtonText}>View Details</Text>
                  </TouchableOpacity>

                  {canAccept && (
                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptIssue(issue._id)}
                    >
                      <Ionicons name="checkmark-circle" size={18} color="#fff" />
                      <Text style={styles.acceptButtonText}>Accept</Text>
                    </TouchableOpacity>
                  )}

                  {canResolve && (
                    <TouchableOpacity
                      style={styles.resolveButton}
                      onPress={() => navigation.navigate('ResolveIssue', { issueId: issue._id })}
                    >
                      <Ionicons name="checkmark-done" size={18} color="#fff" />
                      <Text style={styles.resolveButtonText}>Resolve</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#64748b',
  },
  header: {
    backgroundColor: '#1e4359',
    padding: 20,
    paddingTop: 50,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#cbd5e1',
    marginTop: 4,
  },
  logoutButton: {
    padding: 5,
  },
  statusFilters: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statusFiltersContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  statusFilter: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    marginRight: 10,
  },
  statusFilterActive: {
    backgroundColor: '#1e4359',
  },
  statusFilterText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  statusFilterTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 15,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 5,
  },
  issueCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  issueTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  issueDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  issueDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 8,
  },
  acceptedByAnother: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef3c7',
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  acceptedByAnotherText: {
    fontSize: 12,
    color: '#92400e',
    marginLeft: 6,
    fontWeight: '500',
  },
  issueActions: {
    flexDirection: 'row',
    gap: 10,
  },
  viewButton: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e4359',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#10b981',
    borderRadius: 8,
    gap: 6,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  resolveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    gap: 6,
  },
  resolveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default EmployeeDashboardScreen;
