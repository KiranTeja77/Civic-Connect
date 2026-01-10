import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';

const IssueDetailScreen = () => {
  const route = useRoute();
  const { issueId } = route.params || {};
  const { user, isAdmin } = useAuth();
  const [issue, setIssue] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (issueId) {
      fetchIssueDetail();
    }
  }, [issueId]);

  const fetchIssueDetail = async () => {
    try {
      const response = await apiService.getIssue(issueId);
      setIssue(response.issue || response);
    } catch (error) {
      console.error('Error fetching issue:', error);
      Alert.alert('Error', 'Failed to load issue details');
    } finally {
      setLoading(false);
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e4359" />
        <Text style={styles.loadingText}>Loading issue details...</Text>
      </View>
    );
  }

  if (!issue) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#94a3b8" />
        <Text style={styles.emptyText}>Issue not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {issue.imageUrl && (
        <Image source={{ uri: issue.imageUrl }} style={styles.image} />
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{issue.title}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(issue.status) + '20' },
            ]}
          >
            <Text
              style={[styles.statusText, { color: getStatusColor(issue.status) }]}
            >
              {issue.status?.toUpperCase() || 'REPORTED'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{issue.description}</Text>
        </View>

        <View style={styles.details}>
          <View style={styles.detailRow}>
            <Ionicons name="folder" size={20} color="#64748b" />
            <Text style={styles.detailLabel}>Category:</Text>
            <Text style={styles.detailValue}>{issue.category || 'N/A'}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="flag" size={20} color="#64748b" />
            <Text style={styles.detailLabel}>Priority:</Text>
            <Text style={styles.detailValue}>
              {(issue.priority || 'medium').toUpperCase()}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color="#64748b" />
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>
              {issue.location?.name || 'Not specified'}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={20} color="#64748b" />
            <Text style={styles.detailLabel}>Reported:</Text>
            <Text style={styles.detailValue}>{formatDate(issue.createdAt)}</Text>
          </View>

          {issue.assignedTo && (
            <View style={styles.detailRow}>
              <Ionicons name="person" size={20} color="#64748b" />
              <Text style={styles.detailLabel}>Assigned to:</Text>
              <Text style={styles.detailValue}>
                {issue.assignedTo.name || issue.assignedTo.employeeId || 'N/A'}
              </Text>
            </View>
          )}

          {issue.resolvedAt && (
            <View style={styles.detailRow}>
              <Ionicons name="checkmark-circle" size={20} color="#10b981" />
              <Text style={styles.detailLabel}>Resolved:</Text>
              <Text style={styles.detailValue}>
                {formatDate(issue.resolvedAt)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginTop: 20,
  },
  image: {
    width: '100%',
    height: 250,
    backgroundColor: '#e2e8f0',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
  },
  details: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    marginLeft: 10,
    marginRight: 10,
    minWidth: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#1e293b',
    flex: 1,
  },
});

export default IssueDetailScreen;
