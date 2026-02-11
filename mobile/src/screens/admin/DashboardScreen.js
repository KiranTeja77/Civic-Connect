import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';

const AdminDashboardScreen = () => {
  const navigation = useNavigation();
  const { user, logout } = useAuth();
  const [selectedView, setSelectedView] = useState('overview');
  const [stats, setStats] = useState(null);
  const [issues, setIssues] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignModal, setAssignModal] = useState({ visible: false, issueId: null });

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await apiService.getAdminDashboard();
      const data = response.data || response;
      setStats(data.stats || {});
      setIssues(data.recentIssues || []);
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  const handleAssignIssue = async (issueId, employeeId) => {
    try {
      await apiService.assignIssue(issueId, employeeId);
      Alert.alert('Success', 'Issue assigned successfully');
      setAssignModal({ visible: false, issueId: null });
      fetchDashboardData();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to assign issue');
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
    const matchesSearch = issue.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      issue.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading && !stats) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e4359" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Welcome, {user?.name || 'Admin'}</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, selectedView === 'overview' && styles.tabActive]}
          onPress={() => setSelectedView('overview')}
        >
          <Text style={[styles.tabText, selectedView === 'overview' && styles.tabTextActive]}>
            Overview
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedView === 'issues' && styles.tabActive]}
          onPress={() => setSelectedView('issues')}
        >
          <Text style={[styles.tabText, selectedView === 'issues' && styles.tabTextActive]}>
            Issues
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedView === 'analytics' && styles.tabActive]}
          onPress={() => setSelectedView('analytics')}
        >
          <Text style={[styles.tabText, selectedView === 'analytics' && styles.tabTextActive]}>
            Analytics
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {selectedView === 'overview' && (
          <View style={styles.overview}>
            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="document-text" size={32} color="#3b82f6" />
                <Text style={styles.statValue}>{stats?.totalIssues || 0}</Text>
                <Text style={styles.statLabel}>Total Issues</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="checkmark-circle" size={32} color="#10b981" />
                <Text style={styles.statValue}>{stats?.resolvedIssues || 0}</Text>
                <Text style={styles.statLabel}>Resolved</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="time" size={32} color="#f59e0b" />
                <Text style={styles.statValue}>{stats?.pendingIssues || 0}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <Ionicons name="people" size={32} color="#8b5cf6" />
                <Text style={styles.statValue}>{employees.length}</Text>
                <Text style={styles.statLabel}>Employees</Text>
              </View>
            </View>

            {/* Recent Issues */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Issues</Text>
              {issues.slice(0, 5).map((issue) => (
                <TouchableOpacity
                  key={issue._id}
                  style={styles.issueCard}
                  onPress={() => navigation.navigate('IssueDetail', { issueId: issue._id })}
                >
                  <View style={styles.issueHeader}>
                    <Text style={styles.issueTitle} numberOfLines={1}>
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
                  <Text style={styles.issueLocation} numberOfLines={1}>
                    {issue.location?.name || 'Location not specified'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {selectedView === 'issues' && (
          <View style={styles.issuesView}>
            {/* Filters */}
            <View style={styles.filters}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#64748b" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search issues..."
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                />
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusFilters}>
                {['all', 'reported', 'assigned', 'in-progress', 'resolved'].map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusFilter,
                      statusFilter === status && styles.statusFilterActive,
                    ]}
                    onPress={() => setStatusFilter(status)}
                  >
                    <Text
                      style={[
                        styles.statusFilterText,
                        statusFilter === status && styles.statusFilterTextActive,
                      ]}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Issues List */}
            {filteredIssues.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="document-text-outline" size={64} color="#94a3b8" />
                <Text style={styles.emptyText}>No issues found</Text>
              </View>
            ) : (
              filteredIssues.map((issue) => (
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
                  <Text style={styles.issueDescription} numberOfLines={2}>
                    {issue.description}
                  </Text>
                  <Text style={styles.issueLocation}>
                    📍 {issue.location?.name || 'Location not specified'}
                  </Text>
                  <View style={styles.issueActions}>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => navigation.navigate('IssueDetail', { issueId: issue._id })}
                    >
                      <Text style={styles.actionButtonText}>View Details</Text>
                    </TouchableOpacity>
                    {issue.status === 'reported' && (
                      <TouchableOpacity
                        style={[styles.actionButton, styles.assignButton]}
                        onPress={() => setAssignModal({ visible: true, issueId: issue._id })}
                      >
                        <Text style={[styles.actionButtonText, styles.assignButtonText]}>
                          Assign
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {selectedView === 'analytics' && (
          <View style={styles.analyticsView}>
            <Text style={styles.sectionTitle}>Analytics</Text>
            <Text style={styles.comingSoon}>Analytics charts coming soon...</Text>
          </View>
        )}
      </ScrollView>

      {/* Assign Modal */}
      {assignModal.visible && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Assign Issue</Text>
            <Text style={styles.modalSubtitle}>Select an employee to assign this issue to:</Text>
            <ScrollView style={styles.employeeList}>
              {employees.map((employee) => (
                <TouchableOpacity
                  key={employee._id}
                  style={styles.employeeItem}
                  onPress={() => handleAssignIssue(assignModal.issueId, employee._id)}
                >
                  <Text style={styles.employeeName}>{employee.name || employee.employeeId}</Text>
                  <Text style={styles.employeeDepartment}>{employee.department || 'N/A'}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setAssignModal({ visible: false, issueId: null })}
            >
              <Text style={styles.modalCloseButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#1e4359',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#64748b',
  },
  tabTextActive: {
    color: '#1e4359',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  overview: {
    padding: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e293b',
    marginTop: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 5,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 15,
  },
  issueCard: {
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
  issueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  issueTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  issueDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 8,
  },
  issueLocation: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 10,
  },
  issueActions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1e4359',
  },
  assignButton: {
    backgroundColor: '#1e4359',
  },
  assignButtonText: {
    color: '#fff',
  },
  issuesView: {
    padding: 15,
  },
  filters: {
    marginBottom: 15,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1e293b',
  },
  statusFilters: {
    marginTop: 10,
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 10,
  },
  analyticsView: {
    padding: 20,
  },
  comingSoon: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 20,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 15,
  },
  employeeList: {
    maxHeight: 300,
  },
  employeeItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  employeeDepartment: {
    fontSize: 14,
    color: '#64748b',
  },
  modalCloseButton: {
    marginTop: 15,
    padding: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e4359',
  },
});

export default AdminDashboardScreen;
