import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../../services/api';

const ResolveIssueScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { issueId } = route.params || {};
  const [issue, setIssue] = useState(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (issueId) {
      fetchIssue();
    }
  }, [issueId]);

  const fetchIssue = async () => {
    try {
      const response = await apiService.getIssue(issueId);
      setIssue(response.issue || response);
    } catch (error) {
      console.error('Error fetching issue:', error);
      Alert.alert('Error', 'Failed to load issue details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!resolutionNotes.trim()) {
      Alert.alert('Error', 'Please provide resolution notes');
      return;
    }

    setSubmitting(true);
    try {
      await apiService.resolveIssue(issueId, {
        resolutionNotes: resolutionNotes.trim(),
      });
      Alert.alert('Success', 'Issue resolved successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to resolve issue');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1e4359" />
        <Text style={styles.loadingText}>Loading issue...</Text>
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
      {/* Issue Details */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Issue Details</Text>
        <View style={styles.card}>
          <Text style={styles.title}>{issue.title}</Text>
          <Text style={styles.description}>{issue.description}</Text>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={18} color="#64748b" />
              <Text style={styles.detailText}>
                {issue.location?.name || 'Location not specified'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="folder" size={18} color="#64748b" />
              <Text style={styles.detailText}>{issue.category || 'N/A'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Ionicons name="flag" size={18} color="#64748b" />
              <Text style={styles.detailText}>
                Priority: {(issue.priority || 'medium').toUpperCase()}
              </Text>
            </View>
          </View>

          {issue.imageUrl && (
            <Image source={{ uri: issue.imageUrl }} style={styles.issueImage} />
          )}
        </View>
      </View>

      {/* Resolution Form */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resolution Notes *</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Describe how the issue was resolved..."
          value={resolutionNotes}
          onChangeText={setResolutionNotes}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        <Text style={styles.hint}>
          Please provide detailed notes about how this issue was resolved.
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.resolveButton, submitting && styles.buttonDisabled]}
          onPress={handleResolve}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark-done" size={20} color="#fff" />
              <Text style={styles.resolveButtonText}>Resolve Issue</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
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
  section: {
    padding: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
    marginBottom: 15,
  },
  details: {
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  issueImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginTop: 10,
  },
  textArea: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#1e293b',
    minHeight: 150,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 8,
  },
  actions: {
    padding: 15,
    paddingBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    gap: 8,
  },
  resolveButton: {
    backgroundColor: '#3b82f6',
  },
  resolveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f1f5f9',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ResolveIssueScreen;
